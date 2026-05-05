-- Multi-AI Support Migration

-- Add preferred_ai_provider column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_ai_provider VARCHAR(50) DEFAULT 'builtin';

-- User API Keys table
CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  encrypted_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  UNIQUE(user_id, provider)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_provider ON user_api_keys(provider);

-- Add comment for documentation
COMMENT ON TABLE user_api_keys IS 'Stores encrypted API keys for multi-AI provider support';
COMMENT ON COLUMN user_api_keys.encrypted_key IS 'Encrypted with user_id as part of key material - only decryptable by authenticated user';
