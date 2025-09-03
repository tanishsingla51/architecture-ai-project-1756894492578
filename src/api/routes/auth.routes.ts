import { Router } from 'express';
import { register, login } from '@/api/controllers/auth.controller';
import { validate } from '@/api/validators/auth.validator';
import { registerSchema, loginSchema } from '@/api/validators/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

export default router;
