import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaymentTransaction, PaymentStatus } from '../../entities/payment-transaction.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../entities/notification.entity';
import { CreateOrderDto, SubmitManualPaymentDto, VerifyPaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  private razorpayKeyId: string;
  private razorpayKeySecret: string;
  private subscriptionPrice: number;

  constructor(
    @InjectRepository(PaymentTransaction)
    private txRepo: Repository<PaymentTransaction>,
    private configService: ConfigService,
    private subscriptionsService: SubscriptionsService,
    private notificationsService: NotificationsService,
  ) {
    this.razorpayKeyId = this.configService.get<string>('RAZORPAY_KEY_ID', 'rzp_test_reachwithus');
    this.razorpayKeySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET', 'reachwithus_razorpay_secret');
    this.subscriptionPrice = Number(this.configService.get<number>('SUBSCRIPTION_PRICE_INR', 10));
  }

  async createOrder(userId: string, dto?: CreateOrderDto) {
    const amount = dto?.amount || this.subscriptionPrice;
    const amountInPaise = Math.round(amount * 100);
    const receipt = `rcpt_${userId.substring(0, 6)}_${Date.now()}`;

    // Razorpay standard order payload
    const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;

    // Create pending transaction record
    const tx = this.txRepo.create({
      userId,
      amount,
      currency: 'INR',
      provider: 'RAZORPAY',
      status: PaymentStatus.PENDING,
      orderId,
      payload: JSON.stringify({ receipt, amountInPaise }),
    });
    await this.txRepo.save(tx);

    return {
      orderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: this.razorpayKeyId,
      planName: 'ReachWithUs Monthly Pass (₹10/month)',
      receipt,
    };
  }

  async verifyPayment(userId: string, dto: VerifyPaymentDto) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = dto;

    // Verify HMAC SHA256 signature
    const generatedSignature = crypto
      .createHmac('sha256', this.razorpayKeySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    // Allow development bypass or exact signature match
    const isDev = this.configService.get<string>('NODE_ENV') !== 'production';
    const isValid = isDev || generatedSignature === razorpaySignature;

    if (!isValid) {
      throw new BadRequestException('Payment signature verification failed');
    }

    // Activate subscription
    const sub = await this.subscriptionsService.activateSubscription(
      userId,
      this.subscriptionPrice,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );

    // Record or update transaction
    let tx = await this.txRepo.findOne({ where: { orderId: razorpayOrderId } });
    if (!tx) {
      tx = this.txRepo.create({
        userId,
        amount: this.subscriptionPrice,
        currency: 'INR',
        provider: 'RAZORPAY',
        orderId: razorpayOrderId,
      });
    }

    tx.paymentId = razorpayPaymentId;
    tx.signature = razorpaySignature;
    tx.status = PaymentStatus.SUCCESS;
    tx.subscriptionId = sub.id;
    await this.txRepo.save(tx);

    // Send in-app notification
    await this.notificationsService.create(
      userId,
      'Subscription Activated!',
      'Your ₹10/month ReachWithUs Pass is now active. You have full access to unlock contact numbers on all posts for 30 days!',
      NotificationType.SUBSCRIPTION_ACTIVATED,
      { subscriptionId: sub.id, expiryDate: sub.endDate },
    );

    return {
      success: true,
      message: 'Payment verified and ₹10/month subscription activated successfully!',
      subscription: sub,
    };
  }

  /**
   * 1-Click Sandbox payment simulation for testing without live payment credentials
   */
  async simulateSandboxPayment(userId: string) {
    const fakeOrderId = `order_sim_${crypto.randomBytes(6).toString('hex')}`;
    const fakePaymentId = `pay_sim_${crypto.randomBytes(6).toString('hex')}`;
    const fakeSignature = `sig_sim_${crypto.randomBytes(12).toString('hex')}`;

    const sub = await this.subscriptionsService.activateSubscription(
      userId,
      this.subscriptionPrice,
      fakeOrderId,
      fakePaymentId,
      fakeSignature,
    );

    const tx = this.txRepo.create({
      userId,
      amount: this.subscriptionPrice,
      currency: 'INR',
      provider: 'SANDBOX_SIMULATOR',
      status: PaymentStatus.SUCCESS,
      orderId: fakeOrderId,
      paymentId: fakePaymentId,
      signature: fakeSignature,
      subscriptionId: sub.id,
    });
    await this.txRepo.save(tx);

    await this.notificationsService.create(
      userId,
      '₹10 Monthly Pass Activated!',
      'Your subscription is active. You can now unlock and view verified contact numbers across all requirements.',
      NotificationType.SUBSCRIPTION_ACTIVATED,
      { subscriptionId: sub.id, expiryDate: sub.endDate },
    );

    return {
      success: true,
      message: 'Sandbox payment completed! ₹10 Monthly Pass activated.',
      subscription: sub,
    };
  }

  async getUserTransactions(userId: string) {
    return this.txRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  getManualPaymentDetails() {
    return {
      amount: this.subscriptionPrice,
      currency: 'INR',
      upiId: this.configService.get<string>('MANUAL_PAYMENT_UPI_ID', ''),
      qrCodeUrl: this.configService.get<string>('MANUAL_PAYMENT_QR_URL', ''),
    };
  }

  async submitManualPayment(userId: string, dto: SubmitManualPaymentDto) {
    const existing = await this.txRepo.findOne({
      where: { userId, provider: 'MANUAL_UPI', status: PaymentStatus.PENDING },
      order: { createdAt: 'DESC' },
    });
    if (existing) {
      throw new BadRequestException('You already have a payment awaiting admin review.');
    }

    const tx = this.txRepo.create({
      userId,
      amount: this.subscriptionPrice,
      currency: 'INR',
      provider: 'MANUAL_UPI',
      status: PaymentStatus.PENDING,
      orderId: `manual_${crypto.randomBytes(8).toString('hex')}`,
      paymentId: dto.transactionId.trim(),
      payload: JSON.stringify({ transactionId: dto.transactionId.trim() }),
    });
    await this.txRepo.save(tx);

    return {
      success: true,
      message: 'Payment proof submitted. Your subscription will activate after admin approval.',
      transaction: tx,
    };
  }

  async approveManualPayment(transactionId: string) {
    const tx = await this.txRepo.findOne({ where: { id: transactionId } });
    if (!tx) throw new NotFoundException('Payment transaction not found');
    if (tx.provider !== 'MANUAL_UPI') throw new BadRequestException('Only manual payments can be approved here');
    if (tx.status !== PaymentStatus.PENDING) throw new BadRequestException('This payment has already been reviewed');

    const sub = await this.subscriptionsService.activateSubscription(
      tx.userId,
      Number(tx.amount),
      tx.orderId,
      tx.paymentId,
      'MANUAL_ADMIN_APPROVAL',
    );
    tx.status = PaymentStatus.SUCCESS;
    tx.subscriptionId = sub.id;
    await this.txRepo.save(tx);

    await this.notificationsService.create(
      tx.userId,
      'Subscription Activated!',
      'Your payment was approved and your ReachWithUs Monthly Pass is now active for 30 days.',
      NotificationType.SUBSCRIPTION_ACTIVATED,
      { subscriptionId: sub.id, expiryDate: sub.endDate, transactionId: tx.id },
    );
    return { success: true, message: 'Payment approved and subscription activated.', transaction: tx, subscription: sub };
  }

  async rejectManualPayment(transactionId: string, adminNote?: string) {
    const tx = await this.txRepo.findOne({ where: { id: transactionId } });
    if (!tx) throw new NotFoundException('Payment transaction not found');
    if (tx.provider !== 'MANUAL_UPI' || tx.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending manual payments can be rejected');
    }
    tx.status = PaymentStatus.FAILED;
    tx.adminNote = adminNote?.trim() || 'Payment could not be verified. Please submit a new proof.';
    await this.txRepo.save(tx);
    return { success: true, message: 'Payment submission rejected.', transaction: tx };
  }

  async getAllTransactions(limit = 50, page = 1) {
    const [items, total] = await this.txRepo.findAndCount({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { items, total, page, limit };
  }
}
