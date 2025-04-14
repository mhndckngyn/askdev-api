import { Router } from "express";
import userRoute from './user.routes';
import authRoute from './auth.routes';
import questionRoute from '@/routes/question.routes';
import { authMiddleware } from '@/middlewares/auth';

const router = Router();

router.use('/user', userRoute);
router.use('/auth', authRoute);
router.use('/user/question',authMiddleware, questionRoute);

export default router;
