"use client"

import { useState, useRef, useEffect } from "react"
import { User, Camera, Save, ArrowLeft, Shield, Mail, Phone, MapPin, Globe, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
// import { updateUserProfile, updateUserAvatar } from "@/app/actions"
import { User as SupabaseUser } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { Sidebar } from "../components/sidebar"
import { TopNavigation } from "../components/top-navigation"
import { Switch } from "@/components/ui/switch"
import { encrypt, decrypt } from "@/lib/utils"

export default function ProfileClient() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    phone: "",
    location: "",
    website: "",
    // avatar_url: "", // if you want to allow editing
  })
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  // Mailer config state
  const [mailerConfig, setMailerConfig] = useState({
    host: "",
    port: 587,
    secure: true,
    email: "",
    password: "",
  });
  const [mailerLoading, setMailerLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      let profileData: any = {}
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        profileData = data || {}
        fetchMailerConfig(user.id);
      }
      setProfile(profileData)
      setFormData({
        full_name: profileData.full_name || "",
        bio: profileData.bio || "",
        phone: profileData.phone || "",
        location: profileData.location || "",
        website: profileData.website || "",
        // avatar_url: profileData.avatar_url || "",
      })
      setLoading(false)
    }
    fetchUser()
  }, [])

  // Fetch mailer config on mount
  const fetchMailerConfig = async (userId: string) => {
    const { data } = await supabase.from("mailer_configuration").select("*").eq('user_id', userId).limit(1).single();
    if (data) {
      setMailerConfig({
        host: data.host || "",
        port: data.port || 587,
        secure: data.secure === true,
        email: data.email || "",
        password: data.password ? decrypt(data.password) : "",
      });
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      // 1. Upload avatar to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/avatar.${fileExt}`
      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // 3. Update profile in 'profiles' table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
      if (updateError) throw updateError

      toast.success('Avatar updated successfully')
      window.location.reload()
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          phone: formData.phone,
          location: formData.location,
          website: formData.website,
          // avatar_url: formData.avatar_url, // if you want to allow editing
        })
        .eq('id', user.id)
      if (error) throw error

      // Optionally update full_name in auth user_metadata
      if (formData.full_name && formData.full_name !== user.user_metadata?.full_name) {
        await supabase.auth.updateUser({
          data: { full_name: formData.full_name }
        })
      }

      toast.success('Profile updated successfully')
      // Refetch profile
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(data)
      setFormData({
        full_name: data.full_name || "",
        bio: data.bio || "",
        phone: data.phone || "",
        location: data.location || "",
        website: data.website || "",
      })
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const getUserInitials = () => {
    const name = formData.full_name || user.email?.split('@')[0] || 'U'
    return name.charAt(0).toUpperCase() + name.slice(1).charAt(0).toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleUpdate = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: formData.full_name }
    })
    setIsLoading(false)
    if (error) toast.error("Failed to update profile")
    else toast.success("Profile updated!")
  }

  const handleSaveMailer = async () => {
    if (!user) {
      toast.error("You must be logged in.");
      return;
    }
    setMailerLoading(true);
    try {
      const { error } = await supabase.from("mailer_configuration").upsert({
        user_id: user.id,
        host: mailerConfig.host,
        port: mailerConfig.port,
        secure: mailerConfig.secure,
        email: mailerConfig.email,
        password: encrypt(mailerConfig.password),
      }, { onConflict: 'user_id' });
      if (error) throw error;
      toast.success("Mailer configuration saved!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save mailer config");
    } finally {
      setMailerLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex h-screen overflow-hidden">
        <div className="fixed left-0 top-0 h-screen z-30">
          <Sidebar user={user} />
        </div>
        <div className="flex-1 flex flex-col ml-64 h-screen">
          <div className="sticky top-0 z-20">
            <TopNavigation
              user={user}
              profile={profile}
              searchQuery={""}
              onSearchChange={() => {}}
              expiredCount={0}
            />
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
              {/* Header */}
              <div className="flex items-center space-x-4 mb-8">
                {/* <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="text-slate-600 dark:text-slate-400"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button> */}
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
                  <p className="text-slate-600 dark:text-slate-400">Manage your account information and preferences</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Overview */}
                <div className="lg:col-span-1">
                  <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                    <CardHeader className="text-center">
                      <div className="relative mx-auto w-32 h-32 mb-4">
                        <Avatar className="w-32 h-32 ring-4 ring-blue-400/20">
                          <AvatarImage src={user.profile?.avatar_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-3xl">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                          onClick={handleAvatarClick}
                          disabled={isUploading}
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                      <CardTitle className="text-xl">{formData.full_name || 'User'}</CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        {user.email}
                      </CardDescription>
                      <Badge className="w-fit mx-auto bg-gradient-to-r from-blue-500 to-purple-600">
                        Premium Member
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                          <Shield className="w-4 h-4" />
                          <span>Account Security</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span>Member since {formatDate(user.profile?.created_at || user.created_at || '')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Profile Form */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="w-5 h-5" />
                        <span>Personal Information</span>
                      </CardTitle>
                      <CardDescription>
                        Update your personal details and contact information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={user.email || ""}
                            disabled
                            className="bg-slate-100 dark:bg-slate-700"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          placeholder="Tell us about yourself..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="Enter your phone number"
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              id="location"
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                              placeholder="Enter your location"
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id="website"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="https://your-website.com"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => router.back()}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          {isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Saving...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Save className="w-4 h-4" />
                              <span>Save Changes</span>
                            </div>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Account Security */}
                  <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="w-5 h-5" />
                        <span>Account Security</span>
                      </CardTitle>
                      <CardDescription>
                        Manage your account security settings and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            Add an extra layer of security to your account
                          </p>
                          <Button variant="outline" size="sm">
                            Enable 2FA
                          </Button>
                        </div>
                        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <h4 className="font-medium mb-2">Password</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            Update your account password
                          </p>
                          <Button variant="outline" size="sm">
                            Change Password
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mailer Configuration */}
                  <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Mail className="w-5 h-5" />
                        <span>Mailer Configuration</span>
                      </CardTitle>
                      <CardDescription>
                        Configure the email and password for sending emails from the app.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="mailer_host">SMTP Host</Label>
                        <Input
                          id="mailer_host"
                          value={mailerConfig.host}
                          onChange={e => setMailerConfig(prev => ({...prev, host: e.target.value}))}
                          placeholder="e.g., smtp.gmail.com"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="mailer_port">SMTP Port</Label>
                          <Input
                            id="mailer_port"
                            type="number"
                            value={mailerConfig.port}
                            onChange={e => setMailerConfig(prev => ({...prev, port: parseInt(e.target.value)}))}
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                          <Switch
                            id="mailer_secure"
                            checked={mailerConfig.secure}
                            onCheckedChange={checked => setMailerConfig(prev => ({...prev, secure: checked}))}
                          />
                           <Label htmlFor="mailer_secure">Use TLS/SSL</Label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mailer_email">Mailer Email</Label>
                        <Input
                          id="mailer_email"
                          type="email"
                          value={mailerConfig.email}
                          onChange={e => setMailerConfig(prev => ({...prev, email: e.target.value}))}
                          placeholder="Enter mailer email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mailer_password">Mailer Password</Label>
                        <Input
                          id="mailer_password"
                          type="password"
                          value={mailerConfig.password}
                          onChange={e => setMailerConfig(prev => ({...prev, password: e.target.value}))}
                          placeholder="Enter mailer password"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={handleSaveMailer}
                          disabled={mailerLoading}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          {mailerLoading ? "Saving..." : "Save Mailer Config"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 