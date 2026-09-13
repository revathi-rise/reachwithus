import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('posts/:postId/like')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async toggleLike(
    @Param('postId') postId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.likesService.toggleLike(userId, postId);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async checkLikeStatus(
    @Param('postId') postId: string,
    @CurrentUser('id') userId: string,
  ) {
    const isLiked = await this.likesService.isLikedByUser(userId, postId);
    return { isLiked };
  }
}
