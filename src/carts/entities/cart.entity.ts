import { CartItem } from './cart-item.entity';

export class Cart {
  id: number;
  userId?: string;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  items?: CartItem[];
}