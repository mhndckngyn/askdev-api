import AnswerController from '@/controllers/answer.controller';
import { Router } from 'express';

const router = Router();

router.post('/hide', AnswerController.hideQuestions);
router.post('/unhide', AnswerController.unhideQuestions);

export default router;
