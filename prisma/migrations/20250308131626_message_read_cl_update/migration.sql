/*
  Warnings:

  - You are about to drop the column `isReadByUser1` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `isReadByUser2` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `readByUser1At` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `readByUser2At` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Message` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ReadStatus" AS ENUM ('SENT', 'DELIVERED', 'READ');

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "isReadByUser1",
DROP COLUMN "isReadByUser2",
DROP COLUMN "readByUser1At",
DROP COLUMN "readByUser2At",
DROP COLUMN "updatedAt",
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "readByRecipient" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readStatus" "ReadStatus" NOT NULL DEFAULT 'SENT';

-- CreateIndex
CREATE INDEX "Message_readStatus_idx" ON "Message"("readStatus");
