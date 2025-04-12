import { constants } from '@/config/constants';
import prisma from '@/prisma';
import { EmailSignupData } from '@/types/user.type';
import { ApiError } from '@/utils/ApiError';
import bcrypt from 'bcrypt';

const UserService = {
  signup: async (data: EmailSignupData) => {
    const isExist = await prisma.user.findFirst({
      where: { email: data.email },
    });

    if (isExist) {
      throw new ApiError(409, 'api:user.already-exist', true);
    }

    const usernameExist = await prisma.user.findFirst({
      where: { username: data.username },
    });

    if (usernameExist) {
      throw new ApiError(409, 'api:user.username-already-taken', true);
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      constants.saltWorkFactor
    );

    const user = await prisma.user.create({
      data: {
        email: data.email,
        provider: 'EMAIL',
        password: hashedPassword,
        username: data.username,
        profilePicture: constants.defaultAvatar,
      },
    });

    return {
      id: user.id,
      username: user.username,
      provider: user.provider,
      profilePicture: user.profilePicture,
    };
  },
};

export default UserService;
