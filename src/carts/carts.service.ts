import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cart, CartItem, Prisma } from '../../generated/prisma';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get or create a cart for a user or session
   */
  async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    // Validate that at least one identifier is provided
    if (!userId && !sessionId) {
      throw new BadRequestException('Either userId or sessionId must be provided');
    }

    // Try to find an existing cart
    const existingCart = await this.findCart(userId, sessionId);
    
    if (existingCart) {
      return existingCart;
    }

    // Create a new cart if none exists
    return this.prisma.cart.create({
      data: {
        userId,
        sessionId,
      },
      include: {
        items: {
          include: {
            productVariant: true,
          },
        },
      },
    });
  }

  /**
   * Find a cart by userId or sessionId
   */
  async findCart(userId?: string, sessionId?: string): Promise<Cart | null> {
    if (!userId && !sessionId) {
      throw new BadRequestException('Either userId or sessionId must be provided');
    }

    const where: Prisma.CartWhereInput = {};
    
    if (userId) {
      where.userId = userId;
    } else if (sessionId) {
      where.sessionId = sessionId;
    }

    return this.prisma.cart.findFirst({
      where,
      include: {
        items: {
          include: {
            productVariant: true,
          },
        },
      },
    });
  }

  /**
   * Add an item to a cart
   */
  async addItemToCart(
    createCartItemDto: CreateCartItemDto,
    userId?: string,
    sessionId?: string,
  ): Promise<CartItem> {
    // Get or create the cart
    const cart = await this.getOrCreateCart(userId, sessionId);

    // Check if the product variant exists
    const productVariant = await this.prisma.productVariant.findUnique({
      where: { id: createCartItemDto.productVariantId },
    });

    if (!productVariant) {
      throw new NotFoundException(`Product variant with ID ${createCartItemDto.productVariantId} not found`);
    }

    // Check if the item already exists in the cart
    const existingCartItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: createCartItemDto.productVariantId,
        },
      },
    });

    if (existingCartItem) {
      // Update the quantity if the item already exists
      return this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + createCartItemDto.quantity,
        },
        include: {
          productVariant: true,
        },
      });
    }

    // Create a new cart item
    return this.prisma.cartItem.create({
      data: {
        cart: {
          connect: { id: cart.id },
        },
        productVariant: {
          connect: { id: createCartItemDto.productVariantId },
        },
        quantity: createCartItemDto.quantity,
      },
      include: {
        productVariant: true,
      },
    });
  }

  /**
   * Update a cart item
   */
  async updateCartItem(
    cartItemId: number,
    updateCartItemDto: UpdateCartItemDto,
    userId?: string,
    sessionId?: string,
  ): Promise<CartItem> {
    // Find the cart
    const cart = await this.findCart(userId, sessionId);
    
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Find the cart item and verify it belongs to the cart
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem || cartItem.cartId !== cart.id) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found in your cart`);
    }

    // Update the cart item
    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: updateCartItemDto,
      include: {
        productVariant: true,
      },
    });
  }

  /**
   * Remove a cart item
   */
  async removeCartItem(
    cartItemId: number,
    userId?: string,
    sessionId?: string,
  ): Promise<CartItem> {
    // Find the cart
    const cart = await this.findCart(userId, sessionId);
    
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Find the cart item and verify it belongs to the cart
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem || cartItem.cartId !== cart.id) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found in your cart`);
    }

    // Delete the cart item
    return this.prisma.cartItem.delete({
      where: { id: cartItemId },
      include: {
        productVariant: true,
      },
    });
  }

  /**
   * Clear all items from a cart
   */
  async clearCart(userId?: string, sessionId?: string): Promise<Cart> {
    // Find the cart
    const cart = await this.findCart(userId, sessionId);
    
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Delete all cart items
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Return the empty cart
    // @ts-ignore
    return this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: true,
      },
    });
  }

  /**
   * Transfer a cart from session to user (after login)
   */
  async transferCart(sessionId: string, userId: string): Promise<Cart> {
    // Find the session cart
    const sessionCart = await this.findCart(undefined, sessionId);
    
    if (!sessionCart) {
      // If no session cart exists, just create a user cart
      return this.getOrCreateCart(userId);
    }

    // Find or create the user cart
    const userCart = await this.getOrCreateCart(userId);

    // If the session cart has items, transfer them to the user cart
    // @ts-ignore
    if (sessionCart.items && sessionCart.items.length > 0) {
      // @ts-ignore
      for (const item of sessionCart.items) {
        // Check if the item already exists in the user cart
      // @ts-ignore
        const existingItem = userCart.items?.find(
          (i) => i.productVariantId === item.productVariantId
        );

        if (existingItem) {
          // Update the quantity if the item already exists
          await this.prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + item.quantity },
          });
        } else {
          // Create a new item in the user cart
          await this.prisma.cartItem.create({
            data: {
              cartId: userCart.id,
              productVariantId: item.productVariantId,
              quantity: item.quantity,
            },
          });
        }
      }

      // Delete the session cart
      await this.prisma.cart.delete({
        where: { id: sessionCart.id },
      });
    }

    // Return the updated user cart
    // @ts-ignore
    return this.prisma.cart.findUnique({
      where: { id: userCart.id },
      include: {
        items: {
          include: {
            productVariant: true,
          },
        },
      },
    });
  }
}
