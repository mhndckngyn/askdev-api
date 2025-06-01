import AnswerController from '@/controllers/answer.controller';
import { Router } from 'express';

const router = Router();

router.get("/", AnswerController.getByParams);
router.patch('/hide', AnswerController.hideAnswers);
router.patch('/unhide', AnswerController.unhideAnswers);

export default router;
