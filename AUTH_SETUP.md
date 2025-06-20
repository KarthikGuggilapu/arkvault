# ArkVault Authentication Setup Guide

## Overview
This guide covers the complete authentication implementation for ArkVault using Supabase.

## Features Implemented

### 🔐 Authentication Features
- **User Registration**: Email/password signup with email confirmation
- **User Login**: Email/password and OTP-based authentication
- **Social Login**: Google and GitHub OAuth integration
- **Password Reset**: Email-based password recovery
- **Session Management**: Automatic session refresh and persistence
- **Route Protection**: Middleware-based route protection

### 👤 Profile Management
- **Profile Information**: Full name, bio, phone, location, website
- **Avatar Upload**: Image upload to Supabase storage with validation
- **Profile Updates**: Real-time profile editing and saving
- **Account Security**: Security settings and preferences

### 🚪 Logout Functionality
- **Secure Logout**: Proper session cleanup and redirect
- **Global Access**: Logout available from all authenticated pages

## Database Schema

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,
  phone VARCHAR(20),
  location VARCHAR(255),
  website VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'UTC',
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Storage Bucket
- **avatars**: For user profile pictures (5MB limit, image types only)

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://moojojwvgvygnqllccea.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vb2pvand2Z3Z5Z25xbGxjY2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzUzOTMsImV4cCI6MjA2NTgxMTM5M30.5yDz2Y0Um-_erEwFSY2DsyYjuQCE8e1Eo6uEaCgmY4w

# Site URL for OAuth redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vb2pvand2Z3Z5Z25xbGxjY2VhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDIzNTM5MywiZXhwIjoyMDY1ODExMzkzfQ.ZLaU7Fd6unzD9j1_BSpbbbrZh8WLue-xj0HxiQXIubk
```

## Authentication Flow

### 1. Registration Flow
1. User fills registration form
2. Account created in Supabase Auth
3. Email confirmation sent (if required)
4. User redirected to login page
5. User logs in and accesses dashboard

### 2. Login Flow
1. User enters credentials
2. Supabase validates authentication
3. Session created and stored
4. User redirected to dashboard
5. Middleware protects all dashboard routes

### 3. OAuth Flow
1. User clicks social login button
2. Redirected to OAuth provider
3. Provider redirects back to `/auth/callback`
4. Session established
5. User redirected to dashboard

### 4. Logout Flow
1. User clicks logout
2. Supabase session cleared
3. User redirected to home page
4. Middleware prevents access to protected routes

## File Structure

```
app/
├── actions.ts                    # Server actions for auth operations
├── auth/
│   └── callback/
│       └── route.ts             # OAuth callback handler
├── api/
│   └── profile/
│       ├── avatar/
│       │   └── route.ts         # Avatar upload API
│       └── update/
│           └── route.ts         # Profile update API
├── dashboard/
│   ├── page.tsx                 # Protected dashboard page
│   ├── dashboard-client.tsx     # Dashboard client component
│   └── profile/
│       ├── page.tsx             # Profile page
│       └── profile-client.tsx   # Profile client component
└── page.tsx                     # Login/signup page

middleware.ts                    # Route protection middleware
lib/
└── supabase.ts                 # Supabase client configuration
```

## Key Components

### Authentication Actions (`app/actions.ts`)
- `login()`: Email/password authentication
- `signup()`: User registration
- `logout()`: Session cleanup and redirect
- `getCurrentUser()`: Get authenticated user
- `updateUserProfile()`: Update profile information
- `updateUserAvatar()`: Upload and update avatar

### Middleware (`middleware.ts`)
- Protects dashboard routes
- Redirects authenticated users away from login
- Handles session refresh

### Profile Management
- **Profile Page**: Complete profile editing interface
- **Avatar Upload**: Drag-and-drop image upload
- **Form Validation**: Client and server-side validation
- **Real-time Updates**: Immediate feedback on changes

## Security Features

### Row Level Security (RLS)
- Users can only access their own data
- Profile information protected by user ID
- Avatar uploads restricted to user's own files

### Input Validation
- File type validation for avatars
- File size limits (5MB)
- Email format validation
- Password strength requirements

### Session Management
- Automatic session refresh
- Secure session storage
- Proper logout cleanup

## Usage Examples

### Login
```typescript
import { login } from '@/app/actions'

const result = await login(email, password)
if (result.success) {
  // User logged in successfully
  router.push('/dashboard')
}
```

### Profile Update
```typescript
import { updateUserProfile } from '@/app/actions'

const result = await updateUserProfile(userId, {
  full_name: 'John Doe',
  bio: 'Software Developer',
  phone: '+1234567890'
})
```

### Avatar Upload
```typescript
import { updateUserAvatar } from '@/app/actions'

const result = await updateUserAvatar(userId, file)
```

## Testing the Implementation

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test Registration**:
   - Navigate to `/`
   - Click "Sign Up" tab
   - Fill in email and password
   - Submit form
   - Should redirect to login page

3. **Test Login**:
   - Enter credentials
   - Submit form
   - Should redirect to dashboard

4. **Test Profile Management**:
   - Navigate to `/dashboard/profile`
   - Edit profile information
   - Upload avatar
   - Save changes

5. **Test Logout**:
   - Click user menu in top navigation
   - Click "Log out"
   - Should redirect to home page

## Troubleshooting

### Common Issues

1. **OAuth not working**:
   - Check `NEXT_PUBLIC_SITE_URL` environment variable
   - Verify OAuth provider configuration in Supabase

2. **Avatar upload fails**:
   - Check storage bucket permissions
   - Verify file size and type validation

3. **Session not persisting**:
   - Check Supabase client configuration
   - Verify middleware setup

4. **Route protection not working**:
   - Check middleware configuration
   - Verify session handling

### Debug Mode
Enable debug logging by checking browser console and server logs for detailed error messages.

## Next Steps

1. **Email Templates**: Customize email templates in Supabase dashboard
2. **OAuth Providers**: Configure additional OAuth providers
3. **Two-Factor Authentication**: Implement TOTP-based 2FA
4. **Password Policies**: Add password strength requirements
5. **Account Deletion**: Implement account deletion functionality
6. **Activity Logging**: Add user activity tracking
7. **Email Verification**: Customize email verification flow 