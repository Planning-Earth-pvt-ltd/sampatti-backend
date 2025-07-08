/*
  Warnings:

  - Added the required column `ownerUserId` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `propertyType` on the `Property` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('Apartment', 'House', 'Plot', 'Villa');

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_sellerId_fkey";

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "ownerUserId" TEXT NOT NULL,
DROP COLUMN "propertyType",
ADD COLUMN     "propertyType" "PropertyType" NOT NULL,
ALTER COLUMN "sellerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
