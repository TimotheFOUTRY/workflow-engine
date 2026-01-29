-- Migration: Add service column to users table
-- Description: Add optional service field to track user's department/service

-- Add service column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS service VARCHAR(255);

-- Add index for faster service-based queries
CREATE INDEX IF NOT EXISTS idx_users_service ON users(service);

-- Add comment
COMMENT ON COLUMN users.service IS 'User department or service';
