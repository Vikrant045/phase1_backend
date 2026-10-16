import type { Request, Response } from 'express';
import * as taskService from '../services/tasks.js';
import { sendSuccess } from '../utils/response.js';
import type { CreateTaskInput, ListTasksInput, UpdateTaskInput } from '../schemas/tasks.js';


export const createTask = async (req: Request, res: Response): Promise<void> => {
  const input: CreateTaskInput = res.locals.body;
  const task = await taskService.createTask(input);
  sendSuccess(res, 201, 'Task created successfully', task);
};

export const getTasks = async (_req: Request, res: Response): Promise<void> => {
  const query: ListTasksInput = res.locals.query;
  const { tasks, meta } = await taskService.listTasks(query);
  sendSuccess(res, 200, 'Tasks fetched successfully', tasks, meta);
};

export const getTaskById = async (_req: Request, res: Response): Promise<void> => {
  const { id } = res.locals.params;
  const task = await taskService.getTaskById(id);
  sendSuccess(res, 200, 'Task fetched successfully', task);
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const { id } = res.locals.params;
  const input: UpdateTaskInput = res.locals.body;
  const task = await taskService.updateTask(id, input);
  sendSuccess(res, 200, 'Task updated successfully', task);
};

export const deleteTask = async (_req: Request, res: Response): Promise<void> => {
  const { id } = res.locals.params;
  const task = await taskService.deleteTask(id);
  sendSuccess(res, 200, 'Task deleted successfully', task);
};