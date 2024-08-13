export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface Order {
  userId: string;
  total: number;
  items: OrderItem[];
}

export interface OrderCountResponse {
  count: number;
  couponCode?: string;
  total: number;
}

