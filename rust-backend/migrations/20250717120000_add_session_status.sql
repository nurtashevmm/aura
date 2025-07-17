-- Add status column to sessions table
ALTER TABLE sessions ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

-- Update existing sessions
UPDATE sessions SET status = 'active' WHERE ended_at IS NULL;
UPDATE sessions SET status = 'completed' WHERE ended_at IS NOT NULL;

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
