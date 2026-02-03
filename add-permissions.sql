-- Add workflow permissions columns
ALTER TABLE workflows 
ADD COLUMN IF NOT EXISTS allowed_users UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS allowed_groups UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workflows_allowed_users ON workflows USING GIN(allowed_users);
CREATE INDEX IF NOT EXISTS idx_workflows_allowed_groups ON workflows USING GIN(allowed_groups);
CREATE INDEX IF NOT EXISTS idx_workflows_is_public ON workflows(is_public);
