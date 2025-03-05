/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `user1Id` on the `ChatRoom` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user2Id` on the `ChatRoom` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `senderId` on the `Message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ChatRoom" DROP CONSTRAINT "ChatRoom_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "ChatRoom" DROP CONSTRAINT "ChatRoom_user2Id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- AlterTable
ALTER TABLE "ChatRoom" DROP COLUMN "user1Id",
ADD COLUMN     "user1Id" INTEGER NOT NULL,
DROP COLUMN "user2Id",
ADD COLUMN     "user2Id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "senderId",
ADD COLUMN     "senderId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "ChatRoom_user1Id_idx" ON "ChatRoom"("user1Id");

-- CreateIndex
CREATE INDEX "ChatRoom_user2Id_idx" ON "ChatRoom"("user2Id");

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_user1Id_user2Id_key" ON "ChatRoom"("user1Id", "user2Id");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
