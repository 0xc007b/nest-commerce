import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { Role } from '../enums/role.enum';
import { CreateReviewImageDto } from './dto/create-review-image.dto';
import { PaymentStatus } from '../../generated/prisma';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
  ) {}

  async create(userId: string, productId: number, createReviewDto: CreateReviewDto) {
    // Check if user has purchased this product
    const hasPurchased = await this.hasUserPurchasedProduct(userId, productId);
    if (!hasPurchased) {
      throw new ForbiddenException('You can only review products you have purchased');
    }

    // Check if user already reviewed this product
    const existingReview = await this.prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingReview) {
      throw new ForbiddenException('You have already reviewed this product');
    }

    return this.prisma.review.create({
      data: {
        userId,
        productId,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
        isApproved: false, // Reviews need approval by default
      },
    });
  }

  async findAll(params?: {
    userId?: string;
    productId?: number;
    isApproved?: boolean;
    skip?: number;
    take?: number;
  }) {
    const { userId, productId, isApproved, skip, take } = params || {};
    
    return this.prisma.review.findMany({
      where: {
        ...(userId && { userId }),
        ...(productId && { productId }),
        ...(isApproved !== undefined && { isApproved }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: true,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: true,
      },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async update(id: number, userId: string | null, role: Role, updateReviewDto: UpdateReviewDto) {
    const review = await this.findOne(id);

    // Check if user is the owner of the review or an admin
    if (review.userId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to update this review');
    }

    return this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
    });
  }

  async remove(id: number, userId: string, role: Role) {
    const review = await this.findOne(id);

    // Check if user is the owner of the review or an admin
    if (review.userId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this review');
    }

    return this.prisma.review.delete({
      where: { id },
    });
  }

  async addReviewImage(reviewId: number, userId: string, role: Role, createReviewImageDto: CreateReviewImageDto) {
    const review = await this.findOne(reviewId);

    // Check if user is the owner of the review or an admin
    if (review.userId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to add images to this review');
    }

    return this.prisma.reviewImage.create({
      data: {
        reviewId,
        imageUrl: createReviewImageDto.imageUrl,
        altText: createReviewImageDto.altText,
        order: createReviewImageDto.order || 0,
      },
    });
  }

  async removeReviewImage(imageId: number, userId: string, role: Role) {
    const image = await this.prisma.reviewImage.findUnique({
      where: { id: imageId },
      include: {
        review: true,
      },
    });

    if (!image) {
      throw new NotFoundException(`Review image with ID ${imageId} not found`);
    }

    // Check if user is the owner of the review or an admin
    if (image.review.userId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this image');
    }

    return this.prisma.reviewImage.delete({
      where: { id: imageId },
    });
  }

  // Helper method to check if a user has purchased a product
  private async hasUserPurchasedProduct(userId: string, productId: number): Promise<boolean> {
    // Find orders with successful payment that contain this product
    const orders = await this.prisma.order.findMany({
      where: {
        userId,
        payment: {
          status: PaymentStatus.SUCCEEDED,
        },
        items: {
          some: {
            productVariant: {
              productId,
            },
          },
        },
      },
    });

    return orders.length > 0;
  }
}
