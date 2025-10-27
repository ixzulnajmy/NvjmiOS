import { z } from 'zod';

export const friendDebtSchema = z.object({
  friend_name: z.string()
    .min(1, 'Friend name is required')
    .max(100, 'Friend name must be less than 100 characters'),
  amount: z.number()
    .positive('Amount must be positive')
    .max(999999.99, 'Amount is too large'),
  debt_type: z.enum(['they_owe_me', 'i_owe_them'], {
    errorMap: () => ({ message: 'Please select who owes whom' })
  }),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  related_expense_id: z.string()
    .uuid('Invalid expense ID')
    .optional(),
  due_date: z.string()
    .or(z.date())
    .optional(),
  status: z.enum(['pending', 'paid', 'cancelled'])
    .default('pending'),
});

export type FriendDebtFormData = z.infer<typeof friendDebtSchema>;
