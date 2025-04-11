import { Router } from "express";
import userRoute from './user.routes';
import authRoute from './auth.routes';

const router = Router();

router.use('/user', userRoute);
router.use('/auth', authRoute);

export default router;
