-- AlterEnum
ALTER TYPE "Plan" ADD VALUE 'BASIC';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasHadTrial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trialEndsAt" TIMESTAMP(3);
