/*
  Warnings:

  - You are about to drop the column `category` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Property` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Property_category_idx";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "category",
DROP COLUMN "currency",
DROP COLUMN "district",
DROP COLUMN "images",
ADD COLUMN     "age" TEXT,
ADD COLUMN     "badge" TEXT,
ADD COLUMN     "floor" TEXT,
ADD COLUMN     "img" TEXT,
ADD COLUMN     "isDaily" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "listOrder" INTEGER,
ADD COLUMN     "priceText" TEXT,
ADD COLUMN     "sizeText" TEXT,
ADD COLUMN     "subtype" TEXT,
ADD COLUMN     "timeText" TEXT,
ADD COLUMN     "type" TEXT,
ALTER COLUMN "status" SET DEFAULT 'Aktif';

-- DropEnum
DROP TYPE "PropertyCategory";

-- CreateIndex
CREATE INDEX "Property_type_idx" ON "Property"("type");
