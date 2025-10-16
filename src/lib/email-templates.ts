// Email template rendering utilities

interface User {
  email: string;
  full_name?: string;
}

interface Order {
  id: string;
  total_amount: number;
  created_at: string;
  shipping_