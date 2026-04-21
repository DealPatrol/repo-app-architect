-- Onboarding progress tracking for activation checklist

CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  user_id UUID PRIMARY KEY REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  profile_completed_at TIMESTAMP WITH TIME ZONE,
  first_project_created_at TIMESTAMP WITH TIME ZONE,
  first_task_created_at TIMESTAMP WITH TIME ZONE,
  trial_started_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_onboarding_progress_updated_at
  ON public.onboarding_progress(updated_at DESC);
