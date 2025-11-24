/*
  Warnings:

  - You are about to drop the column `code` on the `Course` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[prefix,number]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `number` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prefix` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Course_code_key";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "code",
ADD COLUMN     "number" TEXT NOT NULL,
ADD COLUMN     "prefix" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Course_prefix_number_key" ON "Course"("prefix", "number");
