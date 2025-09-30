/*
  Warnings:

  - The primary key for the `KidsGiftBox` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[displayId]` on the table `KidsGiftBox` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."KidsGiftBox" DROP CONSTRAINT "KidsGiftBox_pkey",
ADD COLUMN     "displayId" VARCHAR(20),
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "KidsGiftBox_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "KidsGiftBox_displayId_key" ON "public"."KidsGiftBox"("displayId");

-- CreateIndex
CREATE INDEX "KidsGiftBox_displayId_idx" ON "public"."KidsGiftBox"("displayId");
