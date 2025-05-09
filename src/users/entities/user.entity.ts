import { Role } from '../../../generated/prisma';
// import { Address } from '../../addresses/entities/address.entity';
// import { Cart } from '../../carts/entities/cart.entity';
// import { Notification } from '../../notifications/entities/notification.entity';
// import { Order } from '../../orders/entities/order.entity';
// import { Review } from '../../reviews/entities/review.entity';

export class User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: Role;
  phoneNumber?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
//   addresses?: Address[];
//   reviews?: Review[];
//   orders?: Order[];
//   notifications?: Notification[];
//   cart?: Cart;
}