import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../../entities/post.entity';
import { SeoController } from './seo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [SeoController],
})
export class SeoModule {}
