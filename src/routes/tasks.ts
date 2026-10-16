import { Router } from 'express';
import * as taskController from '../controllers/tasks.js';
import { validate } from '../middlewares/validate.js';
import { createTaskSchema, listTasksSchema, taskIdParamSchema, updateTaskSchema } from '../schemas/tasks.js';

// Task API endpoints
const router = Router();

router.get('/', validate(listTasksSchema, 'query'), taskController.getTasks);
router.post('/', validate(createTaskSchema, 'body'), taskController.createTask);
router.get('/:id', validate(taskIdParamSchema, 'params'), taskController.getTaskById);
router.patch(
  '/:id',
  validate(taskIdParamSchema, 'params'),
  validate(updateTaskSchema, 'body'),
  taskController.updateTask,
);
router.delete('/:id', validate(taskIdParamSchema, 'params'), taskController.deleteTask);

export default router;