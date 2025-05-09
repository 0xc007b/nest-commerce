import { Product } from '../../products/entities/product.entity';

export class Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  parentCategory?: Category;
  subCategories?: Category[];
  products?: Product[];
}