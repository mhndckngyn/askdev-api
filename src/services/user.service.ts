import { uploadToCloudinary } from '@/config/cloudinary';
import prisma from '@/prisma';
import { Pagination } from '@/types/response.type';
import ProfileGetData, {
  AdminGetUserParams,
  GetUsersParam,
  InterestTags,
  ProfileUpdateData,
} from '@/types/user.type';
import { ApiError } from '@/utils/ApiError';
import { buildProfileResponse, computeInterestTags } from '@/utils/profile';
import { Prisma } from '@prisma/client';

const UserService = {
  getUserByUsernameKeyword: async ({
    username,
    page,
    pageSize,
  }: GetUsersParam) => {
    const where: any = {
      ...(username && {
        username: {
          contains: username,
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

  adminGet: async (params: AdminGetUserParams) => {
    const {
      usernameKeyword,
      joinedOn,
      isBanned,
      sortBy = 'username',
      sortMode = 'asc',
      page = 1,
      pageSize = 15,
    } = params;

    const whereClause = {
      ...(usernameKeyword && {
        username: {
          contains: usernameKeyword,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
      ...(joinedOn && {
        createdAt: {
          gte: new Date(new Date(joinedOn.startDate).setHours(0, 0, 0, 0)),
          lte: new Date(new Date(joinedOn.endDate).setHours(23, 59, 59, 999)),
        },
      }),
      ...(isBanned && {
        isBanned,
      }),
    };

    const sortOrder =
      sortMode === 'asc' ? Prisma.SortOrder.asc : Prisma.SortOrder.desc;
    const order =
      sortBy === 'username'
        ? { username: sortOrder }
        : sortBy === 'joinedOn'
        ? { createdAt: sortOrder }
        : {};

    const [total, results] = await prisma.$transaction([
      prisma.user.count({
        where: whereClause,
      }),
      prisma.user.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: order,
        include: {
          questions: true,
          answers: true,
          comments: true,
          reports: {
            select: {
              id: true,
            },
          },
        },
      }),
    ]);

    let transformed = results.map((user) => {
      const getContribution = (u: typeof user) => {
        const questions = u.questions.length;
        const answers = u.answers.length;
        const comments = u.comments.length;
        const reports = u.reports.length;

        return {
          questions,
          answers,
          comments,
          reports,
          total: questions + answers + comments + reports,
        };
      };

      const getReputation = (u: typeof user) => {
        const questions = u.questions.reduce((sum, q) => sum + q.upvotes, 0);
        const answers = u.answers.reduce((sum, a) => sum + a.upvotes, 0);
        const comments = u.comments.reduce((sum, c) => sum + c.upvotes, 0);

        return {
          questions,
          answers,
          comments,
          total: questions + answers + comments,
        };
      };

      return {
        id: user.id,
        username: user.username,
        avatar: user.profilePicture,
        joinedOn: user.createdAt,
        role: user.role,
        isBanned: user.isBanned,
        contribution: getContribution(user),
        reputation: getReputation(user),
      };
    });

    if (sortBy === 'contributions') {
      const sortOrderMultiplier = sortMode === 'asc' ? 1 : -1;

      transformed.sort(
        (a, b) =>
          (a.contribution.total - b.contribution.total) * sortOrderMultiplier
      );
    }

    const pagination: Pagination = {
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
      count: pageSize,
    };

    return {
      users: transformed,
      pagination,
    };
  },
};

export default UserService;
