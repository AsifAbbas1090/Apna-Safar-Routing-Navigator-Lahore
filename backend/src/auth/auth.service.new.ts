import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { SignUpDto, SignInDto, GoogleSignUpDto, ForgotPasswordDto, ResetPasswordDto, ConfirmEmailDto } from './dto/auth.dto';
import * as crypto from 'crypto';

/**
 * Auth Service
 * Handles authentication using Supabase Auth
 * Manages user profiles in our database
 * Includes email confirmation and password reset
 */
@Injectable()
export class AuthService {
  private supabase: SupabaseClient;
  private frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {
    // Initialize Supabase client
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || 
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      this.configService.get<string>('SUPABASE_ANON_KEY') ||
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase configuration missing!');
      console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)');
      throw new Error('Supabase URL and key must be configured. Please check your .env file.');
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      console.log('✅ Supabase client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error);
      throw new Error('Failed to initialize Supabase client. Please check your configuration.');
    }

    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  /**
   * Sign up with email and password
   * Sends confirmation email
   */
  async signUp(signUpDto: SignUpDto) {
    const { email, password, name, occupation } = signUpDto;

    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${this.frontendUrl}/auth/confirm-email`,
          data: {
            name,
            occupation,
          },
        },
      });

      if (authError) {
        console.error('❌ Supabase signup error:', {
          message: authError.message,
          status: authError.status,
        });
        
        if (authError.message.includes('already registered') || 
            authError.message.includes('already exists') ||
            authError.message.includes('User already registered')) {
          throw new ConflictException('Email already registered');
        }
        
        throw new UnauthorizedException(authError.message || 'Sign up failed. Please try again.');
      }

      if (!authData.user) {
        throw new UnauthorizedException('Failed to create user - no user data returned');
      }

      // Generate email confirmation token
      const confirmationToken = crypto.randomBytes(32).toString('hex');
      const confirmationExpires = new Date();
      confirmationExpires.setHours(confirmationExpires.getHours() + 24); // 24 hours

      // Create user profile in our database
      const user = await this.prisma.user.create({
        data: {
          email,
          name,
          occupation,
          supabaseUserId: authData.user.id,
          emailVerified: false,
          resetPasswordToken: confirmationToken, // Reuse field for confirmation token
          resetPasswordExpires: confirmationExpires,
        },
      });

      // Send confirmation email
      const confirmationLink = `${this.frontendUrl}/auth/confirm-email?token=${confirmationToken}`;
      await this.emailService.sendConfirmationEmail(email, name || 'User', confirmationLink);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          occupation: user.occupation,
          emailVerified: user.emailVerified,
        },
        session: authData.session,
        message: 'User created successfully. Please check your email to confirm your account.',
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Sign up error:', error);
      throw new UnauthorizedException('Sign up failed');
    }
  }

  /**
   * Confirm email address
   */
  async confirmEmail(confirmEmailDto: ConfirmEmailDto) {
    const { token } = confirmEmailDto;

    try {
      const user = await this.prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired confirmation token');
      }

      // Update user as verified
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });

      return {
        message: 'Email confirmed successfully. You can now log in.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to confirm email');
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    try {
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('❌ Supabase signin error:', {
          message: authError.message,
          status: authError.status,
        });
        
        if (authError.message.includes('Invalid login credentials') ||
            authError.message.includes('Invalid email or password') ||
            authError.message.includes('Email not confirmed')) {
          throw new UnauthorizedException('Invalid email or password');
        }
        
        throw new UnauthorizedException(authError.message || 'Sign in failed. Please try again.');
      }

      if (!authData.user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Get user profile from our database
      let user = await this.prisma.user.findUnique({
        where: { supabaseUserId: authData.user.id },
      });

      if (!user) {
        // User exists in Supabase but not in our DB - create profile
        user = await this.prisma.user.create({
          data: {
            email: authData.user.email!,
            name: authData.user.user_metadata?.name,
            occupation: authData.user.user_metadata?.occupation,
            supabaseUserId: authData.user.id,
            emailVerified: authData.user.email_confirmed_at ? true : false,
          },
        });
      }

      // Check if email is verified
      if (!user.emailVerified) {
        throw new UnauthorizedException('Please confirm your email address before logging in. Check your inbox for the confirmation link.');
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          occupation: user.occupation,
          emailVerified: user.emailVerified,
        },
        session: authData.session,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Sign in failed');
    }
  }

  /**
   * Forgot password - send reset email
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if email exists for security
        return {
          message: 'If an account with that email exists, a password reset link has been sent.',
        };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour

      // Save reset token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetExpires,
        },
      });

      // Send reset email
      const resetLink = `${this.frontendUrl}/auth/reset-password?token=${resetToken}`;
      await this.emailService.sendPasswordResetEmail(email, user.name || 'User', resetLink);

      return {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    try {
      const user = await this.prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: {
            gt: new Date(),
          },
        },
      });

      if (!user || !user.supabaseUserId) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Update password in Supabase
      const { error: updateError } = await this.supabase.auth.admin.updateUserById(
        user.supabaseUserId,
        { password },
      );

      if (updateError) {
        console.error('Failed to update password in Supabase:', updateError);
        throw new BadRequestException('Failed to reset password');
      }

      // Clear reset token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });

      return {
        message: 'Password reset successfully. You can now log in with your new password.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to reset password');
    }
  }

  /**
   * Sign up/Sign in with Google
   */
  async googleAuth(googleSignUpDto: GoogleSignUpDto) {
    const { accessToken, name, occupation } = googleSignUpDto;

    try {
      const { data: authData, error: authError } = await this.supabase.auth.signInWithIdToken({
        provider: 'google',
        token: accessToken,
      });

      if (authError || !authData.user) {
        throw new UnauthorizedException('Google authentication failed');
      }

      // Check if user exists in our database
      let user = await this.prisma.user.findUnique({
        where: { supabaseUserId: authData.user.id },
      });

      if (!user) {
        // Create new user profile
        user = await this.prisma.user.create({
          data: {
            email: authData.user.email!,
            name: name || authData.user.user_metadata?.name || authData.user.user_metadata?.full_name,
            occupation: occupation,
            supabaseUserId: authData.user.id,
            emailVerified: true, // Google emails are pre-verified
          },
        });
      } else {
        // Update existing user if name/occupation provided
        if (name || occupation) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              ...(name && { name }),
              ...(occupation && { occupation }),
              emailVerified: true, // Ensure verified
            },
          });
        }
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          occupation: user.occupation,
          emailVerified: user.emailVerified,
        },
        session: authData.session,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  /**
   * Get user by Supabase user ID
   */
  async getUserBySupabaseId(supabaseUserId: string) {
    return this.prisma.user.findUnique({
      where: { supabaseUserId },
    });
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Verify Supabase session token
   */
  async verifySession(accessToken: string) {
    try {
      if (!this.supabase) {
        console.error('Supabase client not initialized');
        return null;
      }

      const { data, error } = await this.supabase.auth.getUser(accessToken);

      if (error) {
        console.error('Token verification error:', error.message);
        return null;
      }

      if (!data.user) {
        console.error('No user data returned from token verification');
        return null;
      }

      const user = await this.getUserBySupabaseId(data.user.id);
      if (!user) {
        console.error(`User not found in database for Supabase ID: ${data.user.id}`);
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error verifying session:', error);
      return null;
    }
  }
}

