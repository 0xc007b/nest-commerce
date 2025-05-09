import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  Request
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/enums/role.enum';

@UseGuards(AuthGuard)
@Controller('users/:userId/addresses')
export class AddressesController {
  constructor(
    private readonly addressesService: AddressesService,
    private readonly usersService: UsersService
  ) {}

  @Post()
  async create(
    @Param('userId') userId: string,
    @Body() createAddressDto: CreateAddressDto,
    @Request() req
  ) {
    const targetUserId = await this.resolveAndValidateUserId(userId, req.user);
    return this.addressesService.create(targetUserId, createAddressDto);
  }

  @Get()
  async findAll(
    @Param('userId') userId: string,
    @Request() req
  ) {
    const targetUserId = await this.resolveAndValidateUserId(userId, req.user);
    return this.addressesService.findAll(targetUserId);
  }

  @Get(':id')
  async findOne(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Request() req
  ) {
    const targetUserId = await this.resolveAndValidateUserId(userId, req.user);
    return this.addressesService.findOne(+id, targetUserId);
  }

  @Patch(':id')
  async update(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @Request() req
  ) {
    const targetUserId = await this.resolveAndValidateUserId(userId, req.user);
    return this.addressesService.update(+id, targetUserId, updateAddressDto);
  }

  @Delete(':id')
  async remove(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Request() req
  ) {
    const targetUserId = await this.resolveAndValidateUserId(userId, req.user);
    return this.addressesService.remove(+id, targetUserId);
  }

  // Helper method to resolve and validate user ID
  private async resolveAndValidateUserId(userId: string, currentUser: any): Promise<string> {
    // Case 1: "me" - use the current user's ID
    if (userId === 'me') {
      return currentUser.id;
    }

    // Case 2: Specific user ID
    // First, check if the user exists
    const targetUser = await this.usersService.findOne({ id: userId });
    if (!targetUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Case 2a: Current user is accessing their own addresses
    if (userId === currentUser.id) {
      return userId;
    }

    // Case 2b: Current user is an admin accessing another user's addresses
    if (currentUser.role === Role.ADMIN) {
      return userId;
    }

    // Case 2c: Current user is trying to access another user's addresses without being an admin
    throw new ForbiddenException('You do not have permission to access this resource');
  }
}
