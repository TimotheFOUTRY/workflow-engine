-- Migration: Add workflow permissions
-- Created: 2026-01-30

-- Add permission fields to workflows table
ALTER TABLE workflows 
ADD COLUMN IF NOT EXISTS allowed_users UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS allowed_groups UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflows_allowed_users ON workflows USING GIN(allowed_users);
CREATE INDEX IF NOT EXISTS idx_workflows_allowed_groups ON workflows USING GIN(allowed_groups);
CREATE INDEX IF NOT EXISTS idx_workflows_is_public ON workflows(is_public);

-- Add comments
COMMENT ON COLUMN workflows.allowed_users IS 'Array of user IDs allowed to view and start this workflow';
COMMENT ON COLUMN workflows.allowed_groups IS 'Array of group IDs allowed to view and start this workflow';
COMMENT ON COLUMN workflows.is_public IS 'If true, all users can view and start this workflow';
