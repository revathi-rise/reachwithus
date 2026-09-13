import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Post, PostStatus } from '../../entities/post.entity';
import { PostImage } from '../../entities/post-image.entity';
import { Category } from '../../entities/category.entity';
import { UserRole } from '../../common/interfaces/jwt-payload.interface';
import { CreatePostDto, UpdatePostDto, QueryPostsDto } from './dto/post.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { LikesService } from '../likes/likes.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
    @InjectRepository(PostImage)
    private postImageRepo: Repository<PostImage>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    private subscriptionsService: SubscriptionsService,
    private likesService: LikesService,
    private dataSource: DataSource,
  ) {}

  private slugifyTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 70) || 'requirement';
  }

  private async createUniqueSlug(title: string): Promise<string> {
    const baseSlug = this.slugifyTitle(title);
    let slug = baseSlug;
    let suffix = 2;
    while (await this.postRepo.exists({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }
    return slug;
  }

  private maskPhoneNumber(phone: string): string {
    if (!phone) return '••••••••••';
    const clean = phone.trim();
    if (clean.length <= 4) return '••••';
    const visiblePart = clean.slice(0, Math.min(5, clean.length - 4));
    return `${visiblePart} •••••`;
  }

  private async canAccessContact(post: Post, requestingUserId?: string, userRole?: UserRole): Promise<boolean> {
    if (!requestingUserId) return false;
    if (userRole === UserRole.ADMIN) return true;
    if (post.authorId === requestingUserId) return true;
    return this.subscriptionsService.hasActiveSubscription(requestingUserId);
  }

  private sanitizePostForViewer(post: Post, canAccess: boolean) {
    post.isContactLocked = !canAccess;
    post.maskedPhone = this.maskPhoneNumber(post.contactPhone);
    if (!canAccess) {
      delete (post as any).contactPhone;
    }
    return post;
  }

  async findAll(query: QueryPostsDto, requestingUserId?: string, userRole?: UserRole) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));
    const skip = (page - 1) * limit;

    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.images', 'images');

    // Filter by approval status: default to APPROVED for public feed, unless admin or author filtering
    if (query.status) {
      qb.andWhere('post.status = :status', { status: query.status });
    } else {
      qb.andWhere('post.status = :status', { status: PostStatus.APPROVED });
    }

    if (query.categoryId) {
      qb.andWhere('post.categoryId = :categoryId', { categoryId: query.categoryId });
    }

    if (query.search) {
      qb.andWhere(
        '(LOWER(post.title) LIKE :search OR LOWER(post.description) LIKE :search OR LOWER(post.location) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    // Sort order
    if (query.sortBy === 'popular' || query.sortBy === 'likes') {
      qb.orderBy('post.likesCount', 'DESC').addOrderBy('post.viewsCount', 'DESC');
    } else {
      qb.orderBy('post.createdAt', 'DESC');
    }

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    // Check user subscription once if logged in
    const isSubscribed = requestingUserId
      ? await this.subscriptionsService.hasActiveSubscription(requestingUserId)
      : false;

    // Sanitize contact phone and check liked status for each post
    const processedItems = await Promise.all(
      items.map(async (post) => {
        const canAccess =
          userRole === UserRole.ADMIN ||
          post.authorId === requestingUserId ||
          isSubscribed;

        if (requestingUserId) {
          post.isLikedByCurrentUser = await this.likesService.isLikedByUser(requestingUserId, post.id);
        } else {
          post.isLikedByCurrentUser = false;
        }

        return this.sanitizePostForViewer(post, canAccess);
      }),
    );

    return {
      items: processedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      userHasActiveSubscription: isSubscribed,
    };
  }

  async findOne(id: string, requestingUserId?: string, userRole?: UserRole) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['author', 'category', 'images'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Increment view count asynchronously
    await this.postRepo.increment({ id }, 'viewsCount', 1);
    post.viewsCount += 1;

    const canAccess = await this.canAccessContact(post, requestingUserId, userRole);

    if (requestingUserId) {
      post.isLikedByCurrentUser = await this.likesService.isLikedByUser(requestingUserId, post.id);
    } else {
      post.isLikedByCurrentUser = false;
    }

    return this.sanitizePostForViewer(post, canAccess);
  }

  async findBySlug(slug: string, requestingUserId?: string, userRole?: UserRole) {
    let post = await this.postRepo.findOne({ where: { slug } });
    if (!post) {
      const legacyPosts = await this.postRepo.find({ select: ['id', 'title', 'slug', 'status'] });
      post = legacyPosts.find((candidate) => !candidate.slug && this.slugifyTitle(candidate.title) === slug) || null;
      if (post && post.status === PostStatus.APPROVED) {
        post.slug = slug;
        await this.postRepo.save(post);
      }
    }
    if (!post || post.status !== PostStatus.APPROVED) {
      throw new NotFoundException(`Post with slug ${slug} not found`);
    }
    return this.findOne(post.id, requestingUserId, userRole);
  }

  async revealContact(id: string, requestingUserId: string, userRole?: UserRole) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const canAccess = await this.canAccessContact(post, requestingUserId, userRole);

    if (!canAccess) {
      throw new ForbiddenException({
        message: 'Active ₹10/month subscription required to access contact details',
        requiresSubscription: true,
        priceINR: 10,
      });
    }

    const cleanPhone = post.contactPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=Hi%2C+I+found+your+requirement+on+ReachWithUs%3A+${encodeURIComponent(post.title)}`;

    return {
      success: true,
      postId: post.id,
      contactPhone: post.contactPhone,
      whatsappUrl,
      authorName: post.author?.name,
    };
  }

  async create(userId: string, dto: CreatePostDto): Promise<Post> {
    const post = this.postRepo.create({
      title: dto.title,
      slug: await this.createUniqueSlug(dto.title),
      description: dto.description,
      contactPhone: dto.contactPhone,
      location: dto.location,
      budget: dto.budget,
      authorId: userId,
      categoryId: dto.categoryId,
      status: PostStatus.PENDING, // Default: Pending Admin Moderation
    });

    const savedPost = await this.postRepo.save(post);

    if (dto.imageUrls && dto.imageUrls.length > 0) {
      const images = dto.imageUrls.map((url, index) =>
        this.postImageRepo.create({
          postId: savedPost.id,
          url,
          order: index,
          isCover: index === 0,
        }),
      );
      savedPost.images = await this.postImageRepo.save(images);
    }

    // Update category post count
    if (dto.categoryId) {
      await this.categoryRepo.increment({ id: dto.categoryId }, 'postCount', 1);
    }

    return savedPost;
  }

  async update(id: string, userId: string, userRole: UserRole, dto: UpdatePostDto): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['images'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You are not authorized to update this post');
    }

    if (dto.title) post.title = dto.title;
    if (dto.description) post.description = dto.description;
    if (dto.contactPhone) post.contactPhone = dto.contactPhone;
    if (dto.location !== undefined) post.location = dto.location;
    if (dto.budget !== undefined) post.budget = dto.budget;
    if (dto.categoryId !== undefined) post.categoryId = dto.categoryId;

    if (dto.imageUrls) {
      // Remove previous images
      await this.postImageRepo.delete({ postId: id });
      const newImages = dto.imageUrls.map((url, idx) =>
        this.postImageRepo.create({
          postId: id,
          url,
          order: idx,
          isCover: idx === 0,
        }),
      );
      post.images = await this.postImageRepo.save(newImages);
    }

    return this.postRepo.save(post);
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<{ success: boolean; message: string }> {
    const post = await this.postRepo.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You are not authorized to delete this post');
    }

    if (post.categoryId) {
      await this.categoryRepo.decrement({ id: post.categoryId }, 'postCount', 1);
    }

    await this.postRepo.remove(post);
    return { success: true, message: 'Post deleted successfully' };
  }

  async incrementShare(id: string) {
    await this.postRepo.increment({ id }, 'sharesCount', 1);
    return { success: true };
  }

  async findMyPosts(userId: string) {
    return this.postRepo.find({
      where: { authorId: userId },
      relations: ['category', 'images'],
      order: { createdAt: 'DESC' },
    });
  }
}
