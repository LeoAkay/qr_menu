/*
  Warnings:

  - You are about to drop the column `Password` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `Username` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_CreatedByAdmin_fkey";

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_UpdatedByAdmin_fkey";

-- DropIndex
DROP INDEX "Company_Username_key" CASCADE;

-- DropIndex
DROP INDEX "Company_id_key" CASCADE;

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "Password",
DROP COLUMN "Username",
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Admin";

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "Role_Name" TEXT NOT NULL DEFAULT 'USER',

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "User_Name" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_Role_Name_key" ON "Role"("Role_Name");

-- CreateIndex
CREATE UNIQUE INDEX "User_User_Name_key" ON "User"("User_Name");

-- CreateIndex
CREATE UNIQUE INDEX "Company_userId_key" ON "Company"("userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_id_fkey" FOREIGN KEY ("id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_CreatedByAdmin_fkey" FOREIGN KEY ("CreatedByAdmin") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_UpdatedByAdmin_fkey" FOREIGN KEY ("UpdatedByAdmin") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
