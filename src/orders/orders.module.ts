import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, UsersService],
})
export class OrdersModule {}
