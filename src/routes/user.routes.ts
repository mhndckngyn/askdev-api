import UserController from '@/controllers/user.controller';
import { authMiddleware } from '@/middlewares/auth';
import express from 'express';

const router = express.Router();

router.post('/signup', UserController.signup);

router.get('/me', authMiddleware, UserController.getMe);

export default router;
