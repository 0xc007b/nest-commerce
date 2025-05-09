import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Req, 
  Sse,
  ForbiddenException
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MessageEvent } from '@nestjs/common';
import { Role } from 'src/enums/role.enum';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new notification (Admin only)' })
  @ApiResponse({ status: 201, description: 'The notification has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createNotificationDto: CreateNotificationDto, @Req() req) {
    return this.notificationsService.create(createNotificationDto, req.user.role);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications (Admin sees all, users see only their own)' })
  @ApiResponse({ status: 200, description: 'Return all notifications the user has access to.' })
  findAll(@Req() req) {
    return this.notificationsService.findAll(req.user.sub, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific notification by ID' })
  @ApiResponse({ status: 200, description: 'Return the notification.' })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.notificationsService.findOne(+id, req.user.sub, req.user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a notification' })
  @ApiResponse({ status: 200, description: 'The notification has been successfully updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  update(
    @Param('id') id: string, 
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Req() req
  ) {
    return this.notificationsService.update(+id, updateNotificationDto, req.user.sub, req.user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 200, description: 'The notification has been successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  remove(@Param('id') id: string, @Req() req) {
    return this.notificationsService.remove(+id, req.user.sub, req.user.role);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'The notification has been marked as read.' })
  markAsRead(@Param('id') id: string, @Req() req) {
    return this.notificationsService.markAsRead(+id, req.user.sub, req.user.role);
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications have been marked as read.' })
  markAllAsRead(@Req() req) {
    return this.notificationsService.markAllAsRead(req.user.sub);
  }

  @Sse('stream')
  @ApiOperation({ summary: 'Stream notifications in real-time using Server-Sent Events' })
  @ApiResponse({ status: 200, description: 'Stream of notifications.' })
  streamNotifications(@Req() req): Observable<MessageEvent> {
    // Get the user ID from the JWT token
    const userId = req.user.sub;
    
    // Return the notification stream for this user
    return this.notificationsService.getUserNotificationStream(userId).pipe(
      map(notification => ({
        data: notification,
        id: notification.id.toString(),
        type: 'notification',
      })),
    );
  }
}
