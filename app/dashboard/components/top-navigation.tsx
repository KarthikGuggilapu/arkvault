"use client"

import { useState } from "react"
import { Search, Bell, Sun, Moon, User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { User as SupabaseUser } from "@supabase/supabase-js"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { supabase } from "@/lib/supabase"

interface TopNavigationProps {
  user: SupabaseUser
  profile: any
  searchQuery: string
  onSearchChange: (query: string) => void
  expiredCount: number
}

export function TopNavigation({ user, profile, searchQuery, onSearchChange, expiredCount }: TopNavigationProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error('Failed to sign out');
    }
  }

  const handleProfileClick = () => {
    router.push('/dashboard/profile')
  }

  const getUserInitials = () => {
    const name =
      user?.user_metadata?.full_name ||
      profile?.full_name ||
      user?.email?.split('@')[0] ||
      ''
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  return (
    <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search your vault..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-slate-600 dark:text-slate-400"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Notifications */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="relative text-slate-600 dark:text-slate-400">
                <Bell className="w-4 h-4" />
                {expiredCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {expiredCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>
                  Stay updated with your vault activities and security alerts.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {expiredCount > 0 ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-red-800 dark:text-red-200">
                          {expiredCount} password{expiredCount > 1 ? 's' : ''} expired
                        </span>
                      </div>
                      <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                        Update your passwords to maintain security
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500 dark:text-slate-400">No new notifications</p>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 ring-2 ring-blue-400/20">
                  <AvatarImage
                    src={profile?.avatar_url || "/placeholder.svg?height=32&width=32"}
                    alt="User avatar"
                  />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email ?? "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Premium Member
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfileClick}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
