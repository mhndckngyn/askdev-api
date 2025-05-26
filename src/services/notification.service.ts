import prisma from "@/prisma";
import { ApiError } from "@/utils/ApiError";

const NotificationService = {
  getAllByUserId: async (userId: string) => {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        actor: {
          select: {
            username: true,
            profilePicture: true,
          },
        },
      },
    });
  },

  deleteById: async (id: string, userId: string) => {
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId)
      throw new ApiError(404, "api:notification.not-found-or-no-permission");

    await prisma.notification.delete({ where: { id } });
    return { message: "api:notification.deleted-success" };
  },

  deleteAll: async (userId: string) => {
    await prisma.notification.deleteMany({ where: { userId } });
    return { message: "api:notification.deleted-all-success" };
  },

  markAsRead: async (id: string, userId: string) => {
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId)
      throw new ApiError(404, "api:notification.not-found-or-no-permission");

    await prisma.notification.update({ where: { id }, data: { isRead: true } });
    return { message: "api:notification.marked-as-read" };
  },

  markAllAsRead: async (userId: string) => {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: "api:notification.marked-all-as-read" };
  },

  markAsUnread: async (id: string, userId: string) => {
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId)
      throw new ApiError(404, "api:notification.not-found-or-no-permission");

    await prisma.notification.update({
      where: { id },
      data: { isRead: false },
    });
    return { message: "api:notification.marked-as-unread" };
  },

  markAllAsUnread: async (userId: string) => {
    await prisma.notification.updateMany({
      where: { userId, isRead: true },
      data: { isRead: false },
    });
    return { message: "api:notification.marked-all-as-unread" };
  },
};

export default NotificationService;
