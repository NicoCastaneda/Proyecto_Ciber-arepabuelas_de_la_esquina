import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  full_name: string;
  photo_url?: string;
  role: 'admin' | 'customer';
  status: 'pending' | 'active' | 'blocked';
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_status: string;
  created_at: string;
};

export type Comment = {
  id: string;
  product_id: string;
  user_id: string;
  comment_text: string;
  rating: number;
  created_at: string;
  user?: {
    full_name: string;
    photo_url?: string;
  };
};

export type Coupon = {
  id: string;
  code: string;
  discount_percentage: number;
  used: boolean;
  expires_at: string;
};
