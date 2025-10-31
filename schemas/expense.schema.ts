import { z } from 'zod';

export const transactionTypeEnum = ['expense', 'income', 'transfer'] as const;

export const expenseCategories = [
  'food',
  'transport',
  'girlfriend',
  'shopping',
  'bills',
  'other',
  'salary',
  'investments',
  'gifts',
  'subscriptions',
  'health',
  'entertainment',
  'groceries',
  'travel',
] as const;

export const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  transaction_type: z.enum(transactionTypeEnum),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(60, 'Category name too long'),
  item_name: z.string().min(1, 'Item name is required'),
  merchant_name: z.string().max(255).optional(),
  description: z.string().optional(),
  date: z.string().or(z.date()),
  occurred_at: z.string().datetime().optional(),
  receipt_url: z.string().url().optional().or(z.literal('')),
  account_id: z.string().uuid('Invalid account ID').optional(),
  payment_method_id: z.string().uuid('Invalid payment method ID').optional(),
  payment_channel: z.string().optional(),
  counterparty_type: z.string().optional(),
  sort_order: z.number().int().default(0),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
