import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto, SignInDto, GoogleSignUpDto } from './dto/auth.dto';

/**
 * Auth Service
 * Handles authentication using Supabase Auth
 * Manages user profiles in our database
 */
@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
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
  }

  /**
   * Sign up with email and password
   */
  async signUp(signUpDto: SignUpDto) {
    const { email, password, name, occupation } = signUpDto;

    try {
      // Check if Supabase client is initialized
      if (!this.supabase) {
        throw new UnauthorizedException('Authentication service not configured. Please check Supabase configuration.');
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
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
          name: authError.name,
        });
        
        // Handle specific Supabase errors
        if (authError.message.includes('already registered') || 
            authError.message.includes('already exists') ||
            authError.message.includes('User already registered')) {
          throw new ConflictException('Email already registered');
        }
        
        if (authError.message.includes('Invalid API key') || 
            authError.message.includes('JWT') ||
            authError.message.includes('Invalid credentials') ||
            authError.status === 401 ||
            authError.status === 403) {
          console.error('⚠️ Supabase API key issue detected.');
          console.error('⚠️ Current key type: Publishable/Anon key');
          console.error('⚠️ For backend operations, you need SUPABASE_SERVICE_ROLE_KEY');
          console.error('⚠️ Get it from: Supabase Dashboard → Settings → API → service_role key');
          throw new UnauthorizedException('Authentication service configuration error. Please check SUPABASE_AUTH_SETUP.md for instructions.');
        }
        
        throw new UnauthorizedException(authError.message || 'Sign up failed. Please try again.');
      }

      if (!authData.user) {
        throw new UnauthorizedException('Failed to create user - no user data returned');
      }

      // Create user profile in our database
      const user = await this.prisma.user.create({
        data: {
          email,
          name,
          occupation,
          supabaseUserId: authData.user.id,
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          occupation: user.occupation,
        },
        session: authData.session,
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Sign up failed');
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

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
      
      if (authError.message.includes('Invalid API key') || 
          authError.message.includes('JWT') ||
          authError.message.includes('Invalid credentials') ||
          authError.status === 401 ||
          authError.status === 403) {
        console.error('⚠️ Supabase API key issue detected.');
        console.error('⚠️ For backend operations, you need SUPABASE_SERVICE_ROLE_KEY');
        throw new UnauthorizedException('Authentication service configuration error. Please check SUPABASE_AUTH_SETUP.md for instructions.');
      }
      
      throw new UnauthorizedException(authError.message || 'Sign in failed. Please try again.');
    }

    if (!authData.user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Get user profile from our database
    const user = await this.prisma.user.findUnique({
      where: { supabaseUserId: authData.user.id },
    });

    if (!user) {
      // User exists in Supabase but not in our DB - create profile
      const newUser = await this.prisma.user.create({
        data: {
          email: authData.user.email!,
          name: authData.user.user_metadata?.name,
          occupation: authData.user.user_metadata?.occupation,
          supabaseUserId: authData.user.id,
        },
      });

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          occupation: newUser.occupation,
        },
        session: authData.session,
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        occupation: user.occupation,
      },
      session: authData.session,
    };
  }

  /**
   * Sign up/Sign in with Google
   */
  async googleAuth(googleSignUpDto: GoogleSignUpDto) {
    const { accessToken, name, occupation } = googleSignUpDto;

    try {
      // Verify Google token and get user info
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

