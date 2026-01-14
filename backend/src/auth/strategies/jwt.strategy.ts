import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

/**
 * JWT Strategy
 * Validates JWT tokens from Supabase Auth
 * Note: Supabase JWT tokens are validated by verifying with Supabase API
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // For Supabase, we'll validate the token in the validate method
      // The secret here is just a placeholder - actual validation happens via Supabase API
      secretOrKey: configService.get<string>('SUPABASE_ANON_KEY') || 'placeholder',
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    // Extract token from request
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    // Verify token with Supabase and get user
    // This is the proper way to validate Supabase tokens
    const user = await this.authService.verifySession(token);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user;
  }
}

