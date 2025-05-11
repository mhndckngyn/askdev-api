import { Router } from 'express';
import questionRoute from './question.routes';
import answerRoute from './answer.routes';
import tagRoute from './tag.routes';

const router = Router();

router.use('/question', questionRoute);
router.use('/answer', answerRoute);
router.use('/tag', tagRoute);
export default router;
