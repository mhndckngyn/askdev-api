-- AlterTable
ALTER TABLE "QuestionEdit" ADD COLUMN     "previousTitle" TEXT,
ALTER COLUMN "previousContent" DROP NOT NULL;
