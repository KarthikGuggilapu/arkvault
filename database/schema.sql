-- Create passwords table
CREATE TABLE IF NOT EXISTS passwords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password TEXT NOT NULL,
  url VARCHAR(500),
  category VARCHAR(100) DEFAULT 'Personal',
  notes TEXT,
  is_expired BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords(user_id);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_passwords_category ON passwords(category);

-- Enable Row Level Security (RLS)
ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own passwords
CREATE POLICY "Users can view their own passwords" ON passwords
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own passwords
CREATE POLICY "Users can insert their own passwords" ON passwords
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own passwords
CREATE POLICY "Users can update their own passwords" ON passwords
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own passwords
CREATE POLICY "Users can delete their own passwords" ON passwords
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_passwords_updated_at
  BEFORE UPDATE ON passwords
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 