"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function DebugPage() {
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [cookieStatus, setCookieStatus] = useState<any>(null)
  const [testEmail, setTestEmail] = useState('test@example.com')
  const [testPassword, setTestPassword] = useState('testpassword123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createClient()

  const checkAuth = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setAuthStatus({ error: error.message })
      } else {
        setAuthStatus({
          session: !!session,
          user: session?.user ? {
            id: session.user.id,
            email: session.user.email,
            email_confirmed_at: session.user.email_confirmed_at,
            created_at: session.user.created_at
          } : null
        })
      }
    } catch (err) {
      setAuthStatus({ error: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const checkDatabase = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      // Test basic connection
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (testError) {
        setDbStatus({ error: testError.message })
        return
      }

      // Test if tables exist
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      const { data: preferences, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .limit(1)
      
      const { data: activity, error: activityError } = await supabase
        .from('user_activity')
        .select('*')
        .limit(1)

      setDbStatus({
        connection: 'OK',
        tables: {
          profiles: profilesError ? { error: profilesError.message } : { exists: true, count: profiles?.length || 0 },
          user_preferences: preferencesError ? { error: preferencesError.message } : { exists: true, count: preferences?.length || 0 },
          user_activity: activityError ? { error: activityError.message } : { exists: true, count: activity?.length || 0 }
        }
      })
    } catch (err) {
      setDbStatus({ error: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const checkCookies = () => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)
    
    setCookieStatus({
      total: Object.keys(cookies).length,
      cookies: cookies,
      supabaseCookies: Object.keys(cookies).filter(key => 
        key.includes('supabase') || key.includes('sb-')
      )
    })
  }

  const testRegistration = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      })
      
      if (error) {
        setError(`Registration failed: ${error.message}`)
      } else {
        setSuccess(`Registration successful! User ID: ${data.user?.id}`)
        console.log('Registration data:', data)
      }
    } catch (err) {
      setError(`Registration error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })
      
      if (error) {
        setError(`Login failed: ${error.message}`)
      } else {
        setSuccess(`Login successful! User ID: ${data.user?.id}`)
        console.log('Login data:', data)
      }
    } catch (err) {
      setError(`Login error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const clearAll = () => {
    setAuthStatus(null)
    setDbStatus(null)
    setCookieStatus(null)
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Debug Dashboard</h1>
        <Button onClick={clearAll} variant="outline">Clear All</Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Authentication Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔐 Authentication
              {authStatus && (
                <Badge variant={authStatus.error ? "destructive" : "default"}>
                  {authStatus.error ? "Error" : "OK"}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Test authentication status and session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkAuth} disabled={loading} className="w-full">
              Check Auth Status
            </Button>
            
            {authStatus && (
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Session:</strong> {authStatus.session ? "Active" : "None"}
                </div>
                {authStatus.user && (
                  <div className="text-sm space-y-1">
                    <div><strong>User ID:</strong> {authStatus.user.id}</div>
                    <div><strong>Email:</strong> {authStatus.user.email}</div>
                    <div><strong>Email Confirmed:</strong> {authStatus.user.email_confirmed_at ? "Yes" : "No"}</div>
                    <div><strong>Created:</strong> {new Date(authStatus.user.created_at).toLocaleString()}</div>
                  </div>
                )}
                {authStatus.error && (
                  <div className="text-sm text-red-600">
                    <strong>Error:</strong> {authStatus.error}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🗄️ Database
              {dbStatus && (
                <Badge variant={dbStatus.error ? "destructive" : "default"}>
                  {dbStatus.error ? "Error" : "OK"}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Test database connection and tables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkDatabase} disabled={loading} className="w-full">
              Check Database
            </Button>
            
            {dbStatus && (
              <div className="space-y-2">
                {dbStatus.connection && (
                  <div className="text-sm">
                    <strong>Connection:</strong> {dbStatus.connection}
                  </div>
                )}
                {dbStatus.tables && (
                  <div className="text-sm space-y-1">
                    <div><strong>Tables:</strong></div>
                    {Object.entries(dbStatus.tables).map(([table, status]: [string, any]) => (
                      <div key={table} className="ml-2">
                        <strong>{table}:</strong> {status.error ? (
                          <span className="text-red-600">{status.error}</span>
                        ) : (
                          `Exists (${status.count} records)`
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {dbStatus.error && (
                  <div className="text-sm text-red-600">
                    <strong>Error:</strong> {dbStatus.error}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cookies Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🍪 Cookies
              {cookieStatus && (
                <Badge variant="default">
                  {cookieStatus.total} total
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Check browser cookies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkCookies} disabled={loading} className="w-full">
              Check Cookies
            </Button>
            
            {cookieStatus && (
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Total Cookies:</strong> {cookieStatus.total}
                </div>
                <div className="text-sm">
                  <strong>Supabase Cookies:</strong> {cookieStatus.supabaseCookies.length}
                </div>
                {cookieStatus.supabaseCookies.length > 0 && (
                  <div className="text-sm space-y-1">
                    {cookieStatus.supabaseCookies.map((cookie: string) => (
                      <div key={cookie} className="ml-2">
                        {cookie}: {cookieStatus.cookies[cookie]?.substring(0, 20)}...
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Test Registration/Login */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test Registration & Login</CardTitle>
          <CardDescription>Test the registration and login flow</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Test Email</Label>
              <Input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-password">Test Password</Label>
              <Input
                id="test-password"
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="testpassword123"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={testRegistration} disabled={loading}>
              Test Registration
            </Button>
            <Button onClick={testLogin} disabled={loading} variant="outline">
              Test Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 