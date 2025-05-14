import prisma from "@/prisma";

type CreateReportPayload = {
  reportedById: string;
  contentType: "QUESTION" | "ANSWER" | "COMMENT";
  contentId: string;
  reason: string;
};

export type Filter = {
  reasonKeyword?: string;
  reportedusername?: string;
  contentType?: string;
  contentId?: string;
  status?: string;
  hiddenOption?: boolean;
  startDate?: Date;
  endDate?: Date;
};

export interface ReportAdminView {
  id: string;
  username?: string;
  contentType: string;
  contentId: string;
  reason: string;
  status: string;
  createdAt: string;
  isHidden: boolean;
}

const ReportService = {
  createReport: async (payload: CreateReportPayload) => {
    const report = await prisma.report.create({
      data: {
        reportedById: payload.reportedById,
        contentType: payload.contentType,
        contentId: payload.contentId,
        reason: payload.reason,
      },
    });
    return report;
  },

  deleteReport: async (id: string) => {
    const report = await prisma.report.delete({
      where: { id },
    });

    return report;
  },

  getAllReports: async (
    filter: Filter & { page?: number; pageSize?: number }
  ) => {
    const {
      reasonKeyword,
      reportedusername,
      contentType,
      contentId,
      status,
      hiddenOption,
      startDate,
      endDate,
      page = 1,
      pageSize = 10,
    } = filter;

    const whereClause: any = {
      ...(reasonKeyword && {
        reason: {
          contains: reasonKeyword,
          mode: "insensitive",
        },
      }),
      ...(contentType && { contentType }),
      ...(contentId && { contentId }),
      ...(status && { status }),
      ...(typeof hiddenOption === "boolean" && { isHidden: hiddenOption }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
            lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
          },
        }),
      ...(reportedusername && {
        reportedBy: {
          username: {
            contains: reportedusername,
            mode: "insensitive",
          },
        },
      }),
    };

    const [total, reports] = await prisma.$transaction([
      prisma.report.count({
        where: whereClause,
      }),
      prisma.report.findMany({
        where: whereClause,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          reportedBy: {
            select: {
              username: true,
            },
          },
        },
      }),
    ]);

    const transformed = reports.map(
      (r): ReportAdminView => ({
        id: r.id,
        username: r.reportedBy?.username ?? "",
        contentType: r.contentType,
        contentId: r.contentId,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        isHidden: r.isHidden,
      })
    );

    return {
      Reports: transformed,
      pagination: {
        total,
        page,
        pageSize,
      },
    };
  },

  hideReports: async (ids: string[]) => {
    const updated = await prisma.report.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        isHidden: true,
      },
    });

    return updated;
  },

  unhideReports: async (ids: string[]) => {
    const updated = await prisma.report.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        isHidden: false,
      },
    });

    return updated;
  },
};

export default ReportService;
