import { uploadFromUrl } from '@/config/cloudinary';
import { constants } from '@/config/constants';
import prisma from '@/prisma';
import { ApiError } from '@/utils/ApiError';
import { generateToken } from '@/utils/jwt';
import bcrypt from 'bcrypt';
import { Profile as GoogleProfile } from 'passport-google-oauth20';
import { Profile as GithubProfile } from 'passport-github2';

type OAuthProvider = 'GITHUB' | 'GOOGLE';

const AuthService = {
  emailLogin: async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      throw new ApiError(401, 'api:auth.incorrect-login-data', true);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new ApiError(401, 'api:auth.incorrect-login-data', true);
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
      avatar: user.profilePicture,
      username: user.username,
    });

    return token;
  },

  oauthLogin: async (
    profile: GoogleProfile | GithubProfile,
    provider: OAuthProvider
  ) => {
    const providerUserId = profile.id;

    let user = await prisma.user.findFirst({
      where: { provider, providerUserId },
    });

    // tao user neu khong ton tai
    if (!user) {
      let avatarUrl = constants.defaultAvatar;
      const avatar = profile.photos?.[0].value;
      
      // google không có username. github sử dụng cả 2 nhưng có thể không có username
      const username = profile.username || profile.displayName;

      try {
        if (avatar) {
          const result = await uploadFromUrl(avatar, 'avatars');
          avatarUrl = result.secure_url;
        }
      } catch (err) {
        console.warn('Không thể upload ảnh lên Cloudinary:', err);
      }

      user = await prisma.user.create({
        data: {
          provider,
          providerUserId,
          role: 'MEMBER',
          username,
          profilePicture: avatarUrl,
        },
      });
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
      avatar: user.profilePicture,
      username: user.username,
    });

    return { user, token };
  },
};

export default AuthService;
