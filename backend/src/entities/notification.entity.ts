import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  POST_APPROVED = 'POST_APPROVED',
  POST_REJECTED = 'POST_REJECTED',
  NEW_LIKE = 'NEW_LIKE',
  SUBSCRIPTION_ACTIVATED = 'SUBSCRIPTION_ACTIVATED',
  SUBSCRIPTION_EXPIRING = 'SUBSCRIPTION_EXPIRING',
  SYSTEM = 'SYSTEM',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @Index()
  userId: string;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({
    type: 'varchar',
    default: NotificationType.SYSTEM,
  })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'text', nullable: true })
  data: string; // JSON serialized metadata (e.g. postId)

  @CreateDateColumn()
  createdAt: Date;
}
