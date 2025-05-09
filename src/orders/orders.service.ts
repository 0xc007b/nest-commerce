import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Order, OrderStatus, Prisma, Role } from '../../generated/prisma';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) { }

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    // Get the user's cart to calculate total amount
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productVariant: true
          }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      throw new ForbiddenException('Cannot create an order with an empty cart');
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = createOrderDto.items.map(item => {
      const cartItem = cart.items.find(ci => ci.productVariantId === item.productVariantId);
      if (!cartItem) {
        throw new NotFoundException(`Product variant with ID ${item.productVariantId} not found in cart`);
      }

      const price = cartItem.productVariant.priceOverride ||
        // @ts-ignore
        (cartItem.productVariant.product?.basePrice || 0);

      const subtotal = price * item.quantity;
      totalAmount += subtotal;

      return {
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        pricePerUnit: price,
        subtotal
      };
    });

    // Add shipping cost to total
    if (createOrderDto.shippingCost) {
      totalAmount += createOrderDto.shippingCost;
    }

    // Create the order with its items
    return this.prisma.order.create({
      data: {
        userId,
        totalAmount,
        shippingAddressId: createOrderDto.shippingAddressId,
        billingAddressId: createOrderDto.billingAddressId,
        shippingMethod: createOrderDto.shippingMethod,
        shippingCost: createOrderDto.shippingCost || 0,
        trackingNumber: createOrderDto.trackingNumber,
        notes: createOrderDto.notes,
        items: {
          create: orderItems
        }
      },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true
      }
    });
  }

  async findAll(userId: string, role: Role): Promise<Order[]> {
    // If user is ADMIN, return all orders, otherwise return only user's orders
    const where: Prisma.OrderWhereInput = role === Role.ADMIN ? {} : { userId };

    return this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            productVariant: true
          }
        },
        shippingAddress: true,
        billingAddress: true,
        payment: true
      },
      orderBy: {
        orderDate: 'desc'
      }
    });
  }

  async findOne(id: number, userId: string, role: Role): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            productVariant: true
          }
        },
        shippingAddress: true,
        billingAddress: true,
        payment: true
      }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Check if user has permission to access this order
    if (role !== Role.ADMIN && order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this order');
    }

    return order;
  }

  async findUserOrders(targetUserId: string, currentUserId: string, role: Role): Promise<Order[]> {
    // Only admin can view other users' orders
    if (targetUserId !== currentUserId && role !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to access these orders');
    }

    return this.prisma.order.findMany({
      where: { userId: targetUserId },
      include: {
        items: {
          include: {
            productVariant: true
          }
        },
        shippingAddress: true,
        billingAddress: true,
        payment: true
      },
      orderBy: {
        orderDate: 'desc'
      }
    });
  }

  async update(id: number, userId: string, role: Role, updateOrderDto: UpdateOrderDto): Promise<Order> {
    // First check if order exists and user has permission
    const order = await this.findOne(id, userId, role);

    // Only admin can change order status
    if (updateOrderDto.status && role !== Role.ADMIN) {
      throw new ForbiddenException('Only administrators can change order status');
    }

    // Prepare update data
    // @ts-ignore
    const updateData: Prisma.OrderUpdateInput = {
      ...updateOrderDto
    };

    // If there are items to update, we need to handle them separately
    if (updateOrderDto.items) {
      // For simplicity, we'll just throw an error - in a real app you might want to
      // implement a more sophisticated update mechanism for order items
      if (order.status !== OrderStatus.PENDING_PAYMENT) {
        throw new ForbiddenException('Cannot modify items for an order that is already being processed');
      }

      // In a real implementation, you would handle updating order items here
    }

    return this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
        payment: true
      }
    });
  }

  async remove(id: number, userId: string, role: Role): Promise<Order> {
    // Only admin can delete orders
    if (role !== Role.ADMIN) {
      throw new ForbiddenException('Only administrators can delete orders');
    }

    // Check if order exists
    await this.findOne(id, userId, role);

    return this.prisma.order.delete({
      where: { id },
      include: {
        items: true
      }
    });
  }
}
