import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Product, ProductVariant, ProductImage } from '../../generated/prisma';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { variants, images, ...productData } = createProductDto;
    
    return this.prisma.product.create({
      data: {
        ...productData,
        variants: variants ? {
          create: variants
        } : undefined,
        images: images ? {
          create: images
        } : undefined
      },
      include: {
        variants: true,
        images: true,
        category: true
      }
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProductWhereUniqueInput;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
    include?: Prisma.ProductInclude;
  }): Promise<Product[]> {
    const { skip, take, cursor, where, orderBy, include } = params || {};
    
    return this.prisma.product.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: include || {
        variants: true,
        images: true,
        category: true
      }
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        images: true,
        category: true
      }
    });

    if (!product) {
      throw new NotFoundException(`Produit avec l'ID ${id} non trouvé`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const { variants, images, ...productData } = updateProductDto;
    
    // Vérifier si le produit existe
    await this.findOne(id);
    
    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        variants: variants ? {
          upsert: variants.map(variant => ({
            where: {
              id: variant.id || 0
            },
            create: variant,
            update: variant
          }))
        } : undefined,
        images: images ? {
          upsert: images.map(image => ({
            where: {
              id: image.id || 0
            },
            create: image,
            update: image
          }))
        } : undefined
      },
      include: {
        variants: true,
        images: true,
        category: true
      }
    });
  }

  async remove(id: number): Promise<Product> {
    // Vérifier si le produit existe
    await this.findOne(id);
    
    return this.prisma.product.delete({
      where: { id },
      include: {
        variants: true,
        images: true
      }
    });
  }

  // Méthodes pour les variantes de produits
  async findVariant(id: number): Promise<ProductVariant> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: true
      }
    });

    if (!variant) {
      throw new NotFoundException(`Variante de produit avec l'ID ${id} non trouvée`);
    }

    return variant;
  }

  async createVariant(productId: number, data: Prisma.ProductVariantCreateInput): Promise<ProductVariant> {
    // Vérifier si le produit existe
    await this.findOne(productId);
    
    return this.prisma.productVariant.create({
      data: {
        ...data,
        product: {
          connect: { id: productId }
        }
      },
      include: {
        product: true
      }
    });
  }

  async updateVariant(id: number, data: Prisma.ProductVariantUpdateInput): Promise<ProductVariant> {
    // Vérifier si la variante existe
    await this.findVariant(id);
    
    return this.prisma.productVariant.update({
      where: { id },
      data,
      include: {
        product: true
      }
    });
  }

  async removeVariant(id: number): Promise<ProductVariant> {
    // Vérifier si la variante existe
    await this.findVariant(id);
    
    return this.prisma.productVariant.delete({
      where: { id }
    });
  }

  // Méthodes pour les images de produits
  async findImage(id: number): Promise<ProductImage> {
    const image = await this.prisma.productImage.findUnique({
      where: { id },
      include: {
        product: true
      }
    });

    if (!image) {
      throw new NotFoundException(`Image de produit avec l'ID ${id} non trouvée`);
    }

    return image;
  }

  async createImage(productId: number, data: Prisma.ProductImageCreateInput): Promise<ProductImage> {
    // Vérifier si le produit existe
    await this.findOne(productId);
    
    return this.prisma.productImage.create({
      data: {
        ...data,
        product: {
          connect: { id: productId }
        }
      },
      include: {
        product: true
      }
    });
  }

  async updateImage(id: number, data: Prisma.ProductImageUpdateInput): Promise<ProductImage> {
    // Vérifier si l'image existe
    await this.findImage(id);
    
    return this.prisma.productImage.update({
      where: { id },
      data,
      include: {
        product: true
      }
    });
  }

  async removeImage(id: number): Promise<ProductImage> {
    // Vérifier si l'image existe
    await this.findImage(id);
    
    return this.prisma.productImage.delete({
      where: { id }
    });
  }
}
