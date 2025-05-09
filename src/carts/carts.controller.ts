import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('carts')
@UseGuards(AuthGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  async getCart(@Req() req) {
    const userId = req.user.sub;
    return this.cartsService.getOrCreateCart(userId);
  }

  @Post('items')
  async addItemToCart(
    @Body() createCartItemDto: CreateCartItemDto,
    @Req() req,
  ) {
    const userId = req.user.sub;
    return this.cartsService.addItemToCart(
      createCartItemDto,
      userId,
    );
  }

  @Patch('items/:id')
  async updateCartItem(
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Req() req,
  ) {
    const userId = req.user.sub;
    return this.cartsService.updateCartItem(
      +id,
      updateCartItemDto,
      userId,
    );
  }

  @Delete('items/:id')
  async removeCartItem(
    @Param('id') id: string,
    @Req() req,
  ) {
    const userId = req.user.sub;
    return this.cartsService.removeCartItem(
      +id,
      userId,
    );
  }

  @Delete()
  async clearCart(@Req() req) {
    const userId = req.user.sub;
    return this.cartsService.clearCart(userId);
  }

  //todo: add transfer cart functionality for not logged in users
}
