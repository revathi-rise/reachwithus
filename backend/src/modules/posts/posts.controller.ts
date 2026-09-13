import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, QueryPostsDto } from './dto/post.dto';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(
    @Query() query: QueryPostsDto,
    @CurrentUser() user?: User,
  ) {
    return this.postsService.findAll(query, user?.id, user?.role);
  }

  @Get('my-posts')
  @UseGuards(JwtAuthGuard)
  async getMyPosts(@CurrentUser('id') userId: string) {
    return this.postsService.findMyPosts(userId);
  }

  @Get('slug/:slug')
  @UseGuards(OptionalJwtAuthGuard)
  async findBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user?: User,
  ) {
    return this.postsService.findBySlug(slug, user?.id, user?.role);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user?: User,
  ) {
    return this.postsService.findOne(id, user?.id, user?.role);
  }

  @Get(':id/reveal-contact')
  @UseGuards(JwtAuthGuard)
  async revealContact(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.postsService.revealContact(id, user.id, user.role);
  }

  @Post(':id/share')
  @HttpCode(HttpStatus.OK)
  async incrementShare(@Param('id') id: string) {
    return this.postsService.incrementShare(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.create(userId, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, user.id, user.role, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.postsService.remove(id, user.id, user.role);
  }
}
