import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../../entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notifRepo: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.SYSTEM,
    data?: any,
  ): Promise<Notification> {
    const notif = this.notifRepo.create({
      userId,
      title,
      message,
      type,
      data: data ? JSON.stringify(data) : null,
      isRead: false,
    });
    return this.notifRepo.save(notif);
  }

  async findForUser(userId: string): Promise<Notification[]> {
    return this.notifRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notif = await this.notifRepo.findOne({
      where: { id, userId },
    });
    if (!notif) {
      throw new NotFoundException('Notification not found');
    }
    notif.isRead = true;
    return this.notifRepo.save(notif);
  }

  async markAllAsRead(userId: string): Promise<{ success: boolean; updatedCount: number }> {
    const result = await this.notifRepo.update({ userId, isRead: false }, { isRead: true });
    return { success: true, updatedCount: result.affected || 0 };
  }
}
