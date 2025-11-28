-- AlterTable
ALTER TABLE "Venture" ADD COLUMN "durationMinutes" INTEGER;
ALTER TABLE "Venture" ADD COLUMN "priceCents" INTEGER;
ALTER TABLE "Venture" ADD COLUMN "currency" TEXT DEFAULT 'EUR';
ALTER TABLE "Venture" ADD COLUMN "bookingLink" TEXT;
ALTER TABLE "Venture" ADD COLUMN "contraindications" TEXT;
ALTER TABLE "Venture" ADD COLUMN "faq" JSONB;
