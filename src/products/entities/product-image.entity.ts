export class ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
  createdAt: Date;
}