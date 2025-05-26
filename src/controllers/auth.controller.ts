import { constants } from '@/config/constants';
import AuthService from '@/services/auth.service';
import { ApiResponse } from '@/types/response.type';
import { ApiError } from '@/utils/ApiError';
import { RequestHandler } from 'express';

const AuthController = {
  login: (async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const token = await AuthService.emailLogin(email, password);

      res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: constants.cookie.maxAge,
        sameSite: 'lax',
      });

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'auth.login-successful',
        content: null,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  oauthCallback: (async (req, res, next) => {
    try {
      if (!req.user) {
        // TODO: redirect ve frontend de hien thi loi
        throw new ApiError(401, 'auth.not-authenticated', true);
      }

      const token = req.user.token;

      res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: constants.cookie.maxAge,
        sameSite: 'lax',
      });

      res.redirect('http://localhost:5173');
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  verifyEmail: (async (req, res, next) => {
    try {
      const { token } = req.body;

      if (!token) {
        throw new ApiError(400, 'auth.invalid-verification-token');
      }

      const account = await AuthService.verifyEmail(token);

      const resBody: ApiResponse = {
        success: true,
        message: 'auth.email-verification-successful',
        statusCode: 200,
        content: account,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  resendVerificationEmail: (async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ApiError(400, 'auth.invalid-resend-email');
      }

      await AuthService.resendVerificationEmail(email);

      const resBody: ApiResponse = {
        success: true,
        message: 'auth.email-verification-resent',
        statusCode: 200,
        content: null,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  logout: (async (req, res, next) => {
    res.clearCookie('jwt');

    const resBody: ApiResponse = {
      success: true,
      message: 'auth.logout-successful',
      statusCode: 200,
      content: null,
    };

    res.status(200).json(resBody);
  }) as RequestHandler,

  changePassword: (async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'api:auth.login-first', true);
      }

      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      await AuthService.changePassword({
        userId,
        currentPassword,
        newPassword,
      });

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'auth.password-change-successful',
        content: null,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  checkOAuth: (async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'api:auth.login-first', true);
      }

      const userId = req.user.id;

      const isOAuth: boolean = await AuthService.isUserOAuth(userId);
      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        content: { isOAuth },
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  resetPasswordRequest: (async (req, res, next) => {
    try {
      if (!req.body) {
        throw new ApiError(400, 'auth.reset-password-invalid-data', true);
      }

      const { email } = req.body;

      if (!email || typeof email !== 'string') {
        throw new ApiError(400, 'auth.reset-password-invalid-data', true);
      }

      await AuthService.resetPasswordRequest(email);
      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'auth.reset-password-email-sent',
        content: null,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  validatePasswordResetToken: (async (req, res, next) => {
    try {
      const { token } = req.query;

      if (typeof token !== 'string') {
        throw new ApiError(400, 'auth.reset-password-token-invalid', true);
      }

      const result = await AuthService.validatePasswordResetToken(token);
      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'auth.reset-password-token-valid',
        content: result,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  resetPassword: (async (req, res, next) => {
    try {
      if (!req.body) {
        throw new ApiError(400, 'auth.reset-password-invalid-data', true);
      }

      const { token, newPassword } = req.body;

      if (
        !token ||
        !newPassword ||
        typeof token !== 'string' ||
        typeof newPassword !== 'string'
      ) {
        throw new ApiError(400, 'auth.reset-password-invalid-data', true);
      }

      await AuthService.resetPassword(token, newPassword);
      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'auth.reset-password-succesful',
        content: null,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};

export default AuthController;
