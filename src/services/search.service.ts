import prisma from "@/prisma";

const removeVietnameseTones = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const SearchService = {
  search: async (query: string) => {
    const normalizedQuery = removeVietnameseTones(query);

    const questions = await prisma.question.findMany({
      where: {
        isHidden: false,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { path: ["text"], string_contains: query } },
        ],
      },
      include: {
        user: true,
        tags: true,
        answers: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const tags = await prisma.tag.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
      include: {
        questions: true,
      },
    });

    const users = await prisma.user.findMany({
      where: {
        username: { contains: query, mode: "insensitive" },
      },
      include: {
        questions: true,
        answers: true,
      },
    });

    const filterNoAccent = (text: string) =>
      removeVietnameseTones(text).includes(normalizedQuery);

    return {
      questions: questions
        .filter(
          (q) =>
            filterNoAccent(q.title) ||
            (typeof q.content === "object" &&
              filterNoAccent(JSON.stringify(q.content)))
        )
        .map((q) => ({
          id: q.id,
          title: q.title,
          content: q.content || "",
          author: q.user?.username || "Ẩn danh",
          views: q.views,
          upvotes: q.upvotes,
          answers: q.answers.length,
          isSolved: q.isSolved,
          tags: q.tags.map((tag) => tag.name),
          createdAt: q.updatedAt ?? q.createdAt,
        })),

      tags: tags
        .filter((tag) => filterNoAccent(tag.name))
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
          questionsCount: tag.questions.length,
          descriptionVi: tag.descriptionVi || "",
          descriptionEn: tag.descriptionEn || "",
        })),

      users: users
        .filter((user) => filterNoAccent(user.username))
        .map((user) => ({
          id: user.id,
          username: user.username,
          profilePicture: user.profilePicture || "",
          bio: user.bio || "",
          questionsCount: user.questions.length,
          answersCount: user.answers.length,
          reputation:
            user.questions.reduce((acc, q) => acc + q.upvotes, 0) +
            user.answers.reduce((acc, a) => acc + a.upvotes, 0),
        })),
    };
  },
};

export default SearchService;
