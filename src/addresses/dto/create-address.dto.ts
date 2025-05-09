import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AddressType } from '../../../generated/prisma';

export class CreateAddressDto {
  @IsNotEmpty()
  @IsString()
  streetAddress: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsEnum(AddressType)
  @IsOptional()
  addressType?: AddressType = AddressType.SHIPPING;

  @IsBoolean()
  @IsOptional()
  isDefaultShipping?: boolean = false;

  @IsBoolean()
  @IsOptional()
  isDefaultBilling?: boolean = false;
}