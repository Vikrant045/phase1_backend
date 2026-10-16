import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

/**
 * Generic Zod validation middleware (the 3-tier guard: route -> validate -> controller).
 * Validates `req.body`, `req.query` or `req.params` and stores the CLEAN, typed
 * result in res.locals under the same key.
 *
 * Why res.locals? Express 5 keeps `req.query` read-only, so overwriting it is
 * not allowed — res.locals is the per-request storage Express gives us for
 * passing data forward.
 *
 * Invalid input throws ZodError -> next(error) -> global error handler.
 */
export const validate =
  (schema: ZodType, target: 'body' | 'query' | 'params') =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      res.locals[target] = schema.parse(req[target]);
      next();
    } catch (error) {
      next(error); // ZodError
    }
  };