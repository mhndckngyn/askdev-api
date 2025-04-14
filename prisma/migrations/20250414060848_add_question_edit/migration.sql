-- CreateTable
CREATE TABLE "QuestionEdit" (
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousContent" TEXT NOT NULL,

    CONSTRAINT "QuestionEdit_pkey" PRIMARY KEY ("questionId","createdAt")
);

-- AddForeignKey
ALTER TABLE "QuestionEdit" ADD CONSTRAINT "QuestionEdit_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
