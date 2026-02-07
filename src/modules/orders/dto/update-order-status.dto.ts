import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.PREPARING, // Sudah sinkron dengan Enum Bos sekarang!
    description: 'The new progress status of the order',
  })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
