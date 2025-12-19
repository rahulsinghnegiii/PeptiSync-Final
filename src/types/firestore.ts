// Firestore type definitions
import { Timestamp } from "firebase/firestore";

export type UserRole = 'admin' | 'moderator' | 'user';
export type MembershipTier = 'free' | 'basic' | 'pro' | 'pro_plus' | 'elite' | 'premium';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// User profile - supports both camelCase (website) and snake_case (Firebase app)
export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  display_name?: string; // Firebase app uses snake_case
  avatarUrl?: string;
  photo_url?: string; // Firebase app uses snake_case
  membershipTier: MembershipTier;
  plan_tier?: string; // Firebase app uses snake_case
  isAdmin?: boolean; // Website uses camelCase
  is_admin?: boolean; // Firebase app uses snake_case
  isModerator?: boolean; // Website uses camelCase
  is_moderator?: boolean; // Firebase app uses snake_case
  shippingAddress?: ShippingAddress;
  createdAt?: Timestamp;
  created_time?: Timestamp; // Firebase app uses snake_case
  updatedAt?: Timestamp;
  last_login?: Timestamp; // Firebase app field
}

// Shipping address
export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

// User role
export interface UserRoleDoc {
  uid: string;
  role: UserRole;
  createdAt: Timestamp;
}

// Product
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
  category: string;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Cart item
export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Order
export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  paymentIntentId?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Order item (subcollection)
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  createdAt: Timestamp;
}

// Review
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Analytics event
export interface AnalyticsEvent {
  id: string;
  userId?: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: Timestamp;
}

// Email preference
export interface EmailPreference {
  uid: string;
  orderConfirmations: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  updatedAt: Timestamp;
}

// Helper types for creating documents (without id and timestamps)
export type CreateUserProfile = Omit<UserProfile, 'createdAt' | 'updatedAt'>;
export type CreateProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateCartItem = Omit<CartItem, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateOrder = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateOrderItem = Omit<OrderItem, 'id' | 'createdAt'>;
export type CreateReview = Omit<Review, 'id' | 'createdAt' | 'updatedAt'>;

// Helper types for updating documents (all fields optional except id)
export type UpdateUserProfile = Partial<Omit<UserProfile, 'uid' | 'createdAt'>> & { uid: string };
export type UpdateProduct = Partial<Omit<Product, 'id' | 'createdAt'>> & { id: string };
export type UpdateCartItem = Partial<Omit<CartItem, 'id' | 'createdAt'>> & { id: string };
export type UpdateOrder = Partial<Omit<Order, 'id' | 'createdAt'>> & { id: string };
export type UpdateReview = Partial<Omit<Review, 'id' | 'createdAt'>> & { id: string };

