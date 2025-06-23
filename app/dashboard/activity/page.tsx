"use client"

import { useState, useEffect } from "react"
import { Shield, Eye, Plus, Share, AlertTriangle, Download, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "../components/sidebar"
import { TopNavigation } from "../components/top-navigation"
import { supabase } from "@/lib/supabase"
import React from "react"

export default function ActivityPage() {
  const [filterType, setFilterType] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  const iconMap = { Plus, Eye, Share, AlertTriangle, Shield }

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setActivities([])
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from("user_activity")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      setActivities(data || [])
      setUser(user)
      setLoading(false)
    }
    fetchActivities()
  }, [])

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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "password_created":
      case "vault_backup":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "password_viewed":
      case "password_updated":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "password_shared":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "login_attempt":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const filteredActivities = activities.filter((activity) => {
    const matchesType = filterType === "all" || activity.type === filterType
    const matchesSearch =
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const securityEvents = activities.filter((activity) => activity.severity || activity.type === "login_attempt" /* add more types as needed */);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar: fixed */}
        <div className="fixed left-0 top-0 h-screen z-30">
          <Sidebar user={user} />
        </div>
        {/* Main Content Wrapper: margin-left for sidebar width */}
        <div className="flex-1 flex flex-col ml-64 h-screen">
          {/* TopNavigation: sticky */}
          <div className="sticky top-0 z-20">
            <TopNavigation
              user={user}
              profile={profile}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              expiredCount={0}
            />
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Activity Log</h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Monitor all activities and security events in your vault
                  </p>
                </div>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export Log</span>
                </Button>
              </div>

              {/* Filters */}
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-64">
                      <Input
                        placeholder="Search activities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-700"
                      />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-48 bg-slate-50 dark:bg-slate-700">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Activities</SelectItem>
                        <SelectItem value="password_created">Password Created</SelectItem>
                        <SelectItem value="password_viewed">Password Viewed</SelectItem>
                        <SelectItem value="password_shared">Password Shared</SelectItem>
                        <SelectItem value="login_attempt">Login Attempts</SelectItem>
                        <SelectItem value="vault_backup">Vault Backups</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Date Range</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="all-activity" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-slate-800/50">
                  <TabsTrigger value="all-activity">All Activity</TabsTrigger>
                  <TabsTrigger value="security-events">Security Events</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="all-activity">
                  <div className="space-y-4">
                    {filteredActivities.map((activity) => (
                      <Card
                        key={activity.id}
                        className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-lg transition-all duration-200"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                              {iconMap[activity.icon as keyof typeof iconMap] ? (
                                React.createElement(iconMap[activity.icon as keyof typeof iconMap], { className: `w-5 h-5 ${activity.color}` })
                              ) : (
                                <Shield className={`w-5 h-5 ${activity.color}`} />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium text-slate-900 dark:text-slate-100">{activity.title}</h3>
                                <Badge className={getActivityTypeColor(activity.type)}>
                                  {activity.type ? activity.type.replace("_", " ") : "Unknown"}
                                </Badge>
                              </div>

                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{activity.description}</p>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-500 dark:text-slate-500">
                                <div>
                                  <span className="font-medium">Time:</span>
                                  <br />
                                  {formatTimestamp(activity.timestamp)}
                                </div>
                                <div>
                                  <span className="font-medium">Device:</span>
                                  <br />
                                  {activity.device}
                                </div>
                                <div>
                                  <span className="font-medium">Location:</span>
                                  <br />
                                  {activity.location}
                                </div>
                                <div>
                                  <span className="font-medium">IP Address:</span>
                                  <br />
                                  {activity.ip}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="security-events">
                  <div className="space-y-4">
                    {securityEvents.map((event) => (
                      <Card
                        key={event.id}
                        className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-lg transition-all duration-200"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{event.title}</h3>
                                  <Badge className={getSeverityColor(event.severity)}>{event.severity}</Badge>
                                  {event.resolved && (
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                      Resolved
                                    </Badge>
                                  )}
                                </div>

                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{event.description}</p>

                                <p className="text-xs text-slate-500 dark:text-slate-500">
                                  {formatTimestamp(event.timestamp)}
                                </p>
                              </div>
                            </div>

                            {!event.resolved && (
                              <Button size="sm" variant="outline">
                                Resolve
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="analytics">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Daily Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">24</div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Actions performed today</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Most Active Device</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">MacBook Pro</div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">67% of all activities</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Security Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">92%</div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Excellent security rating</p>
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
