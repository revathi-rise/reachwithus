import { Controller, Get, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('my-status')
  @UseGuards(JwtAuthGuard)
  async getMyStatus(@CurrentUser('id') userId: string) {
    return this.subscriptionsService.getMySubscriptionStatus(userId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(@CurrentUser('id') userId: string) {
    return this.subscriptionsService.getSubscriptionHistory(userId);
  }

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  async createOrder(@CurrentUser('id') userId: string) {
    // ₹10 is hardcoded as per the subscription plan
    const amount = 10;
    const order = await this.subscriptionsService.createRazorpayOrder(userId, amount);
    return { orderId: order.id, amount: order.amount, currency: order.currency };
  }

  @Post('verify-payment')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(
    @CurrentUser('id') userId: string,
    @Body() body: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
  ) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    const isValid = this.subscriptionsService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    // Activate subscription for ₹10
    const subscription = await this.subscriptionsService.activateSubscription(
      userId,
      10,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    return { success: true, subscription };
  }
}
