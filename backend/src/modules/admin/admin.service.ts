import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Post, PostStatus } from '../../entities/post.entity';
import { Subscription, SubscriptionStatus } from '../../entities/subscription.entity';
import { PaymentTransaction, PaymentStatus } from '../../entities/payment-transaction.entity';
import { Category } from '../../entities/category.entity';
import { Like } from '../../entities/like.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../entities/notification.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
    @InjectRepository(Subscription)
    private subRepo: Repository<Subscription>,
    @InjectRepository(PaymentTransaction)
    private txRepo: Repository<PaymentTransaction>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Like)
    private likeRepo: Repository<Like>,
    private notificationsService: NotificationsService,
  ) {}

  async getDashboardStats() {
    const totalUsers = await this.userRepo.count();

    const activeSubscriptions = await this.subRepo.count({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: MoreThan(new Date()),
      },
    });

    const revenueResult = await this.txRepo
      .createQueryBuilder('tx')
      .select('SUM(tx.amount)', 'total')
      .where('tx.status = :status', { status: PaymentStatus.SUCCESS })
      .getRawOne();

    const totalRevenueINR = parseFloat(revenueResult?.total || '0');

    const pendingPosts = await this.postRepo.count({
      where: { status: PostStatus.PENDING },
    });

    const approvedPosts = await this.postRepo.count({
      where: { status: PostStatus.APPROVED },
    });

    const rejectedPosts = await this.postRepo.count({
      where: { status: PostStatus.REJECTED },
    });

    const totalLikes = await this.likeRepo.count();
    const totalCategories = await this.categoryRepo.count();

    // Category distribution breakdown
    const categoriesBreakdown = await this.categoryRepo
      .createQueryBuilder('cat')
      .select(['cat.name', 'cat.postCount', 'cat.color'])
      .orderBy('cat.postCount', 'DESC')
      .limit(6)
      .getMany();

    // Recent 5 pending posts
    const recentPending = await this.postRepo.find({
      where: { status: PostStatus.PENDING },
      relations: ['author', 'category', 'images'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      metrics: {
        totalUsers,
        activeSubscriptions,
        totalRevenueINR,
        pendingPosts,
        approvedPosts,
        rejectedPosts,
        totalLikes,
        totalCategories,
      },
      categoriesBreakdown,
      recentPending,
    };
  }

  async getModerationQueue(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await this.postRepo.findAndCount({
      where: { status: PostStatus.PENDING },
      relations: ['author', 'category', 'images'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async approvePost(postId: string) {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    post.status = PostStatus.APPROVED;
    post.rejectionReason = null;
    const updated = await this.postRepo.save(post);

    if (post.authorId) {
      await this.notificationsService.create(
        post.authorId,
        'Requirement Approved!',
        `Your post "${post.title.substring(0, 35)}..." has been approved and is now live!`,
        NotificationType.POST_APPROVED,
        { postId: post.id },
      );
    }

    return {
      success: true,
      message: 'Post approved successfully',
      post: updated,
    };
  }

  async rejectPost(postId: string, reason: string) {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    post.status = PostStatus.REJECTED;
    post.rejectionReason = reason;
    const updated = await this.postRepo.save(post);

    if (post.authorId) {
      await this.notificationsService.create(
        post.authorId,
        'Requirement Needs Modification',
        `Your post "${post.title.substring(0, 35)}..." was rejected. Reason: ${reason}`,
        NotificationType.POST_REJECTED,
        { postId: post.id, reason },
      );
    }

    return {
      success: true,
      message: 'Post rejected successfully',
      post: updated,
    };
  }

  async getUsers(search?: string, page = 1, limit = 20) {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.subscriptions', 'sub')
      .loadRelationCountAndMap('user.postCount', 'user.posts');

    if (search) {
      qb.where('LOWER(user.name) LIKE :search OR LOWER(user.email) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    qb.orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    const now = new Date();
    const formatted = items.map((u) => {
      const hasActive = u.subscriptions?.some(
        (s) => s.status === SubscriptionStatus.ACTIVE && new Date(s.endDate) > now,
      );
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        avatarUrl: u.avatarUrl,
        role: u.role,
        isActive: u.isActive,
        postCount: (u as any).postCount || 0,
        hasActiveSubscription: !!hasActive,
        createdAt: u.createdAt,
      };
    });

    return {
      items: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async toggleUserStatus(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = !user.isActive;
    await this.userRepo.save(user);

    return {
      success: true,
      userId: user.id,
      isActive: user.isActive,
      message: `User account ${user.isActive ? 'activated' : 'suspended'} successfully`,
    };
  }

  async getTransactions(page = 1, limit = 20) {
    const [items, total] = await this.txRepo.findAndCount({
      relations: ['user', 'subscription'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
