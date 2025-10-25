import { z } from 'zod';

export const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category: z.enum(['food', 'transport', 'girlfriend', 'shopping', 'bills', 'other']),
  description: z.string().optional(),
  date: z.string().or(z.date()),
  receipt_url: z.string().url().optional().or(z.literal('')),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
