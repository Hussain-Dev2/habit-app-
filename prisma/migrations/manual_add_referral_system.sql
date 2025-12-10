-- AlterTable: Add referral system fields to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredBy" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "totalReferrals" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralEarnings" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex: Add unique index for referralCode
CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User"("referralCode");

-- AddForeignKey: Add self-referential foreign key for referrals
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'User_referredBy_fkey'
    ) THEN
        ALTER TABLE "User" 
        ADD CONSTRAINT "User_referredBy_fkey" 
        FOREIGN KEY ("referredBy") 
        REFERENCES "User"("referralCode") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;
END $$;
