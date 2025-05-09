import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Role } from '../enums/role.enum';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { CreateReviewImageDto } from './dto/create-review-image.dto';

@UseGuards(AuthGuard)
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Create a review for a product
  @Post('products/:productId/reviews')
  create(
    @Param('productId') productId: string,
    @Body() createReviewDto: CreateReviewDto,
    @Request() req,
  ) {
    return this.reviewsService.create(req.user.sub, +productId, createReviewDto);
  }

  // Get all reviews for a product
  @Get('products/:productId/reviews')
  findProductReviews(
    @Param('productId') productId: string,
    @Query('isApproved') isApproved?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.reviewsService.findAll({
      productId: +productId,
      isApproved: isApproved === 'true',
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
    });
  }

  // Get all reviews (with optional filtering)
  @Get('reviews')
  findAll(
    @Request() req,
    @Query('userId') userId?: string,
    @Query('productId') productId?: string,
    @Query('isApproved') isApproved?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    // If userId is provided and user is not admin, check permissions
    if (userId && userId !== req.user.sub && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only view your own reviews');
    }

    // If no userId provided, use current user's ID (unless admin)
    const targetUserId = userId || (req.user.role !== Role.ADMIN ? req.user.sub : undefined);

    return this.reviewsService.findAll({
      userId: targetUserId,
      productId: productId ? +productId : undefined,
      isApproved: isApproved === 'true',
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
    });
  }

  // Get a specific review
  @Get('reviews/:id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(+id);
  }

  // Update a review
  @Patch('reviews/:id')
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req,
  ) {
    return this.reviewsService.update(+id, req.user.sub, req.user.role, updateReviewDto);
  }

  // Delete a review
  @Delete('reviews/:id')
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(+id, req.user.sub, req.user.role);
  }

  // Add an image to a review
  @Post('reviews/:id/images')
  addImage(
    @Param('id') id: string,
    @Body() createReviewImageDto: CreateReviewImageDto,
    @Request() req,
  ) {
    return this.reviewsService.addReviewImage(+id, req.user.sub, req.user.role, createReviewImageDto);
  }

  // Delete a review image
  @Delete('reviews/images/:id')
  removeImage(@Param('id') id: string, @Request() req) {
    return this.reviewsService.removeReviewImage(+id, req.user.sub, req.user.role);
  }

  // Admin-only: approve a review
  @Patch('reviews/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  approveReview(@Param('id') id: string) {
    return this.reviewsService.update(+id, null, Role.ADMIN, { isApproved: true });
  }
}
