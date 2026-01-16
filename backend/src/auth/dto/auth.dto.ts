import { IsEmail, IsString, IsOptional, MinLength, IsNotEmpty } from 'class-validator';

/**
 * Sign Up DTO
 */
export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  occupation?: string; // e.g., "student", "professional", "retired", "teacher", etc.
}

/**
 * Sign In DTO
 */
export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

/**
 * Google Sign Up/Sign In DTO
 */
export class GoogleSignUpDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string; // Google OAuth access token

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  occupation?: string;
}

/**
 * Forgot Password DTO
 */
export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

/**
 * Reset Password DTO
 */
export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(6)
  password: string;
}

/**
 * Confirm Email DTO
 */
export class ConfirmEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

/**
 * User Response DTO
 */
export class UserResponseDto {
  id: string;
  email: string;
  name?: string | null;
  occupation?: string | null;
  emailVerified?: boolean;
}

