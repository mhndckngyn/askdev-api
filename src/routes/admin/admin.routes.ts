import { Router } from 'express';
import questionRoute from './question.routes';
import answerRoute from './answer.routes';

const router = Router();

router.use('/question', questionRoute);
router.use('/answer', answerRoute);

export default router;
