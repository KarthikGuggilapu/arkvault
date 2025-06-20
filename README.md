# ArkVault - Secure Password Manager

A modern, feature-rich password management application built with Next.js 15, TypeScript, and Supabase.

## 🚀 Features

- **Secure Authentication**: Email/password authentication with Supabase Auth
- **Password Management**: Store, organize, and manage passwords with categories
- **Password Generator**: Advanced password generation with customizable options
- **Modern UI**: Beautiful, responsive interface with dark/light theme support
- **Real-time Updates**: Live authentication state management
- **Security**: Row Level Security (RLS) for data protection
- **Search & Filter**: Find passwords quickly with search and category filtering

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Authentication**: Supabase Auth with session management
- **Icons**: Lucide React
- **Notifications**: Sonner toast system

## 📋 Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase account

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd arkvault
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Update the Supabase configuration in `lib/supabase.ts`:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
```

### 4. Set Up Database Schema

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the SQL commands from `database/schema.sql` to create the passwords table and set up Row Level Security

### 5. Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:3000` for development)
3. Add redirect URLs:
   - `http://localhost:3000/dashboard` (for development)
   - `https://yourdomain.com/dashboard` (for production)

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
arkvault/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages and components
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Login page
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── auth-loading.tsx  # Authentication loading component
│   └── theme-provider.tsx # Theme provider
├── hooks/                # Custom React hooks
│   └── use-auth.tsx      # Authentication hook
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Supabase client configuration
│   └── utils.ts          # Utility functions
├── database/             # Database schema
│   └── schema.sql        # SQL schema for passwords table
├── middleware.ts         # Next.js middleware for auth routing
└── package.json          # Dependencies and scripts
```

## 🔐 Authentication Flow

1. **Sign Up**: Users can create new accounts with email/password
2. **Sign In**: Existing users can log in with their credentials
3. **Session Management**: Automatic session handling with Supabase
4. **Protected Routes**: Middleware ensures only authenticated users access dashboard
5. **Logout**: Users can securely log out from the sidebar

## 🗄️ Database Schema

The application uses a single `passwords` table with the following structure:

```sql
passwords (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title VARCHAR(255),
  username VARCHAR(255),
  password TEXT,
  url VARCHAR(500),
  category VARCHAR(100),
  notes TEXT,
  is_expired BOOLEAN,
  last_updated TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Users can only access their own passwords
- **Password Masking**: Passwords are hidden by default with toggle option
- **Secure Copy**: Clipboard integration with notifications
- **Session Management**: Automatic session handling and cleanup
- **Input Validation**: Form validation on both client and server side

## 🎨 UI Components

The application uses a custom design system built with:
- **shadcn/ui**: High-quality, accessible components
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons
- **Next Themes**: Dark/light theme support

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/arkvault/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

## 🔮 Roadmap

- [ ] Two-factor authentication (2FA)
- [ ] Password sharing between users
- [ ] Password strength analysis
- [ ] Browser extension integration
- [ ] Mobile app
- [ ] Password import/export
- [ ] Advanced search filters
- [ ] Password history tracking
- [ ] Secure notes feature
- [ ] API for third-party integrations

---

Built with ❤️ using Next.js and Supabase 