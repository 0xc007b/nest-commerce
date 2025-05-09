import { IsString, IsOptional, IsInt, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: 'User ID who will receive the notification' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Type of notification', example: 'ORDER_CONFIRMATION' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Notification message content' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Related entity type (e.g., "order", "product")' })
  @IsString()
  @IsOptional()
  relatedEntityType?: string;

  @ApiPropertyOptional({ description: 'ID of the related entity' })
  @IsInt()
  @IsOptional()
  relatedEntityId?: number;

  @ApiPropertyOptional({ description: 'Whether the notification has been read' })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean = false;
}