import prisma from '@/prisma';
import { ApiError } from '@/utils/ApiError';

const BanService = {
  getAll: async () => {
    const results = await prisma.banLog.findMany({
      include: {
        admin: {
          select: {
            username: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    const flatObject = results.map((ban) => ({
      ...ban,
      admin: ban.admin.username,
      user: ban.user.username,
    }));

    return flatObject;
  },

  banUser: async (
    userId: string,
    actorId: string,
    reason: string | null = null
  ) => {
    const user = await prisma.user.findFirst({ where: { id: userId } });

    console.log('userId', userId);
    console.log('actorId', actorId);

    if (!user) {
      throw new ApiError(404, 'user.not-found', true);
    }

    if (user.isBanned) {
      throw new ApiError(400, 'user.already-banned', true);
    }

    try {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: {
            isBanned: true,
          },
        }),
        prisma.banLog.create({
          data: {
            userId,
            actorId,
            reason,
            action: 'BAN',
          },
        }),
      ]);
    } catch (err) {
      throw new ApiError(500, 'user.ban-server-error');
    }
  },

  unbanUser: async (
    userId: string,
    actorId: string,
    reason: string | null = null
  ) => {
    const user = await prisma.user.findFirst({ where: { id: userId } });

    if (!user) {
      throw new ApiError(404, 'user.not-found', true);
    }

    if (!user.isBanned) {
      throw new ApiError(400, 'user.already-unbanned', true);
    }

    try {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: {
            isBanned: false,
          },
        }),
        prisma.banLog.create({
          data: {
            userId,
            actorId,
            reason,
            action: 'UNBAN',
          },
        }),
      ]);
    } catch (err) {
      throw new ApiError(500, 'user.unban-server-error');
    }
  },
};

export default BanService;
