import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import app from './app';
import config from './config';
import logger from './utils/logger';
import { initializeChat } from './sockets/chatHandler';

const prisma = new PrismaClient();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
  },
});

// Initialize Socket.IO chat logic
initializeChat(io);

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully.');

    server.listen(config.port, () => {
      logger.info(`Server is running on http://localhost:${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to connect to the database', error);
    process.exit(1);
  }
};

startServer();
