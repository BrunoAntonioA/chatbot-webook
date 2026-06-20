import { Injectable, Logger } from '@nestjs/common';
import {
  CreateOrderInput,
  CreateOrderResult,
  Order,
  OrderItem,
  OrderStatus,
} from '../common/interfaces/order.interface';
import { CompanyConfigService } from '../company/company-config.service';
import { CustomersRepository } from '../customers/customers.repository';
import { SupabaseService } from '../database/supabase.service';
import { resolveProductCatalogEntry } from '../common/products';

@Injectable()
export class OrdersRepository {
  private readonly logger = new Logger(OrdersRepository.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly companyConfigService: CompanyConfigService,
    private readonly customersRepository: CustomersRepository,
  ) {}

  async create(input: CreateOrderInput): Promise<CreateOrderResult> {
    const { companyId, createdBy } = this.companyConfigService.getContext();
    const catalogEntry = resolveProductCatalogEntry(
      input.product_key,
      input.product,
    );
    const total = catalogEntry.unitPrice * input.quantity;

    const customer = await this.customersRepository.findOrCreate({
      phone: input.phone_number,
      address: input.address,
    });

    const order = await this.insertOrder({
      companyId,
      createdBy,
      customerId: customer.id,
      total,
      notes: `Entrega: ${input.delivery_time} (WhatsApp)`,
    });

    const orderItem = await this.insertOrderItem({
      orderId: order.id,
      product: catalogEntry.dbName,
      quantity: input.quantity,
      unitPrice: catalogEntry.unitPrice,
    });

    return { order, orderItem, customerId: customer.id };
  }

  private async insertOrder(params: {
    companyId: string;
    createdBy: string;
    customerId: string;
    total: number;
    notes: string;
  }): Promise<Order> {
    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await this.supabaseService
      .getClient()
      .from('orders')
      .insert({
        company_id: params.companyId,
        created_by: params.createdBy,
        customer_id: params.customerId,
        order_date: today,
        status: OrderStatus.PENDING,
        total: params.total,
        notes: params.notes,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to create order: ${error.message}`, error);
      throw new Error(`Database error: ${error.message}`);
    }

    return data as Order;
  }

  private async insertOrderItem(params: {
    orderId: string;
    product: string;
    quantity: number;
    unitPrice: number;
  }): Promise<OrderItem> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('order_items')
      .insert({
        order_id: params.orderId,
        product: params.product,
        quantity: params.quantity,
        unit_price: params.unitPrice,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to create order item: ${error.message}`, error);
      throw new Error(`Database error: ${error.message}`);
    }

    return data as OrderItem;
  }
}
