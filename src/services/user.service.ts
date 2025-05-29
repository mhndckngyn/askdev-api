import { uploadToCloudinary } from '@/config/cloudinary';
import prisma from '@/prisma';
import { Pagination } from '@/types/response.type';
import ProfileGetData, {
  GetUsersParam,
  InterestTags,
  ProfileUpdateData,
} from '@/types/user.type';
import { ApiError } from '@/utils/ApiError';
import { buildProfileResponse, computeInterestTags } from '@/utils/profile';

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

  getProfileByUsername: async (username: string): Promise<ProfileGetData> => {
    const profile = await prisma.user.findFirst({
      where: { username },
      select: {
        id: true,
        username: true,
        profilePicture: true,
        showGithub: true,
        github: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!profile) {
      throw new ApiError(404, 'user.not-found', true);
    }

    const questions = await prisma.question.findMany({
      where: { userId: profile.id, isHidden: false },
      orderBy: {
        upvotes: 'desc', // cho đơn giản thay vì upvotes - downvotes
      },
      select: {
        id: true,
        title: true,
        upvotes: true,
        downvotes: true,
        createdAt: true,
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const answers = await prisma.answer.findMany({
      where: { userId: profile.id, isHidden: false },
      orderBy: {
        upvotes: 'desc',
      },
      select: {
        id: true,
        upvotes: true,
        downvotes: true,
        createdAt: true,
        question: {
          select: {
            title: true,
            tags: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const upvotesReceived = [...questions, ...answers].reduce(
      (sum, cur) => sum + cur.upvotes,
      0
    );

    const result = buildProfileResponse({
      userId: profile.id,
      profile,
      questions,
      answers,
      interestTags: computeInterestTags(questions, answers),
      upvotesReceived,
    });

    return result;
  },

  getProfileForEdit: async (id: string) => {
    const profile = prisma.user.findFirst({ where: { id } });

    if (!profile) {
      throw new ApiError(404, 'user.not-found', true);
    }

    return profile;
  },
};

export default UserService;
