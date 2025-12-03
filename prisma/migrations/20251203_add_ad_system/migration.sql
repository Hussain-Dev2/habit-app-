-- Add advertising system fields to User model
ALTER TABLE "User" ADD COLUMN "lastAdWatch" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "adWatchCount" INTEGER NOT NULL DEFAULT 0;

-- PointsHistory table modifications (only if table exists)
-- The table may not exist in all environments, so we handle gracefully
