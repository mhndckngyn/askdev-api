import AuthService from '@/services/auth.service';
import BanService from '@/services/ban.service';
import UserService from '@/services/user.service';
import { ApiResponse } from '@/types/response.type';
import { AdminGetUserParams, GetUsersParam } from '@/types/user.type';
import { ApiError } from '@/utils/ApiError';
import { resolveObjectURL } from 'buffer';
import { RequestHandler } from 'express';

const UserController = {
  signup: (async (req, res, next) => {
    try {
      const { email, password, username } = req.body;

      const user = await AuthService.signup({ email, password, username });

      const resBody: ApiResponse = {
        success: true,
        statusCode: 201,
        message: 'user.signup-check-email',
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

  getByParams: (async (req, res, next) => {
    try {
      const { username, page = '1', pageSize = '10' } = req.query;

      const filterParams: GetUsersParam = {
        username: username as string | undefined,
        page: parseInt(page as string, 10),
        pageSize: parseInt(pageSize as string, 10),
      };

      const result = await UserService.getUserByUsernameKeyword(filterParams);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'user.fetched',
        content: result,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  updateProfile: (async (req, res, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError(401, 'auth.login-first');
      }

      const { username, github, showGithub, aboutMe } = req.body;

      const avatar = (req.files as Express.Multer.File[])[0];

      const user = await UserService.updateProfile({
        userId,
        username,
        github,
        showGithub: showGithub === 'true',
        aboutMe,
        avatar,
      });

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'user.profile-updated',
        content: user,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  getProfileByUsername: (async (req, res, next) => {
    try {
      const { username } = req.params;

      const profile = await UserService.getProfileByUsername(username);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'user.profile-fetched',
        content: profile,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  getProfileForEdit: (async (req, res, next) => {
    try {
      const { id } = req.params;

      const profile = await UserService.getProfileForEdit(id);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'user.profile-fetched',
        content: profile,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  adminGet: (async (req, res, next) => {
    try {
      const {
        usernameKeyword,
        startDate,
        endDate,
        isBanned,
        sortBy,
        sortMode,
        page = '1',
        pageSize = '15',
      } = req.query;

      const params: AdminGetUserParams = {
        usernameKeyword:
          typeof usernameKeyword === 'string' ? usernameKeyword : undefined,
        joinedOn:
          typeof startDate === 'string' && typeof endDate === 'string'
            ? {
                startDate,
                endDate,
              }
            : undefined,
        isBanned:
          isBanned === 'true' ? true : isBanned === 'false' ? false : undefined,
        sortBy: sortBy as AdminGetUserParams['sortBy'],
        sortMode: sortMode as AdminGetUserParams['sortMode'],
        page: Number(page),
        pageSize: Number(pageSize),
      };

      const result = await UserService.adminGet(params);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'user.fetch-succesful',
        content: result,
      }

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  banUser: (async (req, res, next) => {
    try {
      const userId = req.params.id;
      const actorId = req.user?.id!; // middleware handle
      const reason = req.body?.reason ?? '';

      await BanService.banUser(userId, actorId, reason);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'user.ban-successful',
        content: null,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  unbanUser: (async (req, res, next) => {
    try {
      const userId = req.params.id;
      const actorId = req.user?.id!; // middleware handle
      const reason = req.body?.reason ?? '';

      await BanService.unbanUser(userId, actorId, reason);

      const resBody: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'user.unban-successful',
        content: null,
      };

      res.status(200).json(resBody);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};

export default UserController;
