"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestConnectionPage() {
  const [testResult, setTestResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      // Test basic connection
      const { data, error } = await supabase.from('passwords').select('count').limit(1)
      
      if (error) {
        setTestResult(`Connection Error: ${error.message}`)
      } else {
        setTestResult("✅ Database connection successful!")
      }
    } catch (err) {
      setTestResult(`❌ Connection failed: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const testAuth = async () => {
    setLoading(true)
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setTestResult(`Auth Error: ${error.message}`)
      } else if (session) {
        setTestResult(`✅ Auth working! User: ${session.user.email}`)
      } else {
        setTestResult("ℹ️ No active session (this is normal if not logged in)")
      }
    } catch (err) {
      setTestResult(`❌ Auth test failed: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button onClick={testConnection} disabled={loading} className="w-full">
              Test Database Connection
            </Button>
            <Button onClick={testAuth} disabled={loading} variant="outline" className="w-full">
              Test Authentication
            </Button>
          </div>
          
          {testResult && (
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 