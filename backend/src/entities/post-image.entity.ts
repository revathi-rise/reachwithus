import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity('post_images')
export class PostImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  filename: string;

  @Column({ default: false })
  isCover: boolean;

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => Post, (post) => post.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column({ nullable: true })
  postId: string;

  @CreateDateColumn()
  createdAt: Date;
}
