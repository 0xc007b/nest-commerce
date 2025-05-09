import { IsString, IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class CreateProductImageDto {
    id?: number;
    
    @IsString()
    imageUrl: string;

    @IsString()
    @IsOptional()
    altText?: string;

    @IsBoolean()
    @IsOptional()
    isPrimary?: boolean = false;

    @IsInt()
    @IsOptional()
    @Min(0)
    order?: number = 0;
}