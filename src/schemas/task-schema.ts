import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters' })
    .max(100, { message: 'Title must be under 100 characters' }),
  module: z
    .string()
    .min(2, { message: 'Module/Course code must be at least 2 characters' }),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Due date must be in YYYY-MM-DD format' }),
  priority: z.enum(['low', 'medium', 'high']),
  notes: z.string(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
