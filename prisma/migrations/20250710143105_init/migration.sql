/*
  Warnings:

  - Added the required column `UpdatedAt` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "CreatedByAdmin" TEXT,
ADD COLUMN     "UpdatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "UpdatedByAdmin" TEXT;

-- CreateTable
CREATE TABLE "Admin" (
    "Admin_id" TEXT NOT NULL,
    "Username" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "Admin_Image" BYTEA,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("Admin_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_Admin_id_key" ON "Admin"("Admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_Username_key" ON "Admin"("Username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_Password_key" ON "Admin"("Password");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_CreatedByAdmin_fkey" FOREIGN KEY ("CreatedByAdmin") REFERENCES "Admin"("Admin_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_UpdatedByAdmin_fkey" FOREIGN KEY ("UpdatedByAdmin") REFERENCES "Admin"("Admin_id") ON DELETE SET NULL ON UPDATE CASCADE;
