import { RequestHandler } from 'express';
import UserService from '@/services/user.service';
import { ApiResponse } from '@/types/response.type';

const UserController = {
  signup: (async (req, res, next) => {
    try {
      const { email, password, username } = req.body;

      const user = await UserService.signup({ email, password, username });

      const resBody: ApiResponse = {
        success: true,
        statusCode: 201,
        message: 'user.signup-successful',
        content: user,
      };

      res.status(201).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  getMe: (async (req, res, next) => {
    try {
      const user = req.user;

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'user.getme-successful',
        content: {
          user,
        },
      };

      res.status(200).json(resBody);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,
};

export default UserController;
