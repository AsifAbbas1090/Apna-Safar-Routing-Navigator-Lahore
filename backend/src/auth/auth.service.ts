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
      throw new Error('Supabase URL and key must be configured');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Sign up with email and password
   */
  async signUp(signUpDto: SignUpDto) {
    const { email, password, name, occupation } = signUpDto;

    try {
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
        if (authError.message.includes('already registered')) {
          throw new ConflictException('Email already registered');
        }
        throw new UnauthorizedException(authError.message);
      }

      if (!authData.user) {
        throw new UnauthorizedException('Failed to create user');
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

    if (authError || !authData.user) {
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
    const { data, error } = await this.supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      return null;
    }

    return this.getUserBySupabaseId(data.user.id);
  }
}

