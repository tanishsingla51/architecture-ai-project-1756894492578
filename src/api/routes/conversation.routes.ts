import { Router } from 'express';
import { 
  getUserConversations, 
  getConversationById, 
  deleteConversation 
} from '@/api/controllers/conversation.controller';
import { authMiddleware } from '@/api/middlewares/auth.middleware';
import { validate } from '@/api/validators/auth.validator';
import { getConversationByIdSchema, deleteConversationSchema } from '../validators/conversation.validator';

const router = Router();

// All routes in this file are protected
router.use(authMiddleware);

router.get('/', getUserConversations);
router.get('/:id', validate(getConversationByIdSchema), getConversationById);
router.delete('/:id', validate(deleteConversationSchema), deleteConversation);

export default router;
