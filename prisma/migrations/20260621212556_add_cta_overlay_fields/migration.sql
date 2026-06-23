-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "ctaButtonText" TEXT,
ADD COLUMN     "ctaButtonUrl" TEXT,
ADD COLUMN     "ctaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ctaMessage" TEXT,
ADD COLUMN     "ctaTitle" TEXT;
