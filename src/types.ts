export interface Product {
  id: number;
  code: string;
  name: string;
  category_id: number;
  category_name?: string;
  buy_price: number;
  sell_price: number;
  stock: number;
  min_stock: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Service {
  id: number;
  name: string;
  price: number;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address: string;
  status?: string;
  last_service?: string;
  created_at: string;
}

export interface Mechanic {
  id: number;
  name: string;
  phone: string;
  role: string;
  specialty: string;
  commission_rate: number;
  rating: number;
  total_jobs: number;
  status: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  invoice_no: string;
  customer_id: number;
  customer_name?: string;
  mechanic_id: number;
  mechanic_name?: string;
  total_amount: number;
  discount: number;
  payment_method: string;
  created_at: string;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  created_at: string;
}

export type View = 'dashboard' | 'inventory' | 'transactions' | 'finance' | 'customers' | 'mechanics' | 'pos';
