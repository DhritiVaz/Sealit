-- Sealit Supabase Schema
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  headline TEXT NOT NULL,
  description TEXT NOT NULL,
  domain TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  context TEXT NOT NULL,
  tried_before TEXT NOT NULL,
  builders_count INTEGER DEFAULT 0,
  builders_started_pct INTEGER DEFAULT 0,
  source TEXT NOT NULL CHECK (source IN ('reddit', 'hn')),
  source_url TEXT NOT NULL UNIQUE,
  raw_post TEXT NOT NULL,
  time_estimate TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_problems_created_at ON problems (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_problems_domain ON problems (domain);

-- Enable realtime for live feed updates
ALTER PUBLICATION supabase_realtime ADD TABLE problems;
