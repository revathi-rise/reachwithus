import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from '../../entities/like.entity';
import { Post } from '../../entities/post.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../entities/notification.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likeRepo: Repository<Like>,
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
    private notificationsService: NotificationsService,
  ) {}

  async toggleLike(userId: string, postId: string) {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.likeRepo.findOne({
      where: { userId, postId },
    });

    if (existingLike) {
      await this.likeRepo.remove(existingLike);
      post.likesCount = Math.max(0, post.likesCount - 1);
      await this.postRepo.save(post);
      return { isLiked: false, likesCount: post.likesCount };
    } else {
      const newLike = this.likeRepo.create({ userId, postId });
      await this.likeRepo.save(newLike);
      post.likesCount += 1;
      await this.postRepo.save(post);

      // Notify post author if not the same person
      if (post.authorId && post.authorId !== userId) {
        await this.notificationsService.create(
          post.authorId,
          'New Like on your Requirement!',
          `Someone liked your post "${post.title.substring(0, 35)}..."`,
          NotificationType.NEW_LIKE,
          { postId: post.id },
        );
      }

      return { isLiked: true, likesCount: post.likesCount };
    }
  }

  async isLikedByUser(userId: string, postId: string): Promise<boolean> {
    if (!userId) return false;
    const count = await this.likeRepo.count({
      where: { userId, postId },
    });
    return count > 0;
  }
}
