-- Migration: Add task form management features
-- Created: 2026-02-03

-- Add form management fields to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS form_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS form_progress INTEGER DEFAULT 0 CHECK (form_progress >= 0 AND form_progress <= 100),
ADD COLUMN IF NOT EXISTS assigned_users UUID[] DEFAULT '{}';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_locked_by ON tasks(locked_by);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_users ON tasks USING GIN(assigned_users);

-- Add comments
COMMENT ON COLUMN tasks.locked_by IS 'User ID who currently has the form locked for editing';
COMMENT ON COLUMN tasks.locked_at IS 'Timestamp when the form was locked';
COMMENT ON COLUMN tasks.form_data IS 'Current form data including partial saves';
COMMENT ON COLUMN tasks.form_progress IS 'Form completion percentage (0-100)';
COMMENT ON COLUMN tasks.assigned_users IS 'Array of user IDs assigned to work on this task';
