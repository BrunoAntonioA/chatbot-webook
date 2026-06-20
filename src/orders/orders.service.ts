import { Injectable, Logger } from '@nestjs/common';
import {
  CreateOrderInput,
  CreateOrderResult,
} from '../common/interfaces/order.interface';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly ordersRepository: OrdersRepository) {}

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    try {
      const result = await this.ordersRepository.create(input);
      this.logger.log(
        `Order created: ${result.order.id} (company=${result.order.company_id}, customer=${result.customerId})`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create order for ${input.phone_number}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
