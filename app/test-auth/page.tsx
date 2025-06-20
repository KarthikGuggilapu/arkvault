import { createClient } from '@/utils/supabase/server'

export default async function TestAuthPage() {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">User Status:</h2>
            <p>User: {user ? user.email : 'Not authenticated'}</p>
            <p>Error: {error ? error.message : 'None'}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">Supabase Config:</h2>
            <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
            <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">Cookies:</h2>
            <p>Check browser dev tools for auth cookies</p>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Authentication Test - Error</h1>
        <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    )
  }
} 