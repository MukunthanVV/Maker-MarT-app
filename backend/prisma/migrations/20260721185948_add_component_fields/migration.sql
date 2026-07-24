-- AlterTable
ALTER TABLE "Component" ADD COLUMN     "images" TEXT[],
ADD COLUMN     "is_free" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tech_specs" TEXT,
ADD COLUMN     "why_sell" TEXT;
