export enum OrderStatus {
  PENDING = 'pending',
  CREATED = 'created',
  DELIVERED = 'delivered',
}

export interface OrderItem {
  id: string;
  order_id: string;
  product: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  company_id: string;
  created_by: string;
  customer_id: string;
  route_id: string | null;
  order_date: string;
  status: OrderStatus;
  total: number;
  stop_sequence: number | null;
  notes: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderInput {
  phone_number: string;
  product: string;
  product_key?: string;
  quantity: number;
  address: string;
  delivery_time: string;
}

export interface CreateOrderResult {
  order: Order;
  orderItem: OrderItem;
  customerId: string;
}
