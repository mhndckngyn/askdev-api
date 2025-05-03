import QuestionController from '@/controllers/question.controller';
import { Router } from 'express';

const router = Router();

router.post('/hide', QuestionController.hideQuestions);
router.post('/unhide', QuestionController.unhideQuestions);

export default router;
