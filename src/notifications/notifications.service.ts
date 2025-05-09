import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Notification } from './entities/notification.entity';
import { Observable, Subject, from, map } from 'rxjs';
import { Role } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private notificationSubjects: Map<string, Subject<Notification>> = new Map();

  constructor(private prisma: PrismaService) { }

  async create(createNotificationDto: CreateNotificationDto, creatorRole: Role): Promise<Notification> {
    // Only admins can create notifications
    if (creatorRole !== Role.ADMIN) {
      throw new ForbiddenException('Only administrators can create notifications');
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId: createNotificationDto.userId,
        type: createNotificationDto.type,
        message: createNotificationDto.message,
        relatedEntityType: createNotificationDto.relatedEntityType,
        relatedEntityId: createNotificationDto.relatedEntityId,
        isRead: createNotificationDto.isRead || false,
      },
    });

    // Emit the new notification to the user's stream if they're connected

    // @ts-ignore
    this.emitNotificationToUser(notification);

    // @ts-ignore
    return notification;
  }

  async findAll(userId: string, role: Role): Promise<Notification[]> {
    // Admin can see all notifications, users can only see their own
    if (role === Role.ADMIN) {
      // @ts-ignore
      return this.prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // @ts-ignore
      return this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    }
  }

  async findOne(id: number, userId: string, role: Role): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    // Check if user has permission to view this notification
    if (role !== Role.ADMIN && notification.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this notification');
    }

    // @ts-ignore
    return notification;
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto, userId: string, role: Role): Promise<Notification> {
    // First check if notification exists and user has permission
    const notification = await this.findOne(id, userId, role);

    // If marking as read and readAt is not set, set it now
    const readAt = updateNotificationDto.isRead && !notification.isRead
      ? new Date()
      : notification.readAt;

    // @ts-ignore
    return this.prisma.notification.update({
      where: { id },
      data: {
        ...updateNotificationDto,
        readAt: updateNotificationDto.isRead === false ? null : readAt,
      },
    });
  }

  async remove(id: number, userId: string, role: Role): Promise<Notification> {
    // First check if notification exists and user has permission
    await this.findOne(id, userId, role);

    // @ts-ignore
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  // Method to mark a notification as read
  async markAsRead(id: number, userId: string, role: Role): Promise<Notification> {
    return this.update(id, { isRead: true }, userId, role);
  }

  // Method to mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  // Get user's notification stream
  getUserNotificationStream(userId: string): Observable<Notification> {
    if (!this.notificationSubjects.has(userId)) {
      this.notificationSubjects.set(userId, new Subject<Notification>());
    }

    // Get initial unread notifications and then subscribe to new ones
    const initialNotifications$ = from(
      this.prisma.notification.findMany({
        where: { userId, isRead: false },
        orderBy: { createdAt: 'desc' },
      })
    ).pipe(
      map(notifications => notifications.map(notification => {
        // Emit each notification individually
        setTimeout(() => {
          // @ts-ignore
          this.notificationSubjects.get(userId).next(notification);
        }, 0);
        return null;
      }))
    );

    // Subscribe to initial notifications to trigger the emissions
    initialNotifications$.subscribe();

    // Return the subject as an observable
    // @ts-ignore
    return this.notificationSubjects.get(userId).asObservable();
  }

  // Emit a notification to a specific user's stream
  private emitNotificationToUser(notification: Notification): void {
    const subject = this.notificationSubjects.get(notification.userId);
    if (subject) {
      subject.next(notification);
    }
  }
}
