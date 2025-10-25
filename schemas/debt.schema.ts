import { z } from 'zod';

export const debtSchema = z.object({
  name: z.string().min(1, 'Debt name is required').max(255),
  total_amount: z.number().positive('Total amount must be positive'),
  current_balance: z.number().positive('Current balance must be positive'),
  interest_rate: z.number().min(0).max(100).default(0),
  minimum_payment: z.number().min(0).default(0),
  due_day: z.number().min(1).max(31),
  category: z.enum(['credit_card', 'installment', 'paylater', 'loan', 'insurance', 'other']),
});

export const debtPaymentSchema = z.object({
  debt_id: z.string().uuid(),
  amount: z.number().positive('Payment amount must be positive'),
  payment_date: z.string().or(z.date()),
  notes: z.string().optional(),
});

export type DebtFormData = z.infer<typeof debtSchema>;
export type DebtPaymentFormData = z.infer<typeof debtPaymentSchema>;
