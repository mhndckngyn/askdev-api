import { Router } from 'express';
import QuestionController from '@/controllers/question.controller';
import { authMiddleware } from '@/middlewares/auth';
import upload from '@/middlewares/multer';

const router = Router();

router.post(
  '/',
  upload.array('images'),
  authMiddleware,
  QuestionController.create
);

router.put('/:id', authMiddleware, QuestionController.update);

router.delete('/:id', authMiddleware, QuestionController.delete);

export default router;
