import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Address, Prisma } from '../../generated/prisma';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createAddressDto: CreateAddressDto): Promise<Address> {
    // If this is the first address or marked as default, handle default flags
    if (createAddressDto.isDefaultShipping) {
      await this.resetDefaultShipping(userId);
    }
    
    if (createAddressDto.isDefaultBilling) {
      await this.resetDefaultBilling(userId);
    }

    return this.prisma.address.create({
      data: {
        ...createAddressDto,
        user: {
          connect: { id: userId }
        }
      }
    });
  }

  async findAll(userId: string): Promise<Address[]> {
    return this.prisma.address.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findOne(id: number, userId?: string): Promise<Address> {
    const address = await this.prisma.address.findUnique({
      where: { id }
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    // If userId is provided, verify ownership
    if (userId && address.userId !== userId) {
      throw new NotFoundException(`Address with ID ${id} not found for this user`);
    }

    return address;
  }

  async update(id: number, userId: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    // Verify address exists and belongs to user
    await this.findOne(id, userId);

    // Handle default flags if they're being updated
    if (updateAddressDto.isDefaultShipping) {
      await this.resetDefaultShipping(userId);
    }
    
    if (updateAddressDto.isDefaultBilling) {
      await this.resetDefaultBilling(userId);
    }

    return this.prisma.address.update({
      where: { id },
      data: updateAddressDto
    });
  }

  async remove(id: number, userId: string): Promise<Address> {
    // Verify address exists and belongs to user
    await this.findOne(id, userId);
    
    return this.prisma.address.delete({
      where: { id }
    });
  }

  // Helper methods for managing default addresses
  private async resetDefaultShipping(userId: string): Promise<void> {
    await this.prisma.address.updateMany({
      where: {
        userId,
        isDefaultShipping: true
      },
      data: {
        isDefaultShipping: false
      }
    });
  }

  private async resetDefaultBilling(userId: string): Promise<void> {
    await this.prisma.address.updateMany({
      where: {
        userId,
        isDefaultBilling: true
      },
      data: {
        isDefaultBilling: false
      }
    });
  }
}
