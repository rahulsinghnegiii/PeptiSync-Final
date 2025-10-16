-- Add email preferences to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{"marketing": true, "order_updates": true, "shipping_notifications": true}'::jsonb;

-- Add comment
COMMENT ON COLUMN profiles.email_preferences IS 'User email notification preferences';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email_preferences ON profiles USING gin(email_preferences);
