-- CreateTable
CREATE TABLE "QuestionVote" (
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "type" INTEGER NOT NULL,

    CONSTRAINT "QuestionVote_pkey" PRIMARY KEY ("userId","questionId")
);

-- AddForeignKey
ALTER TABLE "QuestionVote" ADD CONSTRAINT "QuestionVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionVote" ADD CONSTRAINT "QuestionVote_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
