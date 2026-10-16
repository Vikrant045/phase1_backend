import express from 'express';
import cors from 'cors';
import { requestLogger } from './middlewares/logger.middleware.js';
import taskRoutes from './routes/tasks.js';
import { errorHandler, routeNotFound } from './middlewares/error.js';

const app = express();

// global middlewares 
app.use(cors());
app.use(express.json()); 
app.use(requestLogger);


// Task API routes
app.use('/api/v1/tasks', taskRoutes);

// not found 404 
app.use(routeNotFound);

// error handler
app.use(errorHandler);

export default app;