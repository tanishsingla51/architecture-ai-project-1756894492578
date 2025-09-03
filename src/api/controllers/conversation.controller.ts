import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '@/api/middlewares/auth.middleware';
import { NotFoundError, ForbiddenError } from '@/utils/apiError';

const prisma = new PrismaClient();

export const getUserConversations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });
    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
};

export const getConversationById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return next(new NotFoundError('Conversation not found'));
    }

    if (conversation.userId !== userId) {
      return next(new ForbiddenError('You are not authorized to view this conversation'));
    }

    res.status(200).json(conversation);
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return next(new NotFoundError('Conversation not found'));
    }

    if (conversation.userId !== userId) {
      return next(new ForbiddenError('You are not authorized to delete this conversation'));
    }

    await prisma.conversation.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
