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
  ForbiddenException,
  NotFoundException,
  Query
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UsersService } from '../users/users.service';
import { Role } from '../enums/role.enum';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';

@UseGuards(AuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService
  ) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(req.user.sub, createOrderDto);
  }

  @Get()
  findAll(@Query('userId') userId: string, @Request() req) {
    // If userId is provided and user is admin, return that user's orders
    if (userId && req.user.role === Role.ADMIN) {
      return this.ordersService.findUserOrders(userId, req.user.sub, req.user.role);
    }
    
    // Otherwise return orders based on role
    return this.ordersService.findAll(req.user.sub, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.ordersService.findOne(+id, req.user.sub, req.user.role);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Request() req
  ) {
    return this.ordersService.update(+id, req.user.sub, req.user.role, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @Request() req) {
    return this.ordersService.remove(+id, req.user.sub, req.user.role);
  }
}
