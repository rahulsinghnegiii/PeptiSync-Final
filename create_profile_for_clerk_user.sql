-- Create profile for the Clerk user who just signed in
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/eglrmtlodkpoemuyiqlz/sql/new

-- First, add the clerk_id column if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON public.profiles(clerk_id);
ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;

-- Create the profile for your Clerk user
INSERT INTO public.profiles (clerk_id, email, full_name, membership_tier)
VALUES (
  'user_3471KRQjU4pkHoY72c3pJP1S6uC',
  'your-email@example.com',  -- Replace with your actual email
  'Your Name',                -- Replace with your actual name
  'free'
)
ON CONFLICT (clerk_id) DO NOTHING;

-- Verify it was created
SELECT * FROM public.profiles WHERE clerk_id = 'user_3471KRQjU4pkHoY72c3pJP1S6uC';
