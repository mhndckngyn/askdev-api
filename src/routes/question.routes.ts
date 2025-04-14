import { Router } from 'express';
import QuestionController from '@/controllers/question.controller';

const router = Router();

router.post('/', QuestionController.create);

router.put('/:id', QuestionController.update);

router.delete('/:id', QuestionController.delete);

export default router;
