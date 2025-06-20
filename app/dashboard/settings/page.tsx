"use client"

import { useState, useEffect } from "react"
import { Settings, Shield, Bell, Palette, Download, Trash2, Key, Globe, Smartphone, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sidebar } from "../components/sidebar"
import { TopNavigation } from "../components/top-navigation"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

const securitySettings = [
  { id: "autoLock", label: "Auto-lock Vault", description: "Automatically lock vault after inactivity", enabled: true },
  {
    id: "clipboardClear",
    label: "Clear Clipboard",
    description: "Clear clipboard after copying passwords",
    enabled: true,
  },
  {
    id: "passwordHistory",
    label: "Password History",
    description: "Keep history of changed passwords",
    enabled: false,
  },
  {
    id: "secureNotes",
    label: "Secure Notes Encryption",
    description: "Encrypt notes with additional layer",
    enabled: true,
  },
]

const notificationSettings = [
  {
    id: "passwordExpiry",
    label: "Password Expiry Alerts",
    description: "Notify when passwords are about to expire",
    enabled: true,
  },
  { id: "loginAlerts", label: "Login Notifications", description: "Alert on new device logins", enabled: true },
  {
    id: "breachAlerts",
    label: "Data Breach Alerts",
    description: "Notify if passwords found in breaches",
    enabled: true,
  },
  {
    id: "weeklyReports",
    label: "Weekly Security Reports",
    description: "Receive weekly vault health reports",
    enabled: false,
  },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [securityOptions, setSecurityOptions] = useState(securitySettings)
  const [notificationOptions, setNotificationOptions] = useState(notificationSettings)
  const [autoLockTime, setAutoLockTime] = useState([15])
  const [passwordLength, setPasswordLength] = useState([16])
  const [exportFormat, setExportFormat] = useState("json")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUserAndSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from("user_settings")
          .select("*")
          .eq("id", user.id)
          .single()
        if (data) {
          setAutoLockTime([data.auto_lock_time])
          setPasswordLength([data.password_length])
          setSecurityOptions(data.security_options || securitySettings)
          setNotificationOptions(data.notification_options || notificationSettings)
          setTheme(data.theme || "system")
          setExportFormat(data.export_format || "json")
        }
      }
    }
    fetchUserAndSettings()
  }, [])

  const toggleSecuritySetting = (id: string) => {
    const updated = securityOptions.map((setting) =>
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    );
    setSecurityOptions(updated);
    saveSettings({ security_options: updated });
    toast.success("Security setting updated!");
  }

  const toggleNotificationSetting = (id: string) => {
    setNotificationOptions(
      notificationOptions.map((setting) => (setting.id === id ? { ...setting, enabled: !setting.enabled } : setting)),
    )
    toast.success("Notification setting updated!")
  }

  const handleExportData = () => {
    toast.success("Vault data export initiated. You'll receive an email when ready.")
  }

  const handleDeleteAccount = () => {
    toast.error("Account deletion requires additional verification. Check your email.")
  }

  const saveSettings = async (updates: any) => {
    if (!user) return;
    await supabase
      .from("user_settings")
      .upsert({
        id: user.id,
        auto_lock_time: autoLockTime[0],
        password_length: passwordLength[0],
        security_options: securityOptions,
        notification_options: notificationOptions,
        theme,
        export_format: exportFormat,
        ...updates,
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex">
        <Sidebar user={user} />
        <div className="flex-1 flex flex-col">
          <TopNavigation
            user={user}
            profile={null}
            searchQuery={""}
            onSearchChange={() => {}}
            expiredCount={0}
          />

          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Settings</h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Customize your vault experience and security preferences
                  </p>
                </div>
              </div>

              <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5 bg-white/50 dark:bg-slate-800/50">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                  <div className="space-y-6">
                    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Settings className="w-5 h-5 mr-2 text-blue-500" />
                          General Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
                            <Select defaultValue="en">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select defaultValue="utc-5">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                                <SelectItem value="utc-7">Mountain Time (UTC-7)</SelectItem>
                                <SelectItem value="utc-6">Central Time (UTC-6)</SelectItem>
                                <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Auto-lock Timer</Label>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Lock vault after {autoLockTime[0]} minutes of inactivity
                              </p>
                            </div>
                          </div>
                          <Slider
                            value={autoLockTime}
                            onValueChange={setAutoLockTime}
                            max={60}
                            min={5}
                            step={5}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Default Password Length</Label>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Generate passwords with {passwordLength[0]} characters
                              </p>
                            </div>
                          </div>
                          <Slider
                            value={passwordLength}
                            onValueChange={setPasswordLength}
                            max={32}
                            min={8}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="security">
                  <div className="space-y-6">
                    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Shield className="w-5 h-5 mr-2 text-blue-500" />
                          Security Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {securityOptions.map((setting) => (
                          <div
                            key={setting.id}
                            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                          >
                            <div className="flex-1">
                              <Label
                                htmlFor={setting.id}
                                className="text-sm font-medium text-slate-900 dark:text-slate-100"
                              >
                                {setting.label}
                              </Label>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{setting.description}</p>
                            </div>
                            <Switch
                              id={setting.id}
                              checked={setting.enabled}
                              onCheckedChange={() => toggleSecuritySetting(setting.id)}
                            />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Key className="w-5 h-5 mr-2 text-blue-500" />
                          Master Password
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                          Change Master Password
                        </Button>
                        <Button variant="outline" className="w-full">
                          Set Up Emergency Access
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="notifications">
                  <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Bell className="w-5 h-5 mr-2 text-blue-500" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {notificationOptions.map((setting) => (
                        <div
                          key={setting.id}
                          className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                        >
                          <div className="flex-1">
                            <Label
                              htmlFor={setting.id}
                              className="text-sm font-medium text-slate-900 dark:text-slate-100"
                            >
                              {setting.label}
                            </Label>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{setting.description}</p>
                          </div>
                          <Switch
                            id={setting.id}
                            checked={setting.enabled}
                            onCheckedChange={() => toggleNotificationSetting(setting.id)}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="appearance">
                  <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Palette className="w-5 h-5 mr-2 text-blue-500" />
                        Appearance Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <Label>Theme Preference</Label>
                        <RadioGroup value={theme} onValueChange={setTheme}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="light" id="light" />
                            <Label htmlFor="light" className="flex items-center space-x-2">
                              <Monitor className="w-4 h-4" />
                              <span>Light Mode</span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dark" id="dark" />
                            <Label htmlFor="dark" className="flex items-center space-x-2">
                              <Smartphone className="w-4 h-4" />
                              <span>Dark Mode</span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="system" id="system" />
                            <Label htmlFor="system" className="flex items-center space-x-2">
                              <Globe className="w-4 h-4" />
                              <span>System Default</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Accent Color</Label>
                        <div className="flex space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 border-2 border-white shadow-md cursor-pointer"></div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-600 border-2 border-transparent shadow-md cursor-pointer"></div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-600 border-2 border-transparent shadow-md cursor-pointer"></div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-600 border-2 border-transparent shadow-md cursor-pointer"></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Compact Mode</Label>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Show more items in less space</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="advanced">
                  <div className="space-y-6">
                    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Download className="w-5 h-5 mr-2 text-blue-500" />
                          Data Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Export Format</Label>
                          <Select value={exportFormat} onValueChange={setExportFormat}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="json">JSON</SelectItem>
                              <SelectItem value="csv">CSV</SelectItem>
                              <SelectItem value="xml">XML</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={handleExportData}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                        >
                          Export Vault Data
                        </Button>
                        <Button variant="outline" className="w-full">
                          Import Data
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="flex items-center text-red-600 dark:text-red-400">
                          <Trash2 className="w-5 h-5 mr-2" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <h4 className="font-medium text-red-800 dark:text-red-400 mb-2">Delete Account</h4>
                          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                            This action cannot be undone. All your data will be permanently deleted.
                          </p>
                          <Button onClick={handleDeleteAccount} variant="destructive" className="w-full">
                            Delete My Account
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
