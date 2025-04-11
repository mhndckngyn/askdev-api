import { constants } from '@/config/constants';
import { TokenPayload } from '@/types/auth.type';
import jwt from 'jsonwebtoken';

export function generateToken(payload: TokenPayload) {
  return jwt.sign(payload, constants.secrets.jwt.secret, {
    expiresIn: constants.secrets.jwt.exp,
  });
}
