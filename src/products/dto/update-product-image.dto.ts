import { PartialType } from '@nestjs/swagger';
import { CreateProductImageDto } from './create-product-image.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateProductImageDto extends PartialType(CreateProductImageDto) {
  @IsNumber()
  @IsOptional()
  id?: number;
}