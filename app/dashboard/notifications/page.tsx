"use client"

import { useState } from "react"
import { Bell, AlertTriangle, Shield, Clock, CheckCircle, X, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "../components/sidebar"
import { TopNavigation } from "../components/top-navigation"

const notifications = [
  {
    id: 1,
    type: "security",
    title: "Password Expired",
    message: "Your LinkedIn password is 95 days old and needs to be updated",
    time: "2 hours ago",
    read: false,
    priority: "high",
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
  {
    id: 2,
    type: "security",
    title: "Weak Password Detected",
    message: "Your Instagram password is considered weak. Consider updating it.",
    time: "5 hours ago",
    read: false,
    priority: "medium",
    icon: Shield,
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    id: 3,
    type: "activity",
    title: "New Device Login",
    message: "Someone logged into your vault from a new device in New York",
    time: "1 day ago",
    read: true,
    priority: "high",
    icon: Bell,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    id: 4,
    type: "system",
    title: "Backup Completed",
    message: "Your vault has been successfully backed up to secure cloud storage",
    time: "2 days ago",
    read: true,
    priority: "low",
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    id: 5,
    type: "security",
    title: "Duplicate Password Found",
    message: "You're using the same password for Netflix and Spotify",
    time: "3 days ago",
    read: false,
    priority: "medium",
    icon: AlertTriangle,
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
]

const notificationSettings = [
  {
    id: "security",
    label: "Security Alerts",
    description: "Password expiration, weak passwords, breaches",
    enabled: true,
  },
  { id: "activity", label: "Account Activity", description: "Login attempts, device changes", enabled: true },
  { id: "system", label: "System Updates", description: "Backups, maintenance, updates", enabled: false },
  { id: "sharing", label: "Sharing Notifications", description: "Password shares, access requests", enabled: true },
  { id: "email", label: "Email Notifications", description: "Send notifications to your email", enabled: true },
  { id: "push", label: "Push Notifications", description: "Browser and mobile push notifications", enabled: false },
]

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(notifications)
  const [settings, setSettings] = useState(notificationSettings)
  const [activeTab, setActiveTab] = useState("all")

  const markAsRead = (id: number) => {
    setNotifs(notifs.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifs(notifs.map((notif) => ({ ...notif, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifs(notifs.filter((notif) => notif.id !== id))
  }

  const toggleSetting = (id: string) => {
    setSettings(settings.map((setting) => (setting.id === id ? { ...setting, enabled: !setting.enabled } : setting)))
  }

  const filteredNotifications = notifs.filter((notif) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notif.read
    return notif.type === activeTab
  })

  const unreadCount = notifs.filter((notif) => !notif.read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopNavigation />

          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Notifications</h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Stay updated with your vault security and activity
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {unreadCount > 0 && (
                    <Button onClick={markAllAsRead} variant="outline" size="sm">
                      Mark all as read
                    </Button>
                  )}
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {unreadCount} unread
                  </Badge>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6 bg-white/50 dark:bg-slate-800/50">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="system">System</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="mt-6">
                  <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-blue-500" />
                        Notification Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {settings.map((setting) => (
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
                            onCheckedChange={() => toggleSetting(setting.id)}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                {["all", "unread", "security", "activity", "system"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-6">
                    <div className="space-y-4">
                      {filteredNotifications.length === 0 ? (
                        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-8 text-center">
                          <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                            No notifications
                          </h3>
                          <p className="text-slate-500 dark:text-slate-500">
                            You're all caught up! Check back later for updates.
                          </p>
                        </Card>
                      ) : (
                        filteredNotifications.map((notification) => (
                          <Card
                            key={notification.id}
                            className={`bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-200 hover:shadow-lg ${
                              !notification.read ? "ring-2 ring-blue-200 dark:ring-blue-800" : ""
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-4">
                                <div className={`p-2 rounded-lg ${notification.bgColor}`}>
                                  <notification.icon className={`w-5 h-5 ${notification.color}`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h3
                                      className={`font-medium ${!notification.read ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"}`}
                                    >
                                      {notification.title}
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                      <Badge
                                        variant={
                                          notification.priority === "high"
                                            ? "destructive"
                                            : notification.priority === "medium"
                                              ? "default"
                                              : "secondary"
                                        }
                                        className="text-xs"
                                      >
                                        {notification.priority}
                                      </Badge>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteNotification(notification.id)}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                    {notification.message}
                                  </p>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-500">
                                      <Clock className="w-3 h-3" />
                                      <span>{notification.time}</span>
                                    </div>

                                    {!notification.read && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                      >
                                        Mark as read
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
