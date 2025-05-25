import '@/config/passport';
import AuthController from '@/controllers/auth.controller';
import { authUser } from '@/middlewares/auth';
import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.post('/login', AuthController.login);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/github',
  passport.authenticate('github', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/', session: false }),
  AuthController.oauthCallback
);

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/', session: false }),
  AuthController.oauthCallback
);

router.post('/verify-email', AuthController.verifyEmail);

router.post('/resend-verification-email', AuthController.resendVerificationEmail);

router.post('/logout', AuthController.logout);

router.patch('/:id/password', authUser, AuthController.changePassword);

router.get('/:id/isOAuth', authUser, AuthController.checkOAuth);

export default router;
