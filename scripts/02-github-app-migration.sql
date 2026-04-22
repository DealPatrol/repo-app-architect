-- GitHub App Migration Script
-- Adds tables for GitHub App-based authentication (replacing OAuth tokens)

-- User accounts table (replaces/supplements user_auth for GitHub App model)
CREATE TABLE IF NOT EXISTS user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id BIGINT NOT NULL UNIQUE,
  github_username VARCHAR(255) NOT NULL,
  github_avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- GitHub App installations table (one per user/org that installs the app)
CREATE TABLE IF NOT EXISTS github_app_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id BIGINT NOT NULL UNIQUE,
  account_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  account_type VARCHAR(50) NOT NULL DEFAULT 'personal' CHECK (account_type IN ('personal', 'organization')),
  repositories_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_accounts_github_id ON user_accounts(github_id);
CREATE INDEX IF NOT EXISTS idx_user_accounts_github_username ON user_accounts(github_username);
CREATE INDEX IF NOT EXISTS idx_github_app_installations_installation_id ON github_app_installations(installation_id);
CREATE INDEX IF NOT EXISTS idx_github_app_installations_account_id ON github_app_installations(account_id);
CREATE INDEX IF NOT EXISTS idx_github_app_installations_active ON github_app_installations(active);
