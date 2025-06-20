"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Plus, Shield, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sidebar } from "./components/sidebar"
import { PasswordCard } from "./components/password-card"
import { AddPasswordModal } from "./components/add-password-modal"
import { ActivityTimeline } from "./components/activity-timeline"
import { TopNavigation } from "./components/top-navigation"
import { User } from "@supabase/supabase-js"
import { toast } from 'sonner'

type PasswordEntry = {
  id: string
  title: string
  username: string
  password: string
  url?: string
  category?: string
  notes?: string
  isExpired?: boolean
  lastUpdated?: string
  updated_at: string
  is_expired: boolean
  // ...other fields
};

export default function DashboardClient() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [passwordEntries, setPasswordEntries] = useState<PasswordEntry[]>([])
  const [editEntry, setEditEntry] = useState<PasswordEntry | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  const categories = ["All", "Personal", "Work", "Banking", "Entertainment", "Social"]

  useEffect(() => {
    // Check for user session
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      if (!user) {
        router.push('/')
      }
    }

    getUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        router.push('/')
      } else if (session?.user) {
        setUser(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user, loading, router])

  // Fetch passwords for the user
  useEffect(() => {
    const fetchPasswords = async () => {
      const { data, error } = await supabase
        .from('passwords')
        .select('*')
        .order('updated_at', { ascending: false })
      if (error) {
        toast.error('Failed to fetch passwords')
      } else {
        setPasswordEntries(
          data.map((entry) => ({
            ...entry,
            isExpired: entry.is_expired ?? false,
            lastUpdated: entry.last_updated ?? "",
            updated_at: entry.updated_at,
            is_expired: entry.is_expired,
          }))
        )
      }
      setLoading(false)
    }

    if (user) fetchPasswords()
  }, [user])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(data || {});
    };
    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Error logging out')
    }
  }

  const filteredPasswords = passwordEntries.filter((entry) => {
    const matchesCategory = selectedCategory === "All" || entry.category === selectedCategory
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.username.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const expiredCount = passwordEntries.filter((entry) => entry.isExpired).length

  // Get user's first name from email
  const getUserName = () => {
    if (!user?.email) return "User"
    const name = user.email.split('@')[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex">
        <Sidebar user={user} />

        <div className="flex-1 flex flex-col">
          <TopNavigation
            user={user}
            profile={profile}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            expiredCount={expiredCount}
          />

          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold mb-2">Welcome back, {getUserName()}!</h1>
                      <p className="text-blue-100">You have {passwordEntries.length} passwords secured in your vault</p>
                    </div>
                    <Shield className="w-16 h-16 text-white/20" />
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={
                        selectedCategory === category
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                          : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400"
                      }
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Password Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPasswords.map((entry) => (
                    <PasswordCard
                      key={entry.id}
                      entry={{
                        ...entry,
                        category: entry.category ?? "",
                        url: entry.url ?? "",
                      }}
                      user={user}
                      onEdit={(entry) => {
                        setEditEntry(entry);
                        setIsEditModalOpen(true);
                      }}
                      onDelete={async (id) => {
                        if (confirm("Are you sure you want to delete this password?")) {
                          const { error } = await supabase.from('passwords').delete().eq('id', id);
                          if (!error) setPasswordEntries(prev => prev.filter(e => e.id !== id));
                          else toast.error("Failed to delete password");
                        }
                      }}
                    />
                  ))}
                </div>

                {filteredPasswords.length === 0 && (
                  <Card className="p-8 text-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                    <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">No passwords found</h3>
                    <p className="text-slate-500 dark:text-slate-500">Try adjusting your search or category filter</p>
                  </Card>
                )}
              </div>

              {/* Activity Timeline */}
              <div className="lg:col-span-1">
                <ActivityTimeline />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddPasswordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPasswordAdded={async (newPassword) => {
          setPasswordEntries(prev => [newPassword, ...prev])
          await supabase.from('user_activity').insert([{
            user_id: user.id,
            activity_type: 'password_created',
            title: 'Password Created',
            description: `Added password for ${newPassword.title}`,
            icon: 'Plus',
            color: 'text-green-500',
            created_at: new Date().toISOString(),
          }])
        }}
      />

      {/* Floating Add Button */}
      <Button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Plus className="w-6 h-6" />
      </Button>

    
    </div>
  )
} 