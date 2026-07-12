'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Laptop, Calendar, Wrench, ShieldCheck, ArrowDownLeft, Info, PenTool, Clock } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
}

function getTimeGroup(dateStr: string): 'Today' | 'Yesterday' | 'Last Week' | 'Older' {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = diff / (1000 * 60 * 60 * 24)

  if (days < 1 && date.getDate() === now.getDate()) return 'Today'
  if (days < 2) return 'Yesterday'
  if (days < 8) return 'Last Week'
  return 'Older'
}

function getIcon(action: string) {
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

function getColor(action: string) {
  switch (action) {
    case 'created': return { dot: '#10b981', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-400/30' }
    case 'status_changed': return { dot: '#f59e0b', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', ring: 'ring-amber-400/30' }
    case 'allocated': return { dot: '#3b82f6', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', ring: 'ring-blue-400/30' }
    case 'returned': return { dot: '#6366f1', badge: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300', ring: 'ring-indigo-400/30' }
    case 'audit_completed': return { dot: '#8b5cf6', badge: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300', ring: 'ring-violet-400/30' }
    case 'booked': return { dot: '#06b6d4', badge: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300', ring: 'ring-cyan-400/30' }
    default: return { dot: '#94a3b8', badge: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400', ring: 'ring-zinc-400/20' }
  }
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const groupOrder: Record<string, number> = { Today: 0, Yesterday: 1, 'Last Week': 2, Older: 3 }

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
        setActivities(prev => [payload.new, ...prev].slice(0, 15))
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
      .limit(15)
    if (data) setActivities(data)
    setIsLoading(false)
  }

  // Group activities
  const grouped: Record<string, any[]> = {}
  activities.forEach(a => {
    const group = getTimeGroup(a.created_at)
    if (!grouped[group]) grouped[group] = []
    grouped[group].push(a)
  })
  const sortedGroups = Object.keys(grouped).sort((a, b) => groupOrder[a] - groupOrder[b])

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <Clock className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          </div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">Recent Activity</h2>
        </div>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">{activities.length} events</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full animate-shimmer shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded-full animate-shimmer w-1/2" />
                  <div className="h-2.5 rounded-full animate-shimmer w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-zinc-400 dark:text-zinc-500">
            <Clock className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
            {sortedGroups.map((group) => (
              <div key={group}>
                {/* Group label */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{group}</span>
                  <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                </div>

                {/* Events in group */}
                <div className="relative border-l-2 border-zinc-100 dark:border-zinc-800 ml-3 space-y-5">
                  {grouped[group].map((activity: any, index: number) => {
                    const actionType = activity.action_type || activity.action
                    const Icon = getIcon(actionType)
                    const { dot, badge, ring } = getColor(actionType)
                    const userName = activity.profile
                      ? `${activity.profile.first_name} ${activity.profile.last_name}`
                      : 'System'
                    const isFirst = group === 'Today' && index === 0

                    return (
                      <motion.div key={activity.id || index} variants={itemVariants} className="relative pl-6 group">
                        {/* Dot */}
                        <div className="absolute left-[-0.85rem] flex items-center justify-center">
                          {isFirst ? (
                            <div className="relative flex h-4 w-4 items-center justify-center">
                              <span
                                className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ring-2 ${ring}`}
                                style={{ backgroundColor: dot }}
                              />
                              <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white dark:border-zinc-900" style={{ backgroundColor: dot }} />
                            </div>
                          ) : (
                            <div
                              className="h-3 w-3 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm"
                              style={{ backgroundColor: dot }}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex items-start justify-between gap-3 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/40 rounded-xl px-3 py-2 -mx-3 transition-colors duration-150 cursor-default">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 capitalize truncate">
                                {(activity.entity_type || 'Asset')} {actionType?.replace(/_/g, ' ')}
                              </h4>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize whitespace-nowrap ${badge}`}>
                                {actionType?.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate" title={activity.description}>
                              {activity.description || `Action on ${activity.entity_type}`}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{userName}</span>
                              <span className="text-zinc-300 dark:text-zinc-600">·</span>
                              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{formatRelativeTime(activity.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
