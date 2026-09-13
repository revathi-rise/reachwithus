import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';

import { User } from './entities/user.entity';
import { Category } from './entities/category.entity';
import { Post } from './entities/post.entity';
import { PostImage } from './entities/post-image.entity';
import { Subscription } from './entities/subscription.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { Like } from './entities/like.entity';
import { Notification } from './entities/notification.entity';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PostsModule } from './modules/posts/posts.module';
import { LikesModule } from './modules/likes/likes.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { SeoModule } from './modules/seo/seo.module';
import { SeedService } from './database/seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'admin'),
        database: config.get<string>('DB_NAME', 'reachwithus'),
        entities: [
          User,
          Category,
          Post,
          PostImage,
          Subscription,
          PaymentTransaction,
          Like,
          Notification,
        ],
        synchronize: true, // auto schema sync for development
        logging: false,
      }),
    }),

    TypeOrmModule.forFeature([
      User,
      Category,
      Post,
      PostImage,
      Subscription,
      PaymentTransaction,
      Like,
      Notification,
    ]),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120, // 120 requests per minute
      },
    ]),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    AuthModule,
    UsersModule,
    CategoriesModule,
    PostsModule,
    LikesModule,
    SubscriptionsModule,
    PaymentsModule,
    NotificationsModule,
    AdminModule,
    UploadsModule,
    SeoModule,
  ],
  providers: [
    SeedService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly seedService: SeedService) {}

  async onModuleInit() {
    await this.seedService.seed();
  }
}
