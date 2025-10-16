ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON public.profiles(clerk_id);
ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;
CREATE TABLE IF NOT EXISTS public.auth_migration_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  migration_method TEXT NOT NULL CHECK (migration_method IN ('automatic', 'manual', 'webhook')),
  migrated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  migration_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auth_migration_clerk_id ON public.auth_migration_status(clerk_id);
ALTER TABLE public.auth_migration_status ENABLE ROW LEVEL SECURITY;
SELECT 'Clerk support added successfully!' as status;
