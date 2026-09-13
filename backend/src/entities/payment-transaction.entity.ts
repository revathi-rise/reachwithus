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
import { Subscription } from './subscription.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('payment_transactions')
export class PaymentTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => Subscription, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription;

  @Column({ nullable: true })
  subscriptionId: string;

  @Column('decimal', { precision: 10, scale: 2, default: 10.0 })
  amount: number;

  @Column({ default: 'INR' })
  currency: string;

  @Column({ default: 'MANUAL_UPI' })
  provider: string;

  @Column({
    type: 'varchar',
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  orderId: string;

  @Column({ nullable: true })
  paymentId: string;

  @Column({ nullable: true })
  signature: string;

  @Column({ type: 'text', nullable: true })
  payload: string;

  @Column({ type: 'text', nullable: true })
  paymentProofUrl: string;

  @Column({ type: 'text', nullable: true })
  adminNote: string;

  @CreateDateColumn()
  createdAt: Date;
}
