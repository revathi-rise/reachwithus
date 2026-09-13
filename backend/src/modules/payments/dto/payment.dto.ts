import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitManualPaymentDto {
  @IsNotEmpty()
  @IsString()
  transactionId: string;
}

export class CreateOrderDto {
  @IsOptional()
  amount?: number; // Defaults to 10
}

export class VerifyPaymentDto {
  @IsNotEmpty()
  @IsString()
  razorpayOrderId: string;

  @IsNotEmpty()
  @IsString()
  razorpayPaymentId: string;

  @IsNotEmpty()
  @IsString()
  razorpaySignature: string;
}

export class SandboxPaymentDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
