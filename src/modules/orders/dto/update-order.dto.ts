import { PartialType } from '@nestjs/swagger'; // Gunakan versi Swagger
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
