import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from '../common/interfaces/jwt-payload.interface';
import { Post } from './post.entity';
import { Subscription } from './subscription.entity';
import { Like } from './like.entity';
import { Notification } from './notification.entity';
import { PaymentTransaction } from './payment-transaction.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column()
  name: string;

  @Column({ nullable: true, unique: true })
  phone: string;

  @Column({
    type: 'varchar',
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  phoneVerified: boolean;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Subscription, (sub) => sub.user)
  subscriptions: Subscription[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Notification, (notif) => notif.user)
  notifications: Notification[];

  @OneToMany(() => PaymentTransaction, (tx) => tx.user)
  transactions: PaymentTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
