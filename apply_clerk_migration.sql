-- Quick Clerk Migration Application
-- This applies only the essential Clerk support changes

-- Add clerk_id column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;

-- Create index for fast clerk_id lookups
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON public.profiles(clerk_id);

-- Make user_id nullable to support Clerk-only users
ALTER TABLE public.profiles 
ALTER COLUMN user_id DROP NOT NULL;

-- Create auth migration tracking table
CREATE TABLE IF NOT EXISTS public.auth_migration_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clerk_id TEXT,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  migration_method TEXT NOT NULL CHECK (migration_method IN ('automatic', 'manual', 'webhook')),
  migrated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  migration_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_auth_migration_user_id ON public.auth_migration_status(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_migration_clerk_id ON public.auth_migration_status(clerk_id);
CREATE INDEX IF NOT EXISTS idx_auth_migration_profile_id ON public.auth_migration_status(profile_id);

-- Enable RLS
ALTER TABLE public.auth_migration_status ENABLE ROW LEVEL SECURITY;

SELECT 'Clerk migration applied successfully!' as status;
