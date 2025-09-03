import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/apiError';
import logger from '@/utils/logger';
import { ZodError } from 'zod';

export const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    logger.warn(`API Error: ${err.statusCode} - ${err.message}`);
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    logger.warn(`Validation Error: ${err.message}`);
    return res.status(400).json({ error: 'Invalid input', details: err.errors });
  }

  logger.error('Internal Server Error:', err);
  return res.status(500).json({ error: 'Internal Server Error' });
};
