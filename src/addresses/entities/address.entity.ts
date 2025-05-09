import { AddressType } from '../../../generated/prisma';

export class Address {
  id: number;
  userId: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  country: string;
  addressType: AddressType;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  createdAt: Date;
  updatedAt: Date;
}