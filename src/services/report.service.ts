import prisma from "@/prisma";

type CreateReportPayload = {
  reportedById: string;
  contentType: "QUESTION" | "ANSWER" | "COMMENT";
  contentId: string;
  reason: string;
};

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
};

export default ReportService;
