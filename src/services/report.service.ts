import prisma from "@/prisma";
import { ApiError } from "@/utils/ApiError";

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

  updateStatus: async (
    id: string,
    status: "PENDING" | "REVIEWED" | "REJECTED"
  ) => {
    const updated = await prisma.report.update({
      where: { id },
      data: { status },
    });
    return updated;
  },

  getReportedContentDetails: async (
    contentType: "QUESTION" | "ANSWER" | "COMMENT",
    contentId: string
  ) => {
    let question = null;
    let answer = null;
    let comment = null;

    if (contentType === "COMMENT") {
      comment = await prisma.comment.findUnique({
        where: { id: contentId },
        include: {
          user: {
            select: {
              username: true,
              profilePicture: true,
            },
          },
          answer: {
            include: {
              user: {
                select: {
                  username: true,
                  profilePicture: true,
                },
              },
              question: {
                include: {
                  tags: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  user: {
                    select: {
                      username: true,
                      profilePicture: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!comment)
        throw new ApiError(404, "api:report.content-not-found", true);
      answer = comment.answer;
      question = comment.answer?.question ?? null;
    } else if (contentType === "ANSWER") {
      answer = await prisma.answer.findUnique({
        where: { id: contentId },
        include: {
          user: {
            select: {
              username: true,
              profilePicture: true,
            },
          },
          question: {
            include: {
              tags: {
                select: {
                  id: true,
                  name: true,
                },
              },
              user: {
                select: {
                  username: true,
                  profilePicture: true,
                },
              },
            },
          },
        },
      });
      if (!answer)
        throw new ApiError(404, "api:report.content-not-found", true);
      question = answer.question;
    } else if (contentType === "QUESTION") {
      question = await prisma.question.findUnique({
        where: { id: contentId },
        include: {
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              username: true,
              profilePicture: true,
            },
          },
        },
      });
      if (!question)
        throw new ApiError(404, "api:report.content-not-found", true);
    } else {
      throw new ApiError(400, "api:report.invalid-content-type", true);
    }

    return { question, answer, comment };
  },
};

export default ReportService;
