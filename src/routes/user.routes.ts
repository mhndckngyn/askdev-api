import UserController from '@/controllers/user.controller';
import { authUser } from '@/middlewares/auth';
import upload from '@/middlewares/multer';
import express from 'express';

const router = express.Router();

router.post('/signup', UserController.signup);

router.get('/me', authUser, UserController.getMe);

router.get('/', UserController.getByParams);

router.post(
  '/profile',
  upload.array('images'),
  authUser,
  UserController.updateProfile
);

router.get('/profile/:id', UserController.getProfileById);

router.get('/profile/:id/edit', UserController.getProfileForEdit);

export default router;
