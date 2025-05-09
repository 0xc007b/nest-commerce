export class ProductVariant {
  id: number;
  productId: number;
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  priceOverride?: number;
  stockQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}