import { PartialType } from '@nestjs/swagger';
import { CreateProductVariantDto } from './create-product-variant.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateProductVariantDto extends PartialType(CreateProductVariantDto) {
  @IsNumber()
  @IsOptional()
  id?: number;
}