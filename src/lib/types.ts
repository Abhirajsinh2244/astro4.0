import { z } from 'zod';

// Domain Enums and Constants
export type TransactionType = 'expense' | 'income';
export type Status = 'Cleared' | 'Pending';
export type Account = 'Checking' | 'Credit Card' | 'Savings';
export type BudgetPeriod = 'monthly' | 'weekly';

export const CATEGORY_MAP: Record<string, string> = {
  'Food & Drink': 'Food & Drink',
  'Groceries': 'Groceries',
  'Transport': 'Transport',
  'Entertainment': 'Entertainment',
  'Utilities': 'Utilities',
  'Payroll': 'Payroll',
  'Investments': 'Investments'
};

// --- Transaction Schemas ---
export const transactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Expected YYYY-MM-DD."),
  merchant: z.string().min(1, "Merchant name is required."),
  category: z.string().min(1, "Category classification is required."),
  description: z.string().optional(),
  amount: z.number().positive("Transaction amount must be strictly greater than zero."),
  account: z.string().min(1, "Account assignment is required."),
  status: z.enum(['Cleared', 'Pending']),
  type: z.enum(['expense', 'income'])
});

export type TransactionPayload = z.infer<typeof transactionSchema>;

export interface Transaction extends TransactionPayload {
  id: string;
  created_at?: string;
}

// --- Budget Schemas (NEW) ---
export const budgetSchema = z.object({
  category: z.string().min(1, "Category is required."),
  limit_amount: z.number().positive("Limit must be greater than zero."),
  period: z.enum(['monthly', 'weekly']),
});

export type BudgetPayload = z.infer<typeof budgetSchema>;

export interface Budget extends BudgetPayload {
  id: string;
  created_at?: string;
}

// Standardized API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  timestamp?: string;
}