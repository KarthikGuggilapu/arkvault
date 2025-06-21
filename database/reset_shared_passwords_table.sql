-- =================================================================
-- DEFINITIVE SCRIPT TO RESET THE 'shared_passwords' TABLE
-- =================================================================
-- This script will completely delete the existing table and its
-- policies to ensure a clean state, then recreate it exactly
-- as needed by the application.

-- Step 1: Drop the existing table and any dependent objects (like policies)
DROP TABLE IF EXISTS public.shared_passwords CASCADE;

-- Step 2: Re-create the table to match the application's requirements
CREATE TABLE public.shared_passwords (
  id SERIAL PRIMARY KEY,
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
  
  CONSTRAINT fk_password
    FOREIGN KEY(password_id) 
    REFERENCES public.passwords(id)
    ON DELETE SET NULL
);

-- Step 3: Add comments for clarity
COMMENT ON TABLE public.shared_passwords IS 'Logs every instance a password is shared with another user.';

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shared_passwords_user_id ON public.shared_passwords(shared_by_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_passwords_password_id ON public.shared_passwords(password_id);

-- Step 5: Enable Row Level Security (RLS)
ALTER TABLE public.shared_passwords ENABLE ROW LEVEL SECURITY;

-- Step 6: Create the necessary RLS policies
CREATE POLICY "Users can view their own shared password records"
  ON public.shared_passwords FOR SELECT
  USING (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can insert their own shared password records"
  ON public.shared_passwords FOR INSERT
  WITH CHECK (auth.uid() = shared_by_user_id);

-- Step 7: Explicitly grant permissions to the Supabase service role
GRANT ALL ON TABLE public.shared_passwords TO service_role;
GRANT USAGE, SELECT ON SEQUENCE shared_passwords_id_seq TO service_role;

SELECT 'SUCCESS: The shared_passwords table has been reset successfully.'; 