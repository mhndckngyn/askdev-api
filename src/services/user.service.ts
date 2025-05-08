import { uploadToCloudinary } from '@/config/cloudinary';
import prisma from '@/prisma';
import { Pagination } from '@/types/response.type';
import { GetUsersParam, ProfileUpdateData } from '@/types/user.type';
import { ApiError } from '@/utils/ApiError';

const UserService = {
  getUserByUsernameKeyword: async ({
    username,
    page,
    pageSize,
  }: GetUsersParam) => {
    const where: any = {
      ...(username && {
        username: {
          startsWith: username,
          mode: 'insensitive',
        },
      }),
    };

    const skip = (page - 1) * pageSize;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: skip,
        take: pageSize,
        orderBy: { username: 'asc' },
      }),
    ]);

    const pagination: Pagination = {
      total,
      count: users.length,
      currentPage: page,
      totalPages: Math.ceil(total / pageSize),
    };

    return { users, pagination };
  },

  updateProfile: async ({
    userId,
    username,
    github,
    showGithub,
    aboutMe,
    avatar,
  }: ProfileUpdateData) => {
    const usernameExist = await prisma.user.findFirst({
      where: {
        id: {
          not: userId,
        },
        username,
      },
    });

    if (usernameExist) {
      throw new ApiError(409, 'user.username-already-taken', true);
    }

    let avatarUrl = '';
    if (avatar) {
      try {
        const uploadResult = await uploadToCloudinary(avatar.buffer, 'avatars');
        avatarUrl = uploadResult.secure_url;
      } catch (err) {
        console.warn('Không thể upload ảnh lên Cloudinary:', err);
      }
    }

    const data = {
      username,
      github,
      showGithub,
      bio: aboutMe,
      ...(avatarUrl && { profilePicture: avatarUrl }),
    };

    const updated = await prisma.user.update({
      data,
      where: {
        id: userId,
      },
    });

    return updated;
  },

  getProfileById: async (id: string) => {
    const profile = prisma.user.findFirst({ where: { id } });

    if (!profile) {
      throw new ApiError(404, 'user.not-found', true);
    }

    return profile;
  },
};

export default UserService;
