import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, PrismaService, UsersService, OrdersService],
  exports: [ReviewsService]
})
export class ReviewsModule {}
