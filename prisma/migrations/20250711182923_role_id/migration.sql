/*
  Warnings:

  - You are about to drop the column `Role_Name` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `User_Name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[role_name]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_name]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roleId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_id_fkey" CASCADE;

-- DropIndex
DROP INDEX "Role_Role_Name_key" CASCADE;

-- DropIndex
DROP INDEX "User_User_Name_key" CASCADE;

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "Role_Name" CASCADE,
ADD COLUMN     "role_name" TEXT NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "User_Name" CASCADE,
ADD COLUMN     "roleId" TEXT NOT NULL,
ADD COLUMN     "user_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Role_role_name_key" ON "Role"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_name_key" ON "User"("user_name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
