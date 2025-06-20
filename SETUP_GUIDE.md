# ArkVault Setup Guide

## 🔧 **Step-by-Step Supabase Configuration**

### **1. Supabase Project Setup**

1. **Go to [supabase.com](https://supabase.com)** and sign in
2. **Create a new project** or use your existing project
3. **Note down your project details:**
   - Project URL: `https://moojojwvgvygnqllccea.supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **2. Database Schema Setup**

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run the following SQL commands:**

```sql
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords(user_id);
CREATE INDEX IF NOT EXISTS idx_passwords_category ON passwords(category);

-- Enable Row Level Security
ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own passwords" ON passwords
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own passwords" ON passwords
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own passwords" ON passwords
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own passwords" ON passwords
  FOR DELETE USING (auth.uid() = user_id);

-- Create function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_passwords_updated_at
  BEFORE UPDATE ON passwords
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### **3. Authentication Configuration**

1. **Go to Authentication → Settings**
2. **Configure Site URL:**
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
3. **Add Redirect URLs:**
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/dashboard` (for production)
   - `https://yourdomain.com/auth/callback` (for production)

### **4. Email Configuration (Optional)**

1. **Go to Authentication → Email Templates**
2. **Customize email templates if needed**
3. **For development, you can use the default templates**

### **5. Testing the Setup**

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Visit the debug page:**
   ```
   http://localhost:3000/debug
   ```

3. **Test each component:**
   - Click "Test Database" - Should show success or specific error
   - Click "Test Auth" - Should show "No active session"
   - Click "Test Sign Up" - Should create a new user
   - Click "Test Sign In" - Should log in the user
   - Click "Check Cookies" - Should show Supabase cookies

### **6. Common Issues & Solutions**

#### **Issue: "Database connection failed"**
- **Solution:** Run the SQL schema commands in Supabase SQL Editor

#### **Issue: "No Supabase cookies found"**
- **Solution:** Check if authentication is properly configured
- **Solution:** Verify redirect URLs are set correctly

#### **Issue: "RLS policy violation"**
- **Solution:** Ensure RLS policies are created correctly
- **Solution:** Check if user is authenticated

#### **Issue: "Session not persisting"**
- **Solution:** Check browser cookies settings
- **Solution:** Verify Supabase client configuration

### **7. Environment Variables (Optional)**

For production, you can use environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://moojojwvgvygnqllccea.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### **8. Verification Checklist**

- [ ] Database schema created successfully
- [ ] RLS policies enabled and working
- [ ] Authentication settings configured
- [ ] Redirect URLs set correctly
- [ ] Debug page shows successful connections
- [ ] User can sign up and sign in
- [ ] Session persists across page reloads
- [ ] Dashboard loads with user information

### **9. Next Steps**

Once the setup is complete:
1. Test the full authentication flow
2. Implement password management features
3. Add additional security features
4. Deploy to production

---

**Need Help?** Check the debug page at `/debug` for detailed error messages and troubleshooting information. 