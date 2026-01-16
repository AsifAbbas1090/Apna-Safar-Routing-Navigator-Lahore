import { IsInt, IsString, IsOptional, Min, Max, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  comment: string;

  @IsString()
  @IsOptional()
  serviceType?: string; // e.g., "AI Navigation", "Route Planning", "General"
}

export class UpdateReviewDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comment?: string;
}

