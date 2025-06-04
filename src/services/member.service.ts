import prisma from "@/prisma";
import { ApiError } from "@/utils/ApiError";
import * as MemberTypes from "@/types/member.type";

const MemberService = {
  getMembers: async (
    page: number = 1,
    limit: number = 20,
    rankingType: MemberTypes.RankingType = "reputation",
    searchQuery?: string
  ) => {
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      where: { isBanned: false },
      select: {
        id: true,
        username: true,
        profilePicture: true,
        bio: true,
        role: true,
        github: true,
        showGithub: true,
        createdAt: true,
        questions: {
          where: { isHidden: false },
          select: {
            id: true,
            views: true,
            upvotes: true,
            downvotes: true,
          },
        },
        answers: {
          where: { isHidden: false },
          select: {
            id: true,
            upvotes: true,
            downvotes: true,
            isChosen: true,
          },
        },
        comments: {
          where: { isHidden: false },
          select: {
            upvotes: true,
            downvotes: true,
          },
        },
      },
    });

    const membersWithStats = users.map((user) => {
      const questionUpvotes = user.questions.reduce(
        (sum, q) => sum + q.upvotes,
        0
      );
      const questionDownvotes = user.questions.reduce(
        (sum, q) => sum + q.downvotes,
        0
      );
      const answerUpvotes = user.answers.reduce((sum, a) => sum + a.upvotes, 0);
      const answerDownvotes = user.answers.reduce(
        (sum, a) => sum + a.downvotes,
        0
      );
      const commentUpvotes = user.comments.reduce(
        (sum, c) => sum + c.upvotes,
        0
      );
      const commentDownvotes = user.comments.reduce(
        (sum, c) => sum + c.downvotes,
        0
      );

      const totalUpvotes = questionUpvotes + answerUpvotes + commentUpvotes;
      const totalDownvotes =
        questionDownvotes + answerDownvotes + commentDownvotes;
      const chosenAnswers = user.answers.filter((a) => a.isChosen).length;
      const totalViews = user.questions.reduce((sum, q) => sum + q.views, 0);
      const reputation = Math.max(
        0,
        totalUpvotes * 10 - totalDownvotes * 5 + chosenAnswers * 15
      );

      const stats: MemberTypes.MemberStats = {
        reputation,
        totalUpvotes,
        totalQuestions: user.questions.length,
        totalAnswers: user.answers.length,
        chosenAnswers,
        totalViews,
      };

      return {
        id: user.id,
        rank: 0,
        username: user.username,
        bio: user.bio || "",
        profilePicture: user.profilePicture,
        role: user.role,
        github: user.showGithub ? user.github : undefined,
        showGithub: user.showGithub,
        createdAt: user.createdAt.toISOString(),
        stats,
      };
    });

    const sortedMembers = membersWithStats.sort((a, b) => {
      switch (rankingType) {
        case "reputation":
          return b.stats.reputation - a.stats.reputation;
        case "upvotes":
          return b.stats.totalUpvotes - a.stats.totalUpvotes;
        case "chosen":
          return b.stats.chosenAnswers - a.stats.chosenAnswers;
        case "answers":
          return b.stats.totalAnswers - a.stats.totalAnswers;
        default:
          return b.stats.reputation - a.stats.reputation;
      }
    });

    sortedMembers.forEach((member, index) => {
      member.rank = index + 1;
    });

    let filteredMembers = sortedMembers;
    if (searchQuery?.trim()) {
      const query = searchQuery.toLowerCase();
      filteredMembers = sortedMembers.filter(
        (member) =>
          member.username.toLowerCase().includes(query) ||
          member.bio.toLowerCase().includes(query) ||
          (member.github?.toLowerCase().includes(query) ?? false)
      );
    }

    const total = filteredMembers.length;
    const paginatedMembers = filteredMembers.slice(skip, skip + limit);

    return {
      items: paginatedMembers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + paginatedMembers.length < total,
      },
      rankingType,
      availableRankingTypes: MemberService.getRankingTypes(),
    };
  },

  getRankingTypes: () => {
    return [
      "reputation",
      "upvotes",
      "chosen",
      "answers",
    ] as MemberTypes.RankingType[];
  },
};

export default MemberService;
