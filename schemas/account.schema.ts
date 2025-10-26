import { z } from 'zod';

export const accountSchema = z.object({
  account_type: z.enum(['savings', 'checking', 'credit_card', 'bnpl', 'ewallet'], {
    required_error: 'Account type is required',
  }),
  provider: z.string().min(1, 'Provider is required').max(255),
  name: z.string().min(1, 'Account name is required').max(255),
  balance: z.number().optional(),
  credit_limit: z.number().positive('Credit limit must be positive').optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').default('#3b82f6'),
  is_active: z.boolean().default(true),
});

export const paymentMethodSchema = z.object({
  account_id: z.string().uuid('Invalid account ID'),
  method_type: z.enum(['qr_code', 'apple_pay_tap', 'physical_card_tap', 'apple_pay_online', 'bank_transfer', 'fpx', 'cash'], {
    required_error: 'Payment method type is required',
  }),
  is_default: z.boolean().default(false),
});

export const bnplSchema = z.object({
  account_id: z.string().uuid('Invalid account ID').optional(),
  merchant: z.string().min(1, 'Merchant is required').max(255),
  item_name: z.string().max(255).optional(),
  total_amount: z.number().positive('Total amount must be positive'),
  installment_amount: z.number().positive('Installment amount must be positive'),
  installments_total: z.number().int().positive('Must have at least 1 installment'),
  installments_paid: z.number().int().min(0).default(0),
  next_due_date: z.string().or(z.date()).optional(),
  status: z.enum(['active', 'completed', 'overdue']).default('active'),
  notes: z.string().optional(),
});

export const creditCardSchema = z.object({
  account_id: z.string().uuid('Invalid account ID'),
  statement_date: z.string().or(z.date()).optional(),
  due_date: z.string().or(z.date()),
  total_amount: z.number().positive('Total amount must be positive'),
  minimum_payment: z.number().min(0, 'Minimum payment cannot be negative'),
  paid_amount: z.number().min(0, 'Paid amount cannot be negative').default(0),
  status: z.enum(['pending', 'paid', 'overdue']).default('pending'),
  notes: z.string().optional(),
});

export type AccountFormData = z.infer<typeof accountSchema>;
export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;
export type BNPLFormData = z.infer<typeof bnplSchema>;
export type CreditCardFormData = z.infer<typeof creditCardSchema>;
