-- Migration: Add Profile and Group Chat Features
-- Date: 2025-11-16

-- Add profile fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Add group chat fields to conversations table
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS enable_video BOOLEAN DEFAULT false;

-- Create group_invites table
CREATE TABLE IF NOT EXISTS group_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    max_uses INTEGER DEFAULT 0,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_invites_code ON group_invites(code);
CREATE INDEX IF NOT EXISTS idx_group_invites_group_id ON group_invites(group_id);
CREATE INDEX IF NOT EXISTS idx_group_invites_deleted_at ON group_invites(deleted_at);

-- Add comment documentation
COMMENT ON COLUMN users.bio IS 'User biography/description (max 500 chars)';
COMMENT ON COLUMN users.avatar_url IS 'URL to user avatar image (Cloudinary)';
COMMENT ON COLUMN users.preferences IS 'User preferences stored as JSON';
COMMENT ON COLUMN conversations.description IS 'Group description';
COMMENT ON COLUMN conversations.enable_video IS 'Whether video calls are enabled for this group';
COMMENT ON TABLE group_invites IS 'Invite codes for joining groups';
