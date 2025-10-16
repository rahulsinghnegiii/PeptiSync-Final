-- Add clerk_id column if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON public.profiles(clerk_id);
ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;

-- Create your profile with your Clerk user ID
INSERT INTO public.profiles (clerk_id, email, full_name, membership_tier)
VALUES (
  'user_343yj8uOwtMryMS51vLyzqQYLxW',  -- Your Clerk user ID from the error
  'rahulsinghnegi25561@gmail.com',             -- CHANGE THIS to your actual email
  'Rahul',                          -- CHANGE THIS to your actual name
  'free'
)
ON CONFLICT (clerk_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;

-- Verify it was created
SELECT * FROM public.profiles WHERE clerk_id = 'user_343yj8uOwtMryMS51vLyzqQYLxW';
