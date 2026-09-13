import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateOrderDto, SubmitManualPaymentDto, VerifyPaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.paymentsService.createOrder(userId, dto);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyPayment(
    @CurrentUser('id') userId: string,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.paymentsService.verifyPayment(userId, dto);
  }

  @Post('simulate-sandbox')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async simulateSandbox(@CurrentUser('id') userId: string) {
    return this.paymentsService.simulateSandboxPayment(userId);
  }

  @Get('manual-payment-details')
  async getManualPaymentDetails() {
    return this.paymentsService.getManualPaymentDetails();
  }

  @Post('manual-submissions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async submitManualPayment(
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitManualPaymentDto,
  ) {
    return this.paymentsService.submitManualPayment(userId, dto);
  }

  @Get('my-transactions')
  @UseGuards(JwtAuthGuard)
  async getMyTransactions(@CurrentUser('id') userId: string) {
    return this.paymentsService.getUserTransactions(userId);
  }
}
