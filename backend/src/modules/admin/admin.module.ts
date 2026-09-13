import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Post } from '../../entities/post.entity';
import { Subscription } from '../../entities/subscription.entity';
import { PaymentTransaction } from '../../entities/payment-transaction.entity';
import { Category } from '../../entities/category.entity';
import { Like } from '../../entities/like.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Post,
      Subscription,
      PaymentTransaction,
      Category,
      Like,
    ]),
    NotificationsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
