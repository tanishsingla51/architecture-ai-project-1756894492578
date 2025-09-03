import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';
import config from '@/config';
import { UnauthorizedError } from '@/utils/apiError';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token is required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    // Catch JWT errors like TokenExpiredError
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid authentication token'));
    } else {
      next(error);
    }
  }
};
