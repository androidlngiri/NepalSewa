-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Add balance field to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "balance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- 2. Create PayoutStatus enum
DO $$ BEGIN
  CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Create payout_requests table
CREATE TABLE IF NOT EXISTS "payout_requests" (
  "id" TEXT NOT NULL,
  "taskerId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
  "method" TEXT NOT NULL DEFAULT 'ESEWA',
  "accountDetails" TEXT,
  "notes" TEXT,
  "processedAt" TIMESTAMPTZ(6),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "payout_requests_pkey" PRIMARY KEY ("id")
);

-- 4. Add foreign key
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_taskerId_fkey"
  FOREIGN KEY ("taskerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5. Add indexes
CREATE INDEX IF NOT EXISTS "payout_requests_taskerId_idx" ON "payout_requests"("taskerId");
CREATE INDEX IF NOT EXISTS "payout_requests_status_idx" ON "payout_requests"("status");
