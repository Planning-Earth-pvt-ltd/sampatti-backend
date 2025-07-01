/*
  Warnings:

  - You are about to drop the `Property` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'LAND');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('LISTED', 'ACTIVE', 'SOLD');

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_ownerUserId_fkey";

-- DropTable
DROP TABLE "Property";

-- CreateTable
CREATE TABLE "properties" (
    "propertyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "totalAreaSqft" DOUBLE PRECISION NOT NULL,
    "tokenisedAreaSqft" DOUBLE PRECISION NOT NULL,
    "currentValuation" DOUBLE PRECISION NOT NULL,
    "status" "PropertyStatus" NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("propertyId")
);

-- CreateIndex
CREATE INDEX "properties_ownerUserId_idx" ON "properties"("ownerUserId");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
