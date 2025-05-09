import { OrderStatus } from '../../../generated/prisma';

export class CreateOrderDto {
  shippingAddressId: number;
  billingAddressId?: number;
  shippingMethod?: string;
  shippingCost?: number;
  trackingNumber?: string;
  notes?: string;
  items: OrderItemDto[];
}

export class OrderItemDto {
  productVariantId: number;
  quantity: number;
}