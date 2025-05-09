export class Notification {
  id: number;
  userId: string;
  type: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}