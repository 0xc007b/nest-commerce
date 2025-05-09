import { ProductVariant } from './product-variant.entity';
import { ProductImage } from './product-image.entity';

export class Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  brand?: string;
  basePrice: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  variants?: ProductVariant[];
  images?: ProductImage[];
}