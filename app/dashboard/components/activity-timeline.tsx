"use client"

import { Shield, Plus, Eye, Share, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Activity = {
  id: string
  title: string
  time: string
  color?: string
  icon?: any
  // add other fields as needed
};

const iconMap = { Plus, Eye, Share, AlertTriangle, Shield }

export function ActivityTimeline() {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      if (!error && data) {
        setActivities(
          data.map((activity) => ({
            ...activity,
            icon: iconMap[activity.icon as keyof typeof iconMap] || Shield,
            time: new Date(activity.created_at).toLocaleString(),
          }))
        )
      }
    }
    fetchActivities()
  }, [])

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`p-2 rounded-full bg-slate-100 dark:bg-slate-700 ${activity.color}`}>
              <activity.icon className="w-3 h-3" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{activity.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
            </div>
            {index < activities.length - 1 && (
              <div className="absolute left-6 mt-8 w-px h-6 bg-slate-200 dark:bg-slate-600" />
            )}
          </div>
        ))}

        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Security Score</span>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Excellent</Badge>
          </div>
          <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
              style={{ width: "92%" }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">92% - Keep up the great work!</p>
        </div>
      </CardContent>
    </Card>
  )
}
