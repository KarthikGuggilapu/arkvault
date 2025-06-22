"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Copy, UserPlus, Crown, Shield, Info, Clock, AlertCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Sidebar } from "../components/sidebar"
import { TopNavigation } from "../components/top-navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"

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
  const [detailsOpen, setDetailsOpen] = useState<number | null>(null)
  const [filter, setFilter] = useState("")
  const [sharedLoading, setSharedLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (!user) return
    const fetchProfile = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(data || {})
    }
    fetchProfile()
  }, [user])

  useEffect(() => {
    if (!user) return
    setSharedLoading(true)
    fetch(`/api/share-password?shared_by_user_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSharedPasswords(data.data)
        } else {
          setSharedPasswords([])
        }
      })
      .finally(() => setSharedLoading(false))
  }, [user])

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
        return "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 dark:from-purple-900/30 dark:to-purple-800/30 dark:text-purple-300 border-purple-200 dark:border-purple-700"
      case "editor":
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-300 border-blue-200 dark:border-blue-700"
      case "viewer":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-300 border-green-200 dark:border-green-700"
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-900/30 dark:to-gray-800/30 dark:text-gray-300 border-gray-200 dark:border-gray-700"
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

  // Filtered shared passwords
  const filteredPasswords = sharedPasswords.filter(
    (entry) =>
      entry.password_title?.toLowerCase().includes(filter.toLowerCase()) ||
      entry.password_username?.toLowerCase().includes(filter.toLowerCase()) ||
      entry.shared_with_email?.toLowerCase().includes(filter.toLowerCase()),
  )

  // Summary counts
  const activeCount = sharedPasswords.filter((e) => !e.expired).length
  const expiredCount = sharedPasswords.filter((e) => e.expired).length

  if (loading || sharedLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 absolute top-0 left-0"></div>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
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
                {/* Header Section */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Shared Passwords</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                      Manage passwords shared with your team, family, and trusted contacts
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {sharedPasswords.length}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Total Shared</div>
                    </div>
                  </div>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search shared passwords..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-10 bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  />
                </div>

                {/* Shared Passwords Grid */}
                {filteredPasswords.length === 0 ? (
                  <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        No shared passwords found
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400">
                        {filter ? "Try adjusting your search terms" : "Start sharing passwords with your team"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPasswords.map((entry) => {
                      const website = entry.website || "example.com"
                      const sharedBy = entry.shared_by_email || "you@example.com"
                      const expiration = entry.expiration || null
                      const expired = expiration ? new Date(expiration) < new Date() : false
                      const status = expired ? "Expired" : "Active"

                      return (
                        <Card
                          key={entry.id}
                          className={`group hover:shadow-lg transition-all duration-200 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 ${expired ? "opacity-75" : ""}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                                    {entry.password_title}
                                  </h3>
                                  <Badge className={`${getRoleColor(entry.role)} text-xs`}>
                                    {getRoleIcon(entry.role)}
                                    <span className="ml-1 capitalize">{entry.role}</span>
                                  </Badge>
                                  {expired && <AlertCircle className="w-4 h-4 text-amber-500" />}
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{entry.password_username}</p>
                                <div className="flex items-center text-xs text-slate-400 dark:text-slate-500 mt-1 space-x-2">
                                  <span>Shared with: {entry.shared_with_email}</span>
                                </div>
                              </div>
                              <Badge variant={expired ? "destructive" : "default"} className="text-xs">
                                {status}
                              </Badge>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-2 font-mono text-sm">
                                  {showPassword[entry.id] ? entry.password : "••••••••••••"}
                                </div>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => togglePasswordVisibility(entry.id)}
                                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                    >
                                      {showPassword[entry.id] ? (
                                        <EyeOff className="w-4 h-4" />
                                      ) : (
                                        <Eye className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {showPassword[entry.id] ? "Hide Password" : "Show Password"}
                                  </TooltipContent>
                                </Tooltip>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  Shared {entry.shared_at ? format(new Date(entry.shared_at), "MMM d, yyyy") : "-"}
                                  {expiration && (
                                    <span className="ml-2">
                                      • Expires {format(new Date(expiration), "MMM d, yyyy")}
                                    </span>
                                  )}
                                </span>

                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCopy(entry.password, "Password")}
                                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                      >
                                        <Copy className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Copy Password</TooltipContent>
                                  </Tooltip>
                                  <Dialog
                                    open={detailsOpen === entry.id}
                                    onOpenChange={(open) => setDetailsOpen(open ? entry.id : null)}
                                  >
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                          >
                                            <Info className="w-4 h-4" />
                                          </Button>
                                        </DialogTrigger>
                                      </TooltipTrigger>
                                      <TooltipContent>View Details</TooltipContent>
                                    </Tooltip>
                                    <DialogContent className="max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
                                      <DialogHeader>
                                        <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                          {entry.password_title} - Details
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4 mt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                              Username
                                            </Label>
                                            <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-800 rounded text-slate-900 dark:text-slate-100 font-mono text-sm">
                                              {entry.password_username}
                                            </div>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                              Website
                                            </Label>
                                            <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-800 rounded text-slate-900 dark:text-slate-100 text-sm">
                                              {website}
                                            </div>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                              Shared With
                                            </Label>
                                            <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-800 rounded text-slate-900 dark:text-slate-100 font-mono text-sm">
                                              {entry.shared_with_email}
                                            </div>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                              Role
                                            </Label>
                                            <div className="mt-1">
                                              <Badge className={`${getRoleColor(entry.role)}`}>
                                                {getRoleIcon(entry.role)}
                                                <span className="ml-1 capitalize">{entry.role}</span>
                                              </Badge>
                                            </div>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                              Shared Date
                                            </Label>
                                            <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-800 rounded text-slate-900 dark:text-slate-100 text-sm">
                                              {entry.shared_at ? format(new Date(entry.shared_at), "PPP") : "-"}
                                            </div>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                              Status
                                            </Label>
                                            <div className="mt-1">
                                              <Badge variant={expired ? "destructive" : "default"}>
                                                {expired ? (
                                                  <AlertCircle className="w-3 h-3 mr-1" />
                                                ) : (
                                                  <Clock className="w-3 h-3 mr-1" />
                                                )}
                                                {status}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                        {entry.message && (
                                          <div>
                                            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                              Message
                                            </Label>
                                            <div className="mt-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-900 dark:text-blue-100 text-sm border border-blue-200 dark:border-blue-800">
                                              {entry.message}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
