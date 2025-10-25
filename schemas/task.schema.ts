import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  due_date: z.string().or(z.date()).optional().nullable(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  completed: z.boolean().default(false),
  list_type: z.enum(['today', 'someday', 'work', 'personal', 'groceries', 'goals']).default('today'),
  recurring_rule: z.record(z.any()).optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
