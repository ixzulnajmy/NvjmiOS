import { z } from 'zod';

export const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category: z.enum(['food', 'transport', 'girlfriend', 'shopping', 'bills', 'other']),
  merchant_name: z.string().max(255).optional(),
  description: z.string().optional(),
  date: z.string().or(z.date()),
  receipt_url: z.string().url().optional().or(z.literal('')),
  account_id: z.string().uuid('Invalid account ID').optional(),
  payment_method_id: z.string().uuid('Invalid payment method ID').optional(),
  statement_id: z.string().uuid('Invalid statement ID').optional(),
  is_reconciled: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
