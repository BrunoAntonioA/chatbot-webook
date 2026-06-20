import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';

@Module({
  imports: [CustomersModule],
  providers: [OrdersRepository, OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
