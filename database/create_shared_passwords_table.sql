-- This script creates the 'shared_passwords' table and enables Row Level Security.
-- Run this in your Supabase SQL Editor to resolve the issue with saving shared password data.

-- 1. Create the shared_passwords table
CREATE TABLE IF NOT EXISTS public.shared_passwords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  password_id UUID,
  password_title VARCHAR(255),
  password_username VARCHAR(255),
  password_url TEXT,
  password_category VARCHAR(100),
  password_notes TEXT,
  shared_with_email TEXT NOT NULL,
  shared_by_email TEXT NOT NULL,
  shared_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Optional: Add a foreign key to the original password entry.
  -- This ensures data integrity. If a password is deleted, the corresponding share record can be handled properly.
  CONSTRAINT fk_password
    FOREIGN KEY(password_id) 
    REFERENCES public.passwords(id)
    ON DELETE SET NULL -- Or use ON DELETE CASCADE if you want share records to be deleted when the password is.
);

-- 2. Add comments for clarity
COMMENT ON TABLE public.shared_passwords IS 'Logs every instance a password is shared with another user.';
COMMENT ON COLUMN public.shared_passwords.password_id IS 'The ID of the password that was shared from the "passwords" table.';
COMMENT ON COLUMN public.shared_passwords.shared_with_email IS 'The email address the password was sent to.';
COMMENT ON COLUMN public.shared_passwords.shared_by_user_id IS 'The user who initiated the share.';

-- 3. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_shared_passwords_user_id ON public.shared_passwords(shared_by_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_passwords_password_id ON public.shared_passwords(password_id);

-- 4. Enable Row Level Security (RLS) on the new table
ALTER TABLE public.shared_passwords ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for the table
-- Policy: Users can view the share records that they created.
CREATE POLICY "Users can view their own shared password records"
  ON public.shared_passwords FOR SELECT
  USING (auth.uid() = shared_by_user_id);

-- Policy: Users can create new share records for themselves.
CREATE POLICY "Users can insert their own shared password records"
  ON public.shared_passwords FOR INSERT
  WITH CHECK (auth.uid() = shared_by_user_id);

-- Note: We are intentionally not adding UPDATE or DELETE policies
-- to maintain a clear and immutable audit trail of sharing activity.

SELECT 'SUCCESS: The shared_passwords table and its policies have been created. Please try sharing a password again.'; 