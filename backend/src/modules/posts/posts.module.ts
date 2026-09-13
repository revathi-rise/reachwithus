import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../../entities/post.entity';
import { PostImage } from '../../entities/post-image.entity';
import { Category } from '../../entities/category.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { LikesModule } from '../likes/likes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostImage, Category]),
    SubscriptionsModule,
    LikesModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
