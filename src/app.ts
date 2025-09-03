import express from 'express';
import cors from 'cors';
import config from './config';
import apiRoutes from './api/routes';
import { errorHandlerMiddleware } from './api/middlewares/errorHandler.middleware';
import { NotFoundError } from './utils/apiError';

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/v1', apiRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Handle 404 Not Found
app.use((req, res, next) => {
  next(new NotFoundError());
});

// Global Error Handler
app.use(errorHandlerMiddleware);

export default app;
