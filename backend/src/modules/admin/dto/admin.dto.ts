import { IsNotEmpty, IsString } from 'class-validator';

export class RejectPostDto {
  @IsNotEmpty({ message: 'Rejection reason is required' })
  @IsString()
  reason: string;
}
