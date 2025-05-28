/*
  Warnings:

  - You are about to drop the column `content` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `contentTitle` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('QUESTION_VOTE', 'ANSWER_VOTE', 'COMMENT', 'ANSWER', 'ANSWER_CHOSEN', 'REPORT');

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "content",
DROP COLUMN "title",
ADD COLUMN     "contentTitle" TEXT NOT NULL,
ADD COLUMN     "type" "NotificationType" NOT NULL;
