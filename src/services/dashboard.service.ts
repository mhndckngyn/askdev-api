import prisma from "@/prisma";
import dayjs from "dayjs";
import { subDays, startOfDay } from "date-fns";

interface TagStat {
  name: string | null;
  postCount: number;
}

const DashboardService = {
  getWeeklyTrends: async () => {
    const today = startOfDay(new Date());
    const get7DayCounts = async (
      model: any,
      field: string,
      startOffset: number
    ) => {
      const counts = [];
      for (let i = 0; i < 7; i++) {
        const from = subDays(today, startOffset + 6 - i);
        const to = subDays(today, startOffset + 6 - i - 1);

        const count = await model.count({
          where: {
            [field]: {
              gte: from,
              lt: to,
            },
          },
        });

        counts.push(count);
      }
      return counts;
    };

    const calc = (current: number[], previous: number[]) => {
      const sumCurrent = current.reduce((a, b) => a + b, 0);
      const sumPrevious = previous.reduce((a, b) => a + b, 0);
      const changePercent =
        sumPrevious === 0
          ? null
          : ((sumCurrent - sumPrevious) / sumPrevious) * 100;
      return { current, changePercent };
    };

    const [
      usersThisWeek,
      usersLastWeek,
      questionsThisWeek,
      questionsLastWeek,
      reportsThisWeek,
      reportsLastWeek,
    ] = await Promise.all([
      get7DayCounts(prisma.user, "createdAt", 0),
      get7DayCounts(prisma.user, "createdAt", 7),
      get7DayCounts(prisma.question, "createdAt", 0),
      get7DayCounts(prisma.question, "createdAt", 7),
      get7DayCounts(prisma.report, "createdAt", 0),
      get7DayCounts(prisma.report, "createdAt", 7),
    ]);

    return {
      newUsers: calc(usersThisWeek, usersLastWeek),
      questions: calc(questionsThisWeek, questionsLastWeek),
      reports: calc(reportsThisWeek, reportsLastWeek),
    };
  },

  getGeneralStatsWithPercentage: async () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const currentMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const nextMonthStart = new Date(currentYear, currentMonth, 1);

    const prevMonthStart = new Date(prevYear, prevMonth - 1, 1);
    const prevNextMonthStart = new Date(prevYear, prevMonth, 1);

    const [currentNewUsers, prevNewUsers] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: currentMonthStart,
            lt: nextMonthStart,
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: prevMonthStart,
            lt: prevNextMonthStart,
          },
        },
      }),
    ]);

    const [currentPosts, prevPosts] = await Promise.all([
      prisma.question.count({
        where: {
          createdAt: {
            gte: currentMonthStart,
            lt: nextMonthStart,
          },
        },
      }),
      prisma.question.count({
        where: {
          createdAt: {
            gte: prevMonthStart,
            lt: prevNextMonthStart,
          },
        },
      }),
    ]);

    const [currentReports, prevReports] = await Promise.all([
      prisma.report.count({
        where: {
          createdAt: {
            gte: currentMonthStart,
            lt: nextMonthStart,
          },
        },
      }),
      prisma.report.count({
        where: {
          createdAt: {
            gte: prevMonthStart,
            lt: prevNextMonthStart,
          },
        },
      }),
    ]);

    const totalUsers = await prisma.user.count();

    const prevTotalUsers = await prisma.user.count({
      where: {
        createdAt: {
          lt: currentMonthStart,
        },
      },
    });

    const calculatePercentage = (current: number, previous: number) => {
      if (previous === 0) {
        if (current === 0) return 0;
        return null;
      }
      return parseFloat((((current - previous) / previous) * 100).toFixed(2));
    };

    return {
      totalNewUsers: currentNewUsers,
      percentNewUsers: calculatePercentage(currentNewUsers, prevNewUsers),

      totalPosts: currentPosts,
      percentPosts: calculatePercentage(currentPosts, prevPosts),

      totalReports: currentReports,
      percentReports: calculatePercentage(currentReports, prevReports),

      totalUsers: totalUsers,
      percentUsers: calculatePercentage(totalUsers, prevTotalUsers),
    };
  },

  getTop10TagsWithStats: async () => {
    const totalQuestions = await prisma.question.count();

    const topTags = await prisma.tag.findMany({
      take: 10,
      orderBy: {
        questions: {
          _count: "desc",
        },
      },
      include: {
        questions: {
          select: {
            user: {
              select: {
                profilePicture: true,
              },
            },
          },
        },
      },
    });

    const result = topTags.map((tag, index) => {
      const questionCount = tag.questions.length;
      const percentage =
        totalQuestions === 0 ? 0 : (questionCount / totalQuestions) * 100;

      const avatars = Array.from(
        new Set(
          tag.questions.map((q) => q.user?.profilePicture).filter(Boolean)
        )
      );

      return {
        rank: index + 1,
        tagName: tag.name,
        questionCount,
        percentage: parseFloat(percentage.toFixed(2)),
        avatars,
      };
    });

    return result;
  },

  getTopUsersByPostCount: async () => {
    const topUsers = await prisma.user.findMany({
      take: 10,
      orderBy: {
        questions: {
          _count: "desc",
        },
      },
      select: {
        id: true,
        username: true,
        profilePicture: true,
        _count: {
          select: {
            questions: true,
          },
        },
        questions: {
          select: {
            tags: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return topUsers.map((user, index) => {
      const tagCount: Record<string, number> = {};

      user.questions.forEach((question) => {
        question.tags.forEach((tag) => {
          tagCount[tag.name] = (tagCount[tag.name] || 0) + 1;
        });
      });

      const sortedTags = Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .map(([name]) => name);

      return {
        rank: index + 1,
        username: user.username,
        avatar: user.profilePicture,
        postCount: user._count.questions,
        topTopics: sortedTags,
      };
    });
  },

  getPostTagStats: async () => {
    const now = dayjs();
    const startOfThisMonth = now.startOf("month").toDate();
    const endOfThisMonth = now.endOf("month").toDate();
    const startOfLastMonth = now.subtract(1, "month").startOf("month").toDate();
    const endOfLastMonth = now.subtract(1, "month").endOf("month").toDate();

    const [totalPostsNow, totalPostsLastMonth] = await Promise.all([
      prisma.question.count(),
      prisma.question.count({
        where: { createdAt: { lt: startOfThisMonth } },
      }),
    ]);

    const [newPostsThisMonth, newPostsLastMonth] = await Promise.all([
      prisma.question.count({
        where: {
          createdAt: { gte: startOfThisMonth, lte: endOfThisMonth },
        },
      }),
      prisma.question.count({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
    ]);

    const [totalTagsNow, totalTagsLastMonth] = await Promise.all([
      prisma.tag.count(),
      prisma.tag.count({
        where: { createdAt: { lt: startOfThisMonth } },
      }),
    ]);

    const [newTagsThisMonth, newTagsLastMonth] = await Promise.all([
      prisma.tag.count({
        where: {
          createdAt: { gte: startOfThisMonth, lte: endOfThisMonth },
        },
      }),
      prisma.tag.count({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
    ]);

    const calcGrowth = (current: number, previous: number): number | null => {
      if (previous === 0) {
        if (current === 0) return 0;
        return null;
      }
      return parseFloat((((current - previous) / previous) * 100).toFixed(2));
    };

    return {
      newPosts: newPostsThisMonth,
      totalPosts: totalPostsNow,
      postGrowthNew: calcGrowth(newPostsThisMonth, newPostsLastMonth),
      postGrowthCurrent: calcGrowth(totalPostsNow, totalPostsLastMonth),

      newTags: newTagsThisMonth,
      totalTags: totalTagsNow,
      tagGrowthNew: calcGrowth(newTagsThisMonth, newTagsLastMonth),
      tagGrowthCurrent: calcGrowth(totalTagsNow, totalTagsLastMonth),
    };
  },

  getPostTagStatsinYear: async (year: number) => {
    const results = [];
    const now = dayjs();
    const currentYear = now.year();
    const currentMonth = now.month();

    for (let month = 0; month < 12; month++) {
      if (year === currentYear && month > currentMonth) {
        results.push({
          month: month + 1,
          newPosts: 0,
          totalPosts: 0,
          newTags: 0,
          totalTags: 0,
        });
        continue;
      }

      const startOfMonth = dayjs(new Date(year, month, 1))
        .startOf("month")
        .toDate();
      const endOfMonth = dayjs(new Date(year, month, 1))
        .endOf("month")
        .toDate();

      const [newPosts, totalPosts, newTags, totalTags] = await Promise.all([
        prisma.question.count({
          where: {
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        }),
        prisma.question.count({
          where: {
            createdAt: {
              lte: endOfMonth,
            },
          },
        }),
        prisma.tag.count({
          where: {
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        }),
        prisma.tag.count({
          where: {
            createdAt: {
              lte: endOfMonth,
            },
          },
        }),
      ]);

      results.push({
        month: month + 1,
        newPosts,
        totalPosts,
        newTags,
        totalTags,
      });
    }

    return results;
  },

  getTopTagsWithPostCountInYear: async (year: number) => {
    const startOfYear = dayjs(`${year}-01-01`).startOf("year").toDate();
    const endOfYear = dayjs(`${year}-12-31`).endOf("year").toDate();

    const result = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            questions: {
              where: {
                createdAt: {
                  gte: startOfYear,
                  lte: endOfYear,
                },
              },
            },
          },
        },
      },
      orderBy: {
        questions: {
          _count: "asc",
        },
      },
      take: 10,
    });

    return result.map((tag) => ({
      tagId: tag.id,
      tagName: tag.name,
      postCount: tag._count.questions,
    }));
  },

  getTopTagsAllTimeWithOthers: async (): Promise<TagStat[]> => {
    const allTags = await prisma.tag.findMany({
      select: {
        name: true,
        _count: {
          select: { questions: true },
        },
      },
    });

    const tags: TagStat[] = allTags.map((tag) => ({
      name: tag.name,
      postCount: tag._count.questions,
    }));

    tags.sort((a, b) => b.postCount - a.postCount);

    const top5 = tags.slice(0, 5);
    const others = tags.slice(5);

    const othersTotal = others.reduce((sum, tag) => sum + tag.postCount, 0);

    if (othersTotal > 0) {
      top5.push({ name: null, postCount: othersTotal });
    }

    return top5;
  },

  getMonthlyReportStats: async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const startOfMonth = dayjs(new Date(year, month - 1, 1))
      .startOf("month")
      .toDate();
    const endOfMonth = dayjs(new Date(year, month - 1, 1))
      .endOf("month")
      .toDate();

    const startOfLastMonth = dayjs(startOfMonth)
      .subtract(1, "month")
      .startOf("month")
      .toDate();
    const endOfLastMonth = dayjs(startOfMonth)
      .subtract(1, "month")
      .endOf("month")
      .toDate();

    const countReports = async (
      type: "QUESTION" | "ANSWER" | "COMMENT",
      start: Date,
      end: Date
    ) => {
      return prisma.report.count({
        where: {
          contentType: type,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      });
    };

    const [questionReports, answerReports, commentReports] = await Promise.all([
      countReports("QUESTION", startOfMonth, endOfMonth),
      countReports("ANSWER", startOfMonth, endOfMonth),
      countReports("COMMENT", startOfMonth, endOfMonth),
    ]);

    const [questionReportsLast, answerReportsLast, commentReportsLast] =
      await Promise.all([
        countReports("QUESTION", startOfLastMonth, endOfLastMonth),
        countReports("ANSWER", startOfLastMonth, endOfLastMonth),
        countReports("COMMENT", startOfLastMonth, endOfLastMonth),
      ]);

    const totalReports = questionReports + answerReports + commentReports;
    const totalReportsLast =
      questionReportsLast + answerReportsLast + commentReportsLast;

    const calcGrowth = (current: number, previous: number): number | null => {
      if (previous === 0) {
        return current === 0 ? 0 : null;
      }
      return parseFloat((((current - previous) / previous) * 100).toFixed(2));
    };

    return {
      questionReports,
      questionGrowth: calcGrowth(questionReports, questionReportsLast),
      answerReports,
      answerGrowth: calcGrowth(answerReports, answerReportsLast),
      commentReports,
      commentGrowth: calcGrowth(commentReports, commentReportsLast),
      totalReports,
      growthPercent: calcGrowth(totalReports, totalReportsLast),
    };
  },

  getDailyReportStatsByMonthYear: async (month: number, year: number) => {
    const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth();

    const startOfMonth = dayjs(`${year}-${month}-01`).startOf("month").toDate();
    const endOfMonth = dayjs(`${year}-${month}-01`).endOf("month").toDate();

    const allReports = await prisma.report.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        createdAt: true,
        contentType: true,
      },
    });

    const question = Array(daysInMonth).fill(0);
    const answer = Array(daysInMonth).fill(0);
    const comment = Array(daysInMonth).fill(0);

    allReports.forEach((report) => {
      const day = dayjs(report.createdAt).date() - 1;

      switch (report.contentType) {
        case "QUESTION":
          question[day]++;
          break;
        case "ANSWER":
          answer[day]++;
          break;
        case "COMMENT":
          comment[day]++;
          break;
      }
    });

    return { question, answer, comment };
  },

  getTotalReportsByType: async () => {
    const [questionReports, answerReports, commentReports] = await Promise.all([
      prisma.report.count({ where: { contentType: "QUESTION" } }),
      prisma.report.count({ where: { contentType: "ANSWER" } }),
      prisma.report.count({ where: { contentType: "COMMENT" } }),
    ]);

    return {
      question: questionReports,
      answer: answerReports,
      comment: commentReports,
    };
  },
};

export default DashboardService;
