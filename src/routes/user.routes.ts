import express from 'express';
import upload from '@/middlewares/multer';
import UserController from '@/controllers/user.controller';
import { authMiddleware } from '@/middlewares/auth';

const router = express.Router();

router.post(
  '/signup',
  upload.single('avatar'),
  UserController.signup
);

router.get('/me', authMiddleware, UserController.getMe)

export default router;
