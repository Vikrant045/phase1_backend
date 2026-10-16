import prisma from '../utils/prisma.js';
import { AppError } from '../middlewares/error.js';
import type { Task } from '../generated/prisma/client.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { ApiMeta } from '../utils/response.js';
import type { CreateTaskInput, ListTasksInput, UpdateTaskInput } from '../schemas/tasks.js';

// GET /tasks (list with pagination, filter, search)
export const listTasks = async (filters: ListTasksInput): Promise<{ tasks: Task[]; meta: ApiMeta }> => {

  const where: Prisma.TaskWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Default ordering: newest first with id as tie-breaker for stable pagination
  const orderBy: Prisma.TaskOrderByWithRelationInput[] = [
    { createdAt: 'desc' },
    { id: 'asc' },
  ];

  const skip = (filters.page - 1) * filters.limit;

  // Page data + total count run in parallel (count is needed for meta)
  const [tasks, totalItems] = await Promise.all([
    prisma.task.findMany({ where, skip, take: filters.limit, orderBy }),
    prisma.task.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / filters.limit);

  return {
    tasks,
    meta: {
      page: filters.page,
      limit: filters.limit,
      totalItems,
      totalPages,
      hasNext: filters.page < totalPages,
      hasPrev: filters.page > 1,
    },
  };
};

// POST /tasks
export const createTask = (input: CreateTaskInput): Promise<Task> => {
  return prisma.task.create({ data: input });
};

// GET /tasks/:id
export const getTaskById = async (id: string): Promise<Task> => {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new AppError('Task not found', 404);
  return task;
};

// PATCH /tasks/:id
export const updateTask = async (id: string, input: UpdateTaskInput): Promise<Task> => {
  await getTaskById(id);
  return prisma.task.update({ where: { id }, data: input });
};

// DELETE /tasks/:id
export const deleteTask = async (id: string): Promise<Task> => {
  await getTaskById(id);
  return prisma.task.delete({ where: { id } });
};