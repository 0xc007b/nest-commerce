import { ProductVariant } from '../../products/entities/product-variant.entity';
import { Cart } from './cart.entity';

export class CartItem {
  id: number;
  cartId: number;
  productVariantId: number;
  quantity: number;
  addedAt: Date;
  
  // Relations
  cart?: Cart;
  productVariant?: ProductVariant;
}