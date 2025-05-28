-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'COMMENT_VOTE';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "questionId" TEXT;
