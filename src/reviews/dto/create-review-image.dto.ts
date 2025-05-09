import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateReviewImageDto {
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsOptional()
  altText?: string;

  @IsOptional()
  order?: number;
}