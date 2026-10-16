import type { Response } from 'express';

/**
 * Pagination metadata sent along with list responses.
 */
export interface ApiMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Every successful response uses this single shape:
 * { success, message, data?, meta? }
 */
export const sendSuccess = (
  res: Response,
  status: number,
  message: string,
  data?: unknown,
  meta?: ApiMeta,
): void => {
  res.status(status).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
    ...(meta ? { meta } : {}),
  });
};