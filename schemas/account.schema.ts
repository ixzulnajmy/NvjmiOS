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

export const bnplInstallmentSchema = z.object({
  id: z.string().uuid().optional(),
  sequence: z.number().int().min(1, 'Sequence starts at 1'),
  amount: z.number().positive('Installment amount must be positive'),
  due_date: z.string().or(z.date()).optional(),
  is_paid: z.boolean().default(false),
  paid_at: z.string().or(z.date()).optional(),
});

export const bnplSchema = z
  .object({
    account_id: z.string().uuid('Invalid account ID').optional(),
    merchant: z.string().min(1, 'Merchant is required').max(255),
    item_name: z.string().max(255).optional(),
    total_amount: z.number().positive('Total amount must be positive'),
    installments: z
      .array(bnplInstallmentSchema)
      .min(1, 'Add at least one installment')
      .refine(
        (installments) =>
          installments.every((inst) => inst.sequence === Math.round(inst.sequence)) &&
          installments.every((inst, index) => inst.sequence === index + 1),
        'Installments must be in sequence order without gaps'
      ),
    next_due_date: z.string().or(z.date()).optional(),
    status: z.enum(['active', 'completed', 'overdue']).default('active'),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      const total = data.total_amount;
      const sum = data.installments.reduce((acc, inst) => acc + inst.amount, 0);
      return Math.abs(total - sum) < 0.05;
    },
    {
      message: 'Installment amounts should add up to the total amount (allowing a few cents rounding difference)',
      path: ['installments'],
    }
  );

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
export type BNPLInstallmentFormData = z.infer<typeof bnplInstallmentSchema>;
export type CreditCardFormData = z.infer<typeof creditCardSchema>;
