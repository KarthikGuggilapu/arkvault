-- Update user_activity table to include missing fields
-- This script adds the fields that the application code expects

-- Add title field
ALTER TABLE user_activity ADD COLUMN IF NOT EXISTS title VARCHAR(255);

-- Add icon field
ALTER TABLE user_activity ADD COLUMN IF NOT EXISTS icon VARCHAR(50);

-- Add color field
ALTER TABLE user_activity ADD COLUMN IF NOT EXISTS color VARCHAR(100);

-- Add comments for documentation
COMMENT ON COLUMN user_activity.title IS 'Display title for the activity';
COMMENT ON COLUMN user_activity.icon IS 'Icon name for the activity (e.g., Share, Plus, Eye)';
COMMENT ON COLUMN user_activity.color IS 'CSS color class for the activity (e.g., text-blue-500)'; 