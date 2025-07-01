/*
  Warnings:

  - You are about to drop the `properties` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "properties";

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "totalAreaSqft" DOUBLE PRECISION NOT NULL,
    "TotalTokens" INTEGER NOT NULL,
    "currentValuation" DOUBLE PRECISION NOT NULL,
    "PricePerSqFt" DOUBLE PRECISION NOT NULL,
    "SqFtAreaPerToken" DOUBLE PRECISION NOT NULL,
    "PricePerToken" DOUBLE PRECISION NOT NULL,
    "status" "PropertyStatus" NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);
