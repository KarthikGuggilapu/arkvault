"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Copy, MoreHorizontal, UserPlus, Crown, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "../components/sidebar"
import { TopNavigation } from "../components/top-navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function SharedPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showPassword, setShowPassword] = useState<{ [key: number]: boolean }>({})
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareData, setShareData] = useState({
    email: "",
    role: "viewer",
    message: "",
  })
  const [sharedPasswords, setSharedPasswords] = useState<any[]>([])
  const [sharedWithMe, setSharedWithMe] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const expiredCount = 0

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(data || {});
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    // Fetch passwords shared BY the user
    fetch(`/api/shared-passwords?shared_by_user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setSharedPasswords(data.data);
      });

    // Fetch passwords shared WITH the user
    fetch(`/api/shared-passwords?shared_with_email=${user.email}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setSharedWithMe(data.data);
      });
  }, [user]);

  const togglePasswordVisibility = (id: number) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${type} copied to clipboard`)
  }

  const handleShare = () => {
    if (!shareData.email) {
      toast.error("Please enter an email address")
      return
    }
    toast.success("Password shared successfully!")
    setIsShareModalOpen(false)
    setShareData({ email: "", role: "viewer", message: "" })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "editor":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "viewer":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-3 h-3" />
      case "editor":
        return <Shield className="w-3 h-3" />
      case "viewer":
        return <Eye className="w-3 h-3" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    )
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
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Shared Passwords</h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Manage passwords shared with family, friends, and colleagues
                  </p>
                </div>
              </div>

              {/* Shared Passwords List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sharedPasswords.map((entry) => (
                  <Card key={entry.id}>
                    <CardHeader>
                      <CardTitle>{entry.password_title}</CardTitle>
                      <p>{entry.password_username}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Password Field */}
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-2 font-mono text-sm">
                          {showPassword[entry.id] ? entry.password : "••••••••••••"}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => togglePasswordVisibility(entry.id)}>
                          {showPassword[entry.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleCopy(entry.password, "Password")}> 
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      {/* You can add more fields here as needed */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
