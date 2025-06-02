import { AnswerForProfile } from '@/types/answer.type';
import { QuestionForProfile } from '@/types/question.type';
import ProfileGetData, { InterestTags, ProfileInfo } from '@/types/user.type';

export function computeInterestTags(
  questions: QuestionForProfile[],
  answers: AnswerForProfile[]
): InterestTags[] {
  const tagMap = new Map<string, InterestTags>();

  for (const q of questions) {
    for (const tag of q.tags) {
      if (!tagMap.has(tag.id)) {
        tagMap.set(tag.id, {
          id: tag.id,
          name: tag.name,
          contributions: 0,
          upvotes: 0,
        });
      }

      const stat = tagMap.get(tag.id)!; // ko undefined vì đã tạo ở trên
      stat.contributions += 1;
      stat.upvotes += q.upvotes;
    }
  }

  for (const a of answers) {
    const tags = a.question.tags;
    for (const tag of tags) {
      if (!tagMap.has(tag.id)) {
        tagMap.set(tag.id, {
          id: tag.id,
          name: tag.name,
          contributions: 0,
          upvotes: 0,
        });
      }

      const stat = tagMap.get(tag.id)!;
      stat.contributions += 1;
      stat.upvotes += a.upvotes;
    }
  }

  // Convert sang mảng và sort
  const sorted = Array.from(tagMap.values()).sort((a, b) => {
    if (b.contributions === a.contributions) {
      return b.upvotes - a.upvotes;
    }
    return b.contributions - a.contributions;
  });

  return sorted.slice(0, 8);
}

export function buildProfileResponse({
  userId,
  profile,
  questions,
  answers,
  interestTags,
  upvotesReceived,
}: {
  userId: string;
  profile: ProfileInfo;
  questions: QuestionForProfile[];
  answers: AnswerForProfile[];
  interestTags: InterestTags[];
  upvotesReceived: number;
}): ProfileGetData {
  const result = {
    info: {
      userId,
      username: profile.username,
      avatar: profile.profilePicture,
      ...(profile.showGithub && {
        github: profile.github!,
      }),
      bio: profile.bio ?? '',
    },
    stats: {
      questions: questions.length,
      answers: answers.length,
      upvotesReceived,
      joinedOn: profile.createdAt.toISOString(),
    },
    questions: questions.slice(0, 8).map((q) => ({
      id: q.id,
      questionTitle: q.title,
      upvotes: q.upvotes,
      tags: q.tags,
      postedOn: q.createdAt.toISOString(),
    })),
    answers: answers.slice(0, 8).map((a) => ({
      id: a.id,
      questionId: a.questionId,
      questionTitle: a.question.title,
      upvotes: a.upvotes,
      tags: a.question.tags,
      postedOn: a.createdAt.toISOString(),
    })),
    interestTags,
  };

  return result;
}
