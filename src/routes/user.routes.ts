import UserController from '@/controllers/user.controller';
import { authUser } from '@/middlewares/auth';
import express from 'express';

const router = express.Router();

router.post('/signup', UserController.signup);

router.get('/me', authUser, UserController.getMe);

router.get('/', UserController.getByParams);

export default router;
