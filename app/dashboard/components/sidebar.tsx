"use client"

import { Shield, Key, Users, Bell, Settings, Activity, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { toast } from "sonner"
// TODO: Fix import path for supabase if '@/app/supabase' does not exist
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

const menuItems = [
  { icon: Shield, label: "Vault", href: "/dashboard", count: null },
  { icon: Key, label: "Password Generator", href: "/dashboard/generator", count: null },
  { icon: Users, label: "Shared", href: "/dashboard/shared", count: null },
  // { icon: Bell, label: "Notifications", href: "/dashboard/notifications", count: 2 },
  { icon: Activity, label: "Activity", href: "/dashboard/activity", count: null },
  { icon: Settings, label: "Settings", href: "/dashboard/settings", count: null },
]

interface SidebarProps {
  user: User
}

export function Sidebar({ user }: SidebarProps) {
  const [sharedCount, setSharedCount] = useState<number | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const fetchSharedCount = async () => {
      // Count passwords shared BY the user
      const { count, error } = await supabase
        .from("shared_passwords")
        .select("*", { count: "exact", head: true })
        .eq("shared_by_user_id", user.id)

      if (!error) setSharedCount(count ?? 0)
    }
    if (user?.id) fetchSharedCount()
  }, [user?.id])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Signed out successfully')
      router.push('/')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  return (
    <div className="w-64 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 p-4 flex flex-col h-screen">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center space-x-2 mb-8">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ArkVault
        </span>
      </Link>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.label} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <item.icon className="w-4 h-4 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count && (
                  <Badge
                    variant="secondary"
                    className="ml-auto bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  >
                    {item.count}
                  </Badge>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* User Info and Logout */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              {user?.email || 'Demo User'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user?.user_metadata?.role || 'user'}
            </p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-start gap-2 border-slate-300 dark:border-slate-600 mt-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  )
}
