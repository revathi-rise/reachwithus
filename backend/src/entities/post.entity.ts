import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
import { PostImage } from './post-image.entity';
import { Like } from './like.entity';

export enum PostStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  title: string;

  @Column({ unique: true, nullable: true })
  @Index()
  slug: string;

  @Column('text')
  description: string;

  @Column()
  contactPhone: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  budget: string;

  @Column({
    type: 'varchar',
    default: PostStatus.PENDING,
  })
  @Index()
  status: PostStatus;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ default: 0 })
  viewsCount: number;

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  sharesCount: number;

  @Column({ default: false })
  isFeatured: boolean;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  @ManyToOne(() => Category, (category) => category.posts, { onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @OneToMany(() => PostImage, (img) => img.post, { cascade: true, eager: true })
  images: PostImage[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Transient virtual properties added dynamically in service responses
  isContactLocked?: boolean;
  maskedPhone?: string;
  isLikedByCurrentUser?: boolean;
}
