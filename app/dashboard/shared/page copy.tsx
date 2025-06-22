"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Copy, MoreHorizontal, UserPlus, Crown, Shield, Info, Trash2, Share2, ExternalLink, Globe, User, Calendar, Clock, AlertCircle } from "lucide-react"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, formatDistanceToNow } from "date-fns"

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
    setSharedLoading(true)
    fetch(`/api/share-password?shared_by_user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSharedPasswords(data.data);
        } else {
          setSharedPasswords([])
        }
      })
      .finally(() => setSharedLoading(false))
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

  // Filtered shared passwords
  const filteredPasswords = sharedPasswords.filter(entry =>
    entry.password_title?.toLowerCase().includes(filter.toLowerCase()) ||
    entry.password_username?.toLowerCase().includes(filter.toLowerCase()) ||
    entry.shared_with_email?.toLowerCase().includes(filter.toLowerCase())
  )

  // Summary counts
  const activeCount = sharedPasswords.filter(e => !e.expired).length
  const expiredCount = sharedPasswords.filter(e => e.expired).length

  if (loading || sharedLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
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
              <div className="max-w-6xl mx-auto space-y-8">
                {/* Summary Bar & Search */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                  <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">Shared Passwords</h1>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{activeCount} active, {expiredCount} expired</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search passwords..."
                      value={filter}
                      onChange={e => setFilter(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
                <hr className="border-slate-200 dark:border-slate-700" />

                {/* Shared Passwords List */}
                {filteredPasswords.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 opacity-70">
                    <span className="text-6xl mb-4">🔒</span>
                    <h2 className="text-xl font-semibold mb-2">No passwords found</h2>
                    <p className="text-slate-500">Try adjusting your search or filters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {filteredPasswords.map((entry) => {
                      // Mock fields for demo
                      const website = entry.website || "example.com"
                      const sharedBy = entry.shared_by_email || "you@example.com"
                      const sharedByAvatar = sharedBy[0]?.toUpperCase() || "Y"
                      const expiration = entry.expiration || null // e.g. "2024-06-30T23:59:59Z"
                      const expired = expiration ? new Date(expiration) < new Date() : false
                      const status = expired ? "Expired" : "Active"
                      return (
                        <div key={entry.id} className={`relative group transition-shadow duration-200 ${expired ? "opacity-60" : ""}`}>
                          <Card className={`shadow-xl rounded-2xl border-l-4 ${entry.role === "owner" ? "border-purple-400" : entry.role === "editor" ? "border-blue-400" : "border-green-400"} hover:shadow-2xl transition-shadow duration-200 bg-white/90 dark:bg-slate-900/80`}> 
                            <CardHeader className="flex flex-row items-center gap-4 pb-2 bg-gradient-to-r from-slate-100 via-white to-slate-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 rounded-t-2xl">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>{entry.shared_with_email?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <CardTitle className="text-xl flex items-center gap-2">
                                  {entry.password_title}
                                  <Badge className={getRoleColor(entry.role)}>{getRoleIcon(entry.role)} {entry.role}</Badge>
                                  <Badge variant={expired ? "destructive" : "default"} className="ml-2 flex items-center gap-1">{expired ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{status}</Badge>
                                </CardTitle>
                                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                                  <Globe className="w-3 h-3 mr-1" /> {website}
                                  <span className="mx-1">•</span>
                                  <User className="w-3 h-3 mr-1" /> Shared with <span className="font-medium">{entry.shared_with_email}</span>
                                  <span className="mx-1">•</span>
                                  <User className="w-3 h-3 mr-1" /> Shared by <span className="font-medium">{sharedBy}</span>
                                </div>
                                <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                                  <Calendar className="w-3 h-3 mr-1" /> Shared: <span title={entry.shared_at}>{entry.shared_at ? format(new Date(entry.shared_at), "MMM d, yyyy h:mm a") : "-"}</span>
                                  {expiration && <><span className="mx-1">•</span><Clock className="w-3 h-3 mr-1" /> Expires: <span title={expiration}>{format(new Date(expiration), "MMM d, yyyy")}</span></>}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-0">
                              {/* Username Field */}
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-2 font-mono text-sm">
                                  {entry.password_username}
                                </div>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => handleCopy(entry.password_username, "Username")}> 
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Copy Username</TooltipContent>
                                </Tooltip>
                              </div>
                              {/* Password Field */}
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-2 font-mono text-sm">
                                  {showPassword[entry.id] ? entry.password : "••••••••••••"}
                                </div>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => togglePasswordVisibility(entry.id)}>
                                      {showPassword[entry.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{showPassword[entry.id] ? "Hide Password" : "Show Password"}</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => handleCopy(entry.password, "Password")}> 
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Copy Password</TooltipContent>
                                </Tooltip>
                              </div>
                              {/* Optional message */}
                              {entry.message && (
                                <div className="bg-slate-50 dark:bg-slate-800 rounded p-2 text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                                  <span className="font-semibold">Message:</span> {entry.message}
                                </div>
                              )}
                              {/* Actions */}
                              <div className="flex items-center gap-2 mt-2">
                                <Dialog open={detailsOpen === entry.id} onOpenChange={open => setDetailsOpen(open ? entry.id : null)}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="flex items-center gap-1"><Info className="w-4 h-4" /> Details</Button>
                                      </DialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>View Details</TooltipContent>
                                  </Tooltip>
                                  <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                      <DialogTitle>Shared Password Details</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Title:</strong> {entry.password_title}</div>
                                      <div><strong>Username:</strong> {entry.password_username}</div>
                                      <div><strong>Password:</strong> {showPassword[entry.id] ? entry.password : "••••••••••••"}</div>
                                      <div><strong>Website:</strong> {website}</div>
                                      <div><strong>Shared with:</strong> {entry.shared_with_email}</div>
                                      <div><strong>Shared by:</strong> {sharedBy}</div>
                                      <div><strong>Role:</strong> {entry.role}</div>
                                      <div><strong>Status:</strong> {status}</div>
                                      <div><strong>Shared at:</strong> {entry.shared_at ? format(new Date(entry.shared_at), "PPPpp") : "-"}</div>
                                      {expiration && <div><strong>Expires:</strong> {format(new Date(expiration), "PPP")}</div>}
                                      {entry.message && <div><strong>Message:</strong> {entry.message}</div>}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" className="flex items-center gap-1"><Share2 className="w-4 h-4" /> Reshare</Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Reshare Password</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="destructive" size="sm" className="flex items-center gap-1"><Trash2 className="w-4 h-4" /> Remove</Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Remove Access</TooltipContent>
                                </Tooltip>
                              </div>
                            </CardContent>
                          </Card>
                          {/* Accent border hover effect */}
                          <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl transition-all duration-200 ${entry.role === "owner" ? "bg-purple-400" : entry.role === "editor" ? "bg-blue-400" : "bg-green-400"} group-hover:w-2`}></div>
                        </div>
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
