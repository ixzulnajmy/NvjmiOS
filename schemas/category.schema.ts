import { z } from 'zod';

export const categoryTypes = ['expense', 'income'] as const;

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(60, 'Keep the name under 60 characters'),
  category_type: z.enum(categoryTypes),
  icon: z
    .string()
    .max(8, 'Use a short icon or emoji')
    .optional()
    .or(z.literal('')),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/, 'Use a valid hex color')
    .optional()
    .or(z.literal('')),
  sort_order: z.number().int().optional().default(0),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
