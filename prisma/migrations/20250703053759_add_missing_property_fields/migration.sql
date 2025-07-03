/*
  Warnings:

  - Added the required column `propertyCategory` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `propertyType` on the `Property` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PropertyCategory" AS ENUM ('Residential', 'Commercial', 'Industrial', 'Land');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "images" TEXT[],
ADD COLUMN     "propertyCategory" "PropertyCategory" NOT NULL,
ADD COLUMN     "propertySubType" TEXT,
DROP COLUMN "propertyType",
ADD COLUMN     "propertyType" TEXT NOT NULL;

-- DropEnum
DROP TYPE "PropertyType";
