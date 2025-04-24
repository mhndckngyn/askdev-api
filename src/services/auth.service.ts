import { uploadFromUrl } from '@/config/cloudinary';
import { constants } from '@/config/constants';
import prisma from '@/prisma';
import { OAuthProvider } from '@/types/auth.type';
import { EmailSignupData } from '@/types/user.type';
import { ApiError } from '@/utils/ApiError';
import { generateToken } from '@/utils/jwt';
import bcrypt from 'bcrypt';
import { Profile as GithubProfile } from 'passport-github2';
import { Profile as GoogleProfile } from 'passport-google-oauth20';
import { v4 as uuidv4 } from 'uuid';
import MailService from './mail.service';

const AuthService = {
  emailLogin: async (email: string, password: string) => {
    const account = await prisma.account.findUnique({
      where: { provider: 'EMAIL', email },
      include: { user: true },
    });

    if (!account || !account.password) {
      throw new ApiError(401, 'auth.incorrect-login-data', true);
    }

    const isMatch = await bcrypt.compare(password, account.password);

    if (!isMatch) {
      throw new ApiError(401, 'auth.incorrect-login-data', true);
    }

    if (!account.isVerified) {
      return;
    }

    /* 
      TODO: kiểm tra xác nhận email
      - nếu email chưa xác nhận:
        - nếu mã xác nhận hết hạn: tạo mã xác nhận mới và gửi lại
        - yêu cầu kiểm tra email xác nhận
      - nếu email đã xác nhận => next
    */

    const user = account?.user!; // user chắc chắn tồn tại vì được tạo trước account

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

    let account = await prisma.account.findFirst({
      where: { provider, providerUserId },
      include: { user: true },
    });

    let user = account?.user!; // user chắc chắn tồn tại trước khi sử dụng

    // tao user neu khong ton tai
    if (!account) {
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
          role: 'MEMBER',
          username,
          profilePicture: avatarUrl,
          account: {
            create: {
              provider,
              providerUserId,
              isVerified: true,
            },
          },
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

  signup: async (data: EmailSignupData) => {
    const isExist = await prisma.account.findFirst({
      where: { email: data.email },
    });

    if (isExist) {
      throw new ApiError(409, 'user.already-exist', true);
    }

    const usernameChosen = await prisma.user.findFirst({
      where: { username: data.username },
    });

    if (usernameChosen) {
      throw new ApiError(409, 'user.username-already-taken', true);
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      constants.saltWorkFactor
    );

    const verificationToken = uuidv4();
    const tokenExpiry = new Date(
      Date.now() + constants.secrets.verificationToken.exp
    );

    const user = await prisma.user.create({
      data: {
        role: 'MEMBER',
        username: data.username,
        profilePicture: constants.defaultAvatar,
        account: {
          create: {
            provider: 'EMAIL',
            email: data.email,
            password: hashedPassword,
            isVerified: false,
            verificationToken,
            tokenExpiry,
          },
        },
      },
      include: {
        account: true,
      },
    });

    try {
      await MailService.sendVerificationEmail(
        user.account?.email!, // khác null vì đã được tạo cùng lúc với user
        verificationToken,
        tokenExpiry
      );
    } catch (err) {
      throw new ApiError(500, 'auth.verification-send-failed');
    }

    return {
      id: user.id,
      username: user.username,
      avatar: user.profilePicture,
    };
  },

  verifyEmail: async (token: string) => {
    const account = await prisma.account.findFirst({
      where: { provider: 'EMAIL', verificationToken: token },
    });

    if (!account) {
      throw new ApiError(404, 'auth.verification-token-not-found', true);
    }

    if (account.tokenExpiry && account.tokenExpiry < new Date()) {
      throw new ApiError(410, 'auth.expired-verification-token', true, {
        email: account.email, // email khác null vì provider là EMAIL
      });
    }

    await prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        isVerified: true,
        verificationToken: null,
        tokenExpiry: null,
      },
    });

    return {
      id: account.id,
      userId: account.userId,
      email: account.email,
      isVerified: true,
    };
  },

  resendVerificationEmail: async (email: string) => {
    const account = await prisma.account.findFirst({
      where: { provider: 'EMAIL', email },
    });

    if (!account) {
      throw new ApiError(404, 'auth.resend-user-not-found');
    }

    const verificationToken = uuidv4();
    const tokenExpiry = new Date(
      Date.now() + constants.secrets.verificationToken.exp
    );

    try {
      await MailService.sendVerificationEmail(
        account.email!, // khác null vì provider là EMAIL
        verificationToken,
        tokenExpiry
      );
    } catch (err) {
      throw new ApiError(500, 'auth.resend-failed');
    }

    await prisma.account.update({
      where: { id: account.id },
      data: {
        verificationToken,
        tokenExpiry,
      },
    });
  },
};

export default AuthService;
