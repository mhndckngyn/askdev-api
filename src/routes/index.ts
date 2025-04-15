import questionRoute from '@/routes/question.routes';
import { Router } from 'express';
import authRoute from './auth.routes';
import userRoute from './user.routes';

const router = Router();

router.use('/user', userRoute);
router.use('/auth', authRoute);
router.use('/question', questionRoute);

export default router;
