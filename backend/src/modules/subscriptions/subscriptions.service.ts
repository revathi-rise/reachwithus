import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../../entities/subscription.entity';
import Razorpay = require('razorpay');
import * as crypto from 'crypto';

@Injectable()
export class SubscriptionsService {
  private razorpay: any;

  constructor(
    @InjectRepository(Subscription)
    private subRepo: Repository<Subscription>,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async hasActiveSubscription(userId: string): Promise<boolean> {
    if (!userId) return false;
    const count = await this.subRepo.count({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: MoreThan(new Date()),
      },
    });
    return count > 0;
  }

  async getMySubscriptionStatus(userId: string) {
    const activeSub = await this.subRepo.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: MoreThan(new Date()),
      },
      order: { endDate: 'DESC' },
    });

    if (!activeSub) {
      return {
        hasActiveSubscription: false,
        status: 'NONE',
        planName: 'ReachWithUs Monthly Pass',
        amount: 10,
        daysRemaining: 0,
        endDate: null,
      };
    }

    const now = new Date().getTime();
    const expiry = new Date(activeSub.endDate).getTime();
    const daysRemaining = Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));

    return {
      hasActiveSubscription: true,
      status: activeSub.status,
      planName: activeSub.planName,
      amount: activeSub.amount,
      startDate: activeSub.startDate,
      endDate: activeSub.endDate,
      daysRemaining,
      subscriptionId: activeSub.id,
    };
  }

  async activateSubscription(
    userId: string,
    amount: number,
    orderId?: string,
    paymentId?: string,
    signature?: string,
  ): Promise<Subscription> {
    const now = new Date();
    // Check if there is currently an active subscription to extend it
    const currentActive = await this.subRepo.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: MoreThan(now),
      },
      order: { endDate: 'DESC' },
    });

    let startDate = now;
    let endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (currentActive && new Date(currentActive.endDate) > now) {
      startDate = currentActive.endDate;
      endDate = new Date(new Date(currentActive.endDate).getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    const sub = this.subRepo.create({
      userId,
      amount,
      currency: 'INR',
      planName: 'ReachWithUs Monthly Pass',
      status: SubscriptionStatus.ACTIVE,
      startDate,
      endDate,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
    });

    return this.subRepo.save(sub);
  }

  async getSubscriptionHistory(userId: string) {
    return this.subRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async createRazorpayOrder(userId: string, amount: number) {
    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_order_${userId.substring(0, 10)}_${Date.now()}`,
    };
    try {
      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      throw new BadRequestException('Could not create Razorpay order');
    }
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    const text = orderId + '|' + paymentId;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');
    
    return generated_signature === signature;
  }
}
