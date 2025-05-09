import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { PrismaService } from 'src/prisma/prisma.service';


@Module({
  controllers: [CartsController],
  providers: [CartsService, PrismaService],
  exports: [CartsService],
})
export class CartsModule { }
