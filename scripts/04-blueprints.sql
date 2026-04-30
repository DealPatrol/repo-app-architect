-- Persist generated app blueprints per user/source

CREATE TABLE IF NOT EXISTS public.app_blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  source_name VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  app_type VARCHAR(100) NOT NULL,
  complexity VARCHAR(20) NOT NULL CHECK (complexity IN ('simple', 'moderate', 'complex')),
  reuse_percentage INTEGER NOT NULL CHECK (reuse_percentage BETWEEN 0 AND 100),
  existing_files JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_files JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_effort VARCHAR(100),
  technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_app_blueprints_user_id
  ON public.app_blueprints(user_id);

CREATE INDEX IF NOT EXISTS idx_app_blueprints_user_source
  ON public.app_blueprints(user_id, source_name);

CREATE INDEX IF NOT EXISTS idx_app_blueprints_created_at
  ON public.app_blueprints(created_at DESC);
