export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  created_at: string;
}

export interface Family {
  id: string;
  name: string;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id?: string;
  name: string;
  relation: 'Father' | 'Mother' | 'Son' | 'Daughter' | 'Sister' | 'Brother' | 'Spouse' | 'Other';
  monthly_income_target?: number;
  avatar_url?: string;
  created_at: string;
}

export interface Account {
  id: string;
  family_member_id: string;
  bank_name: string; // e.g., Nabil Bank, Global IME Bank, NIC Asia Bank
  account_number: string;
  balance: number;
  currency: string; // 'NPR'
  updated_at: string;
}

export type TransactionType = 'income' | 'expense';

export type CategoryType = 
  | 'Food & Groceries'
  | 'Transportation'
  | 'Shopping'
  | 'Utilities'
  | 'Education'
  | 'Healthcare'
  | 'Entertainment'
  | 'Housing'
  | 'Salary'
  | 'Investment'
  | 'Transfer'
  | 'Other';

export interface Transaction {
  id: string;
  family_id: string;
  family_member_id: string;
  account_name: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  category: CategoryType;
  subcategory?: string;
  merchant?: string;
  is_unusual?: boolean;
  unusual_reason?: string;
  confidence?: number;
  created_at: string;
}

export interface Budget {
  id: string;
  family_id: string;
  category: CategoryType;
  monthly_budget: number;
  month_year: string; // YYYY-MM
  created_at: string;
}

export interface SIP {
  id: string;
  family_id: string;
  family_member_id: string;
  fund_name: string;
  monthly_amount: number;
  frequency: 'monthly' | 'quarterly';
  start_date: string; // YYYY-MM-DD
  duration_months: number;
  goal_id?: string;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
}

export interface Goal {
  id: string;
  family_id: string;
  family_member_id?: string; // Optional if family goal
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string; // YYYY-MM-DD
  category: 'Education' | 'Emergency Fund' | 'House' | 'Retirement' | 'Vacation' | 'Other';
  status: 'in_progress' | 'completed';
  created_at: string;
}

export interface MutualFund {
  id: string;
  name: string;
  category: string;
  return_1yr: number; // percentage
  return_3yr: number; // percentage
  risk_level: 'Low' | 'Moderate' | 'High';
  min_sip: number;
}

export interface AIInsight {
  id: string;
  family_id: string;
  title: string;
  content: string;
  type: 'alert' | 'positive' | 'tip' | 'warning';
  date: string;
  created_at: string;
}

export interface CSVUploadResult {
  transactions_imported: number;
  total_income: number;
  total_expenses: number;
  duplicates_skipped: number;
  unusual_detected: number;
  member_name: string;
}

export interface DashboardAnalytics {
  total_balance: number;
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings: number;
  savings_rate: number;
  income_vs_expense_chart: { month: string; income: number; expense: number; savings: number }[];
  category_spending_chart: { category: string; amount: number }[];
  member_spending_chart: { member_name: string; amount: number; percentage: number }[];
  unusual_transactions: Transaction[];
}
