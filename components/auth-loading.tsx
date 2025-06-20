"use client"

import { Shield } from "lucide-react"

export function AuthLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Loading content */}
      <div className="text-center space-y-6 z-10">
        <div className="relative">
          <Shield className="w-16 h-16 text-blue-400 animate-bounce mx-auto" />
          <div className="absolute -inset-4 bg-blue-400/20 rounded-full blur-md animate-ping"></div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            ArkVault
          </h1>
          <p className="text-slate-400">Securing your access...</p>
        </div>

        <div className="flex justify-center">
          <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  )
} 