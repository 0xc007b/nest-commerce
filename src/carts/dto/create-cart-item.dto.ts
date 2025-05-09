import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateCartItemDto {
  @IsNotEmpty()
  @IsInt()
  productVariantId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}