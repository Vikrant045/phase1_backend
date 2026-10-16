import { z } from 'zod';


const STATUS_VALUES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const;
const PRIORITY_VALUES = ['LOW', 'MEDIUM', 'HIGH'] as const;

// POST /tasks body
export const createTaskSchema = z.strictObject({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(5000).optional(),
  status: z.enum(STATUS_VALUES).optional(), // DB default kicks in when omitted
  priority: z.enum(PRIORITY_VALUES).optional(),
  dueDate: z.coerce.date().optional(), // "2026-10-20T17:00:00.000Z" -> real Date
});

// PATCH /tasks/:id body — any subset of the create fields
export const updateTaskSchema = createTaskSchema.partial();

// GET /tasks query — pagination, filtering, search
export const listTasksSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(STATUS_VALUES).optional(),
  priority: z.enum(PRIORITY_VALUES).optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

// Path params
export const taskIdParamSchema = z.object({
  id: z.uuid(),
});

// Types derived from the schemas (single source of truth)
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksInput = z.infer<typeof listTasksSchema>;