export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  quantityOnHand: number;
  imageUrl?: string;
  createdAt: string;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  price: number;
  quantityOnHand: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail?: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderRequest {
  customerName: string;
  customerEmail?: string;
  items: { productId: string; quantity: number }[];
}

export interface InventoryAdjustment {
  id: string;
  type: string;
  quantityChange: number;
  reason?: string;
  adjustedByName: string;
  createdAt: string;
}
