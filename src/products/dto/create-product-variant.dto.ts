import { IsString, IsNumber, IsInt, IsOptional, Min } from 'class-validator';

export class CreateProductVariantDto {
    id?: number;

    @IsString()
    sku: string;

    @IsString()
    @IsOptional()
    size?: string;

    @IsString()
    @IsOptional()
    color?: string;

    @IsString()
    @IsOptional()
    material?: string;

    @IsNumber()
    @IsOptional()
    priceOverride?: number;

    @IsInt()
    @Min(0)
    stockQuantity: number = 0;
}