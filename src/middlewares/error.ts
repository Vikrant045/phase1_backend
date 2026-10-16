import type { ErrorRequestHandler, Request, Response } from 'express';
import { ZodError } from 'zod';

/**
 * Custom application error with HTTP status code.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * 404 for routes nobody handles. Mounted AFTER all routers.
 */
export const routeNotFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

/**
 * Global error handler — the required 4-argument signature (err, req, res, next).
 * Express calls this whenever next(error) flows forward, or an async handler
 * rejects (Express 5 forwards async errors automatically).
 */
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  // 1. Our own HTTP errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }

  // 2. Zod validation errors -> 400 with per-field details
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      })),
    });
    return;
  }

  // 3. Malformed JSON body (thrown by express.json())
  if (error?.type === 'entity.parse.failed') {
    res.status(400).json({ success: false, message: 'Malformed JSON body' });
    return;
  }

  // 4. Other errors that already carry a status (e.g. "entity.too.large" -> 413)
  if (typeof error?.status === 'number') {
    res.status(error.status).json({ success: false, message: 'Bad request' });
    return;
  }

  // 5. Unknown errors -> 500. Full details stay in server logs only.
  console.error('[Unhandled error]', error);
  res.status(500).json({ success: false, message: 'Internal server error' });
};