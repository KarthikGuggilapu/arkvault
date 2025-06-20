"use client"

import { useAuth } from "@/hooks/use-auth"

export function SessionDebug() {
  const { user, session, loading } = useAuth()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Session Debug</h3>
      <div className="space-y-1">
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>User: {user?.email || 'None'}</div>
        <div>Session: {session ? 'Active' : 'None'}</div>
        <div>User ID: {user?.id || 'None'}</div>
      </div>
    </div>
  )
} 