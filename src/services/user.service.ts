import prisma from '@/prisma';
import { Pagination } from '@/types/response.type';
import { GetUsersParam } from '@/types/user.type';

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
};

export default UserService;
