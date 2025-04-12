import { RequestHandler } from 'express';
import AuthService from '@/services/auth.service';
import { Profile } from 'passport-google-oauth20';
import { ApiError } from '@/utils/ApiError';
import { constants } from '@/config/constants';
import { ApiResponse } from '@/types/response.type';

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
        throw new ApiError(401, 'auth.not-authenticated');
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
};

export default AuthController;
