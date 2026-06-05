-- Trust Ecosystem Migration
-- Run this in Supabase SQL Editor (pooler connection)

-- 1. Add trust fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_doc_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio_images TEXT[] DEFAULT '{}';

-- 2. Add photos to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- 3. Create verification_requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id TEXT PRIMARY KEY,
  tasker_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doc_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_verification_requests_tasker ON verification_requests(tasker_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
