import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Post } from '../../entities/post.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async findById(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getProfileWithStats(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const postsCount = await this.postRepo.count({ where: { authorId: userId } });
    const subStatus = await this.subscriptionsService.getMySubscriptionStatus(userId);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
      },
      stats: {
        totalPosts: postsCount,
        hasActiveSubscription: subStatus.hasActiveSubscription,
        daysRemaining: subStatus.daysRemaining,
      },
    };
  }
}
