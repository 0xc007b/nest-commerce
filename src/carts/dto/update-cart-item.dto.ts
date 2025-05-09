import { IsInt, IsOptional, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateCartItemDto } from './create-cart-item.dto';

export class UpdateCartItemDto extends PartialType(CreateCartItemDto) {
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}