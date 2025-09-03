import { Server, Socket } from 'socket.io';
import { PrismaClient, Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import config from '@/config';
import logger from '@/utils/logger';
import { llmService } from '@/services/llmService';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  user?: { id: string };
}

export const initializeChat = (io: Server) => {
  // Middleware for authenticating socket connections
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
      socket.user = { id: decoded.id };
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Socket connected: ${socket.id} for user ${socket.user?.id}`);

    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content } = data;
        const userId = socket.user!.id;

        let convId = conversationId;

        // Create a new conversation if no ID is provided
        if (!convId) {
          const newConversation = await prisma.conversation.create({
            data: {
              userId,
              title: content.substring(0, 50), // Use first 50 chars as title
            },
          });
          convId = newConversation.id;
          socket.emit('conversation_created', { id: convId, title: newConversation.title });
        }

        // Save user message
        await prisma.message.create({
          data: {
            conversationId: convId,
            content,
            role: Role.USER,
          },
        });

        // Get conversation history
        const history = await prisma.message.findMany({
          where: { conversationId: convId },
          orderBy: { createdAt: 'asc' },
        });

        let assistantResponse = '';
        // Stream LLM response
        for await (const chunk of llmService.streamChatCompletion(history)) {
          assistantResponse += chunk;
          socket.emit('receive_chunk', { chunk });
        }

        // Save full assistant response
        if (assistantResponse) {
          await prisma.message.create({
            data: {
              conversationId: convId,
              content: assistantResponse,
              role: Role.ASSISTANT,
            },
          });
        }

        socket.emit('stream_end');

      } catch (error) {
        logger.error('Socket send_message error:', error);
        socket.emit('error', { message: 'An error occurred while processing your message.' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};
