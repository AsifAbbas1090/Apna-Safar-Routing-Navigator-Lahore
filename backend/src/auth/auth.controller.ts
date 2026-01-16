import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto, GoogleSignUpDto, UserResponseDto, ForgotPasswordDto, ResetPasswordDto, ConfirmEmailDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Auth Controller
 * Handles authentication endpoints
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Sign up with email and password
   * POST /auth/signup
   */
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    const result = await this.authService.signUp(signUpDto);
    return {
      message: 'User created successfully',
      user: result.user,
      accessToken: result.session?.access_token,
      refreshToken: result.session?.refresh_token,
    };
  }

  /**
   * Sign in with email and password
   * POST /auth/signin
   */
  @Post('signin')
  async signIn(@Body() signInDto: SignInDto) {
    const result = await this.authService.signIn(signInDto);
    return {
      message: 'Sign in successful',
      user: result.user,
      accessToken: result.session?.access_token,
      refreshToken: result.session?.refresh_token,
    };
  }

  /**
   * Sign up/Sign in with Google
   * POST /auth/google
   */
  @Post('google')
  async googleAuth(@Body() googleSignUpDto: GoogleSignUpDto) {
    const result = await this.authService.googleAuth(googleSignUpDto);
    return {
      message: 'Google authentication successful',
      user: result.user,
      accessToken: result.session?.access_token,
      refreshToken: result.session?.refresh_token,
    };
  }

  /**
   * Confirm email address
   * POST /auth/confirm-email
   */
  @Post('confirm-email')
  async confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto) {
    return this.authService.confirmEmail(confirmEmailDto);
  }

  /**
   * Forgot password - send reset email
   * POST /auth/forgot-password
   */
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  /**
   * Reset password with token
   * POST /auth/reset-password
   */
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * Get current user profile
   * GET /auth/me
   * Protected route - requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req): Promise<UserResponseDto> {
    return {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      occupation: req.user.occupation,
      emailVerified: req.user.emailVerified,
    };
  }

  /**
   * Health check for auth service
   * GET /auth/health
   */
  @Get('health')
  healthCheck() {
    return { status: 'ok', service: 'auth' };
  }
}

