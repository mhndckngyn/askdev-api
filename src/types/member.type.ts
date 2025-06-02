import React from "react";

export type RankingType = "reputation" | "upvotes" | "chosen" | "answers";

export interface MemberStats {
  reputation: number;
  totalUpvotes: number;
  totalQuestions: number;
  totalAnswers: number;
  chosenAnswers: number;
  totalViews: number;
}

export interface Member {
  id: string;
  rank: number;
  username: string;
  bio: string;
  profilePicture: string;
  role: "MEMBER" | "ADMIN";
  github?: string;
  showGithub: boolean;
  createdAt: string;
  stats: MemberStats;
}
