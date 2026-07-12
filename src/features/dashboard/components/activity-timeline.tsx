'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Laptop, Calendar, Wrench, ShieldCheck, ArrowDownLeft, Info, PenTool } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
}

export function ActivityTimeline() {
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchLogs()
    const channel = supabase.channel('realtime:logs-timeline')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
        setActivities(prev => [payload.new, ...prev].slice(0, 10))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const fetchLogs = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('activity_logs')
      .select('*, profile:profiles(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (data) setActivities(data)
    setIsLoading(false)
  }

  const getIcon = (action: string) => {
    switch (action) {
      case 'created': return PenTool
      case 'status_changed': return Wrench
      case 'allocated': return Laptop
      case 'returned': return ArrowDownLeft
      case 'audit_completed': return ShieldCheck
      case 'booked': return Calendar
      default: return Info
    }
  }

  const getColor = (action: string) => {
    switch (action) {
      case 'created': return { color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' }
      case 'status_changed': return { color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' }
      case 'allocated': return { color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' }
      case 'returned': return { color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' }
      default: return { color: 'text-zinc-500', bg: 'bg-zinc-100 dark:bg-zinc-800' }
    }
  }

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm h-full flex flex-col">
      <CardHeader className="shrink-0">
        <CardTitle className="text-zinc-900 dark:text-zinc-50">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="text-zinc-500 text-sm py-4">Loading activity...</div>
        ) : activities.length === 0 ? (
          <div className="text-zinc-500 text-sm py-4">No recent activity found.</div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative border-l border-zinc-200 dark:border-zinc-800 ml-3 space-y-6"
          >
            {activities.map((activity, index) => {
              const actionType = activity.action_type || activity.action
              const Icon = getIcon(actionType)
              const { color, bg } = getColor(actionType)
              const userName = activity.profile ? `${activity.profile.first_name} ${activity.profile.last_name}` : 'System'

              return (
                <motion.div key={activity.id || index} variants={itemVariants} className="relative pl-6 group">
                  {/* Timeline dot */}
                  <div className={`absolute left-[-1.35rem] p-1.5 rounded-full bg-white dark:bg-zinc-900 border ${color.replace('text-', 'border-')} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-3 h-3 ${color}`} />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
                        {activity.entity_type} {actionType.replace('_', ' ')}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1 max-w-[250px] truncate" title={activity.description}>
                        {activity.description || `Action performed on ${activity.entity_type}`}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {userName}
                        </span>
                        <span className="text-zinc-300 dark:text-zinc-600">•</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {new Date(activity.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className={`text-[10px] font-semibold px-2 py-1 rounded-full w-fit capitalize ${bg} ${color}`}>
                      {actionType.replace('_', ' ')}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
