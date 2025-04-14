import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '@/utils/ApiError';
import { constants } from '@/config/constants';
import { TokenPayload } from '@/types/auth.type';
import prisma from '@/prisma';

export const authMiddleware: RequestHandler = async (req, _res, next) => {
  try {
    const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ApiError(401, 'auth.login-first', true);
    }

    const decoded = jwt.verify(
      token,
      constants.secrets.jwt.secret
    ) as TokenPayload;

    const user = await prisma.user.findFirst({ where: { id: decoded.id } });

    if (!user) {
      throw new ApiError(401, 'auth.user-not-found', true);
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      avatar: user.profilePicture,
    };
    next();
  } catch (err) {
    next(err);
  }
};
