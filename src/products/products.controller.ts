import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { Prisma } from '../../generated/prisma';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { RolesGuard } from '../guards/roles.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ) {
    const params: {
      skip?: number;
      take?: number;
      where?: Prisma.ProductWhereInput;
      orderBy?: Prisma.ProductOrderByWithRelationInput;
    } = {};

    if (skip) params.skip = parseInt(skip);
    if (take) params.take = parseInt(take);
    if (where) params.where = JSON.parse(where);
    if (orderBy) params.orderBy = JSON.parse(orderBy);

    return this.productsService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  // Routes pour les variantes de produits
  @Post(':productId/variants')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createVariant(
    @Param('productId') productId: string,
    @Body() createVariantDto: CreateProductVariantDto
  ) {
    // @ts-ignore
    return this.productsService.createVariant(+productId, createVariantDto);
  }

  @Patch('variants/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateVariant(
    @Param('id') id: string,
    @Body() updateVariantDto: UpdateProductVariantDto
  ) {
    return this.productsService.updateVariant(+id, updateVariantDto);
  }

  @Delete('variants/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  removeVariant(@Param('id') id: string) {
    return this.productsService.removeVariant(+id);
  }

  // Routes pour les images de produits
  @Post(':productId/images')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createImage(
    @Param('productId') productId: string,
    @Body() createImageDto: CreateProductImageDto
  ) {
    // @ts-ignore
    return this.productsService.createImage(+productId, createImageDto);
  }

  @Patch('images/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateImage(
    @Param('id') id: string,
    @Body() updateImageDto: UpdateProductImageDto
  ) {
    return this.productsService.updateImage(+id, updateImageDto);
  }

  @Delete('images/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  removeImage(@Param('id') id: string) {
    return this.productsService.removeImage(+id);
  }
}
