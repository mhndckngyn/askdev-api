// src/services/home.service.ts
import prisma from "@/prisma";
import dayjs from "dayjs";

const HomeService = {
  getSummary: async () => {
    const userCount = await prisma.user.count();
    const questionCount = await prisma.question.count();
    const answerCount = await prisma.answer.count();
    const tagCount = await prisma.tag.count();

    return {
      userCount,
      questionCount,
      answerCount,
      tagCount,
    };
  },

  getTrendingQuestions: async () => {
    const now = dayjs();

    const questions = await prisma.question.findMany({
      where: {
        isHidden: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        tags: true,
        answers: true,
      },
      take: 20,
    });

    const scored = questions.map((q) => {
      const upvotes = q.upvotes ?? 0;
      const answers = q.answers.length ?? 0;
      const views = q.views ?? 0;
      const daysAgo = now.diff(q.createdAt, "day");

      const trendingScore = upvotes * 3 + answers * 2 + views * 0.5 - daysAgo;

      return {
        id: q.id,
        title: q.title,
        author: q.user?.username ?? null,
        avatar: q.user?.profilePicture ?? null,
        votes: upvotes,
        answers: answers,
        views: views,
        tags: q.tags.map((t) => t.name),
        time: q.createdAt,
        trendingScore,
      };
    });

    return scored.sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 5);
  },

  getTopContributors: async () => {
    const users = await prisma.user.findMany({
      include: {
        answers: {
          select: {
            upvotes: true,
          },
        },
      },
    });

    const contributors = users.map((u) => {
      const answersCount = u.answers.length;
      const points = u.answers.reduce((acc, a) => acc + (a.upvotes ?? 0), 0);
      return {
        name: u.username,
        points,
        answers: answersCount,
        avatar: u.profilePicture,
      };
    });

    contributors.sort((a, b) => b.points - a.points);

    return contributors.slice(0, 5);
  },

  getTopTags: async () => {
    const tags = await prisma.tag.findMany({
      select: {
        name: true,
        _count: {
          select: { questions: true },
        },
      },
      orderBy: {
        questions: {
          _count: "desc",
        },
      },
      take: 5,
    });

    return tags.map((tag) => ({
      name: tag.name,
      count: tag._count.questions,
    }));
  },
};

export default HomeService;
