import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { UserRole } from '../common/interfaces/jwt-payload.interface';
import { Category } from '../entities/category.entity';
import { Post, PostStatus } from '../entities/post.entity';
import { PostImage } from '../entities/post-image.entity';
import { Subscription, SubscriptionStatus } from '../entities/subscription.entity';
import { PaymentTransaction, PaymentStatus } from '../entities/payment-transaction.entity';
import { Like } from '../entities/like.entity';
import { Notification, NotificationType } from '../entities/notification.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Category) private catRepo: Repository<Category>,
    @InjectRepository(Post) private postRepo: Repository<Post>,
    @InjectRepository(PostImage) private postImageRepo: Repository<PostImage>,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    @InjectRepository(PaymentTransaction) private txRepo: Repository<PaymentTransaction>,
    @InjectRepository(Like) private likeRepo: Repository<Like>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  async seed() {
    this.logger.log('🌱 Starting database seeding for ReachWithUs...');

    // 1. Seed Categories
    const categoriesData = [
      {
        name: 'Business & Partnerships',
        slug: 'business-partnerships',
        icon: 'briefcase',
        color: '#6366F1',
        description: 'Joint ventures, distributorships, franchises, and business collaborations.',
      },
      {
        name: 'Freelance & IT Services',
        slug: 'freelance-it-services',
        icon: 'code',
        color: '#0EA5E9',
        description: 'Software development, design, digital marketing, and tech consultants.',
      },
      {
        name: 'Industrial & Raw Materials',
        slug: 'industrial-raw-materials',
        icon: 'factory',
        color: '#F59E0B',
        description: 'Metals, polymers, chemicals, construction supplies, and minerals.',
      },
      {
        name: 'Real Estate & Spaces',
        slug: 'real-estate-spaces',
        icon: 'building',
        color: '#10B981',
        description: 'Commercial spaces, warehouses, factory lands, and retail offices.',
      },
      {
        name: 'Hiring & Talent',
        slug: 'hiring-talent',
        icon: 'users',
        color: '#EC4899',
        description: 'Contract staff, technicians, executive hiring, and seasonal labor.',
      },
      {
        name: 'Wholesale & Bulk Supplies',
        slug: 'wholesale-bulk-supplies',
        icon: 'shopping-cart',
        color: '#8B5CF6',
        description: 'Bulk FMCG goods, packaging materials, textiles, and inventory clearance.',
      },
      {
        name: 'Machinery & Equipment',
        slug: 'machinery-equipment',
        icon: 'tool',
        color: '#EF4444',
        description: 'Heavy machinery, CNC tools, generators, printing equipment, and plant spares.',
      },
    ];

    const categoryMap = new Map<string, Category>();
    for (const item of categoriesData) {
      let cat = await this.catRepo.findOne({ where: { slug: item.slug } });
      if (!cat) {
        cat = this.catRepo.create(item);
        cat = await this.catRepo.save(cat);
        this.logger.log(`Created category: ${cat.name}`);
      }
      categoryMap.set(item.slug, cat);
    }

    // 2. Seed Users
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Admin@123', salt);
    const userPasswordHash = await bcrypt.hash('User@123', salt);

    // Admin User
    let admin = await this.userRepo.findOne({ where: { email: 'admin@reachwithus.com' } });
    if (!admin) {
      admin = this.userRepo.create({
        email: 'admin@reachwithus.com',
        name: 'ReachWithUs Admin',
        phone: '+91 99999 00000',
        passwordHash: defaultPasswordHash,
        role: UserRole.ADMIN,
        isActive: true,
      });
      admin = await this.userRepo.save(admin);
      this.logger.log('Created Admin user: admin@reachwithus.com');
    }

    // Rahul (Subscribed user)
    let rahul = await this.userRepo.findOne({ where: { email: 'rahul.sharma@example.com' } });
    if (!rahul) {
      rahul = this.userRepo.create({
        email: 'rahul.sharma@example.com',
        name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        passwordHash: userPasswordHash,
        role: UserRole.USER,
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      });
      rahul = await this.userRepo.save(rahul);
      this.logger.log('Created Demo user: rahul.sharma@example.com');
    }

    // Priya (Regular user)
    let priya = await this.userRepo.findOne({ where: { email: 'priya.patel@example.com' } });
    if (!priya) {
      priya = this.userRepo.create({
        email: 'priya.patel@example.com',
        name: 'Priya Patel',
        phone: '+91 91234 56789',
        passwordHash: userPasswordHash,
        role: UserRole.USER,
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      });
      priya = await this.userRepo.save(priya);
      this.logger.log('Created Demo user: priya.patel@example.com');
    }

    // Vikram (Industrial poster)
    let vikram = await this.userRepo.findOne({ where: { email: 'vikram.singh@example.com' } });
    if (!vikram) {
      vikram = this.userRepo.create({
        email: 'vikram.singh@example.com',
        name: 'Vikram Singh',
        phone: '+91 97865 12345',
        passwordHash: userPasswordHash,
        role: UserRole.USER,
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      });
      vikram = await this.userRepo.save(vikram);
      this.logger.log('Created Demo user: vikram.singh@example.com');
    }

    // 3. Seed ₹10 Subscription for Rahul
    const existingSub = await this.subRepo.findOne({ where: { userId: rahul.id } });
    if (!existingSub) {
      const now = new Date();
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const sub = this.subRepo.create({
        userId: rahul.id,
        status: SubscriptionStatus.ACTIVE,
        planName: 'ReachWithUs Monthly Pass',
        amount: 10.0,
        currency: 'INR',
        startDate: now,
        endDate: endDate,
        razorpayOrderId: 'order_seed_init001',
        razorpayPaymentId: 'pay_seed_init001',
      });
      await this.subRepo.save(sub);

      const tx = this.txRepo.create({
        userId: rahul.id,
        subscriptionId: sub.id,
        amount: 10.0,
        currency: 'INR',
        provider: 'RAZORPAY',
        status: PaymentStatus.SUCCESS,
        orderId: 'order_seed_init001',
        paymentId: 'pay_seed_init001',
      });
      await this.txRepo.save(tx);
      this.logger.log('Created Active ₹10 Subscription for Rahul Sharma');
    }

    // 4. Seed Posts
    const existingPostsCount = await this.postRepo.count();
    if (existingPostsCount === 0) {
      const postsToSeed = [
        {
          title: 'Required 500 Tons Cold Rolled Steel Coils for Manufacturing Plant',
          description:
            'We are an automotive parts manufacturer located in Pune urgently seeking verified suppliers for 500 Tons of CR Steel Coils (0.8mm to 2.5mm thickness). Looking for long-term contract with weekly dispatches. Immediate purchase orders ready.',
          contactPhone: '+91 98201 11223',
          location: 'Pune, Maharashtra',
          budget: '₹2.5 Crore / month',
          status: PostStatus.APPROVED,
          authorId: vikram.id,
          categoryId: categoryMap.get('industrial-raw-materials')?.id,
          viewsCount: 142,
          likesCount: 18,
          sharesCount: 7,
          isFeatured: true,
          images: [
            'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800',
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
          ],
        },
        {
          title: 'Seeking Senior Full-Stack NestJS & React Native Developers',
          description:
            'Growing Fintech startup in Bangalore looking for an agency or senior contract engineers with solid NestJS, PostgreSQL and Expo experience. 3-month contract with immediate start. Remote flexibility allowed.',
          contactPhone: '+91 98450 77889',
          location: 'Bangalore, Karnataka',
          budget: '₹1,50,000 - ₹2,00,000 / mo',
          status: PostStatus.APPROVED,
          authorId: rahul.id,
          categoryId: categoryMap.get('freelance-it-services')?.id,
          viewsCount: 230,
          likesCount: 29,
          sharesCount: 14,
          isFeatured: true,
          images: [
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
          ],
        },
        {
          title: 'Urgent: Looking for 12,000 Sq.Ft Commercial Warehouse on Lease',
          description:
            'E-commerce fulfillment hub looking for an RCC warehouse on long lease in or around Bhiwandi / Thane corridor. Must have min 24ft clear ceiling height, dock levellers, 3-phase power, and wide container turning radius.',
          contactPhone: '+91 98112 33445',
          location: 'Bhiwandi / Thane, Mumbai',
          budget: '₹3,50,000 / month lease',
          status: PostStatus.APPROVED,
          authorId: priya.id,
          categoryId: categoryMap.get('real-estate-spaces')?.id,
          viewsCount: 88,
          likesCount: 12,
          sharesCount: 3,
          isFeatured: false,
          images: [
            'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
          ],
        },
        {
          title: 'Direct Wholesale Suppliers Wanted: 50,000 Pcs Corrugated Shipping Boxes',
          description:
            'D2C consumer brand requiring regular supply of 3-ply and 5-ply Kraft corrugated shipping boxes with custom 2-color branding print. Needs monthly delivery of 50k pieces. Samples requested immediately.',
          contactPhone: '+91 97654 99887',
          location: 'Ahmedabad, Gujarat',
          budget: '₹8,00,000 / month',
          status: PostStatus.APPROVED,
          authorId: vikram.id,
          categoryId: categoryMap.get('wholesale-bulk-supplies')?.id,
          viewsCount: 64,
          likesCount: 8,
          sharesCount: 2,
          isFeatured: false,
          images: [
            'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800',
          ],
        },
        {
          title: 'Exclusive State Distributors Required for Premium Organic Beverage Brand',
          description:
            'We are expanding our healthy cold-pressed juices and kombucha brand across South India (Karnataka, Telangana, Tamil Nadu). Seeking distributors with existing modern trade and supermarket networks. High margins offered.',
          contactPhone: '+91 99001 55667',
          location: 'Hyderabad, Telangana',
          budget: 'Distributor ROI 28%',
          status: PostStatus.APPROVED,
          authorId: rahul.id,
          categoryId: categoryMap.get('business-partnerships')?.id,
          viewsCount: 175,
          likesCount: 21,
          sharesCount: 9,
          isFeatured: true,
          images: [
            'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800',
          ],
        },
        // PENDING Post waiting for Admin Moderation Demo!
        {
          title: 'Seeking Pan-India Digital Performance Marketing Agency for EdTech Launch',
          description:
            'We are rolling out our skills learning platform and require an experienced growth marketing agency with proven ROAS on Meta & Google Ads. Expected monthly ad spend budget ₹15L. Please connect with case studies.',
          contactPhone: '+91 98888 22331',
          location: 'Delhi NCR',
          budget: '₹15,00,000 / month ad spend',
          status: PostStatus.PENDING, // PENDING for admin approval demo!
          authorId: priya.id,
          categoryId: categoryMap.get('freelance-it-services')?.id,
          viewsCount: 0,
          likesCount: 0,
          sharesCount: 0,
          isFeatured: false,
          images: [
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
          ],
        },
      ];

      for (const p of postsToSeed) {
        const post = this.postRepo.create({
          title: p.title,
          description: p.description,
          contactPhone: p.contactPhone,
          location: p.location,
          budget: p.budget,
          status: p.status,
          authorId: p.authorId,
          categoryId: p.categoryId,
          viewsCount: p.viewsCount,
          likesCount: p.likesCount,
          sharesCount: p.sharesCount,
          isFeatured: p.isFeatured,
        });
        const savedPost = await this.postRepo.save(post);

        for (let i = 0; i < p.images.length; i++) {
          const img = this.postImageRepo.create({
            postId: savedPost.id,
            url: p.images[i],
            isCover: i === 0,
            order: i,
          });
          await this.postImageRepo.save(img);
        }

        if (p.categoryId) {
          await this.catRepo.increment({ id: p.categoryId }, 'postCount', 1);
        }
      }
      this.logger.log('Created sample requirement posts');
    }

    // 5. Seed Notification for Rahul
    const notifsCount = await this.notifRepo.count();
    if (notifsCount === 0) {
      await this.notifRepo.save([
        this.notifRepo.create({
          userId: rahul.id,
          title: 'Welcome to ReachWithUs!',
          message: 'Explore active requirements, create your posts, and connect directly with leads.',
          type: NotificationType.SYSTEM,
          isRead: false,
        }),
        this.notifRepo.create({
          userId: rahul.id,
          title: '₹10 Monthly Pass Activated',
          message: 'You have full access to unlock contact numbers across all requirements for 30 days.',
          type: NotificationType.SUBSCRIPTION_ACTIVATED,
          isRead: true,
        }),
      ]);
      this.logger.log('Created initial notifications');
    }

    this.logger.log('✅ Database seeding finished successfully!');
  }
}
