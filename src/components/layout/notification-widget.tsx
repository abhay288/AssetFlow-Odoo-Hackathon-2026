'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, Trash2, ShieldAlert, Laptop, Info, PenTool, CheckCircle } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

export function NotificationWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchLogs()
    const channel = supabase.channel('realtime:logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
        const newLog = payload.new
        setNotifications(prev => [newLog, ...prev].slice(0, 10)) // Keep top 10
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('activity_logs')
      .select('*, profile:profiles(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (data) setNotifications(data)
  }

  const unreadCount = notifications.length > 0 ? 3 : 0 // Mock unread count based on recent logs

  const clearAll = () => setNotifications([])

  const getIcon = (action: string) => {
    switch (action) {
      case 'created': return <PenTool className="w-4 h-4 text-emerald-500" />
      case 'status_changed': return <ShieldAlert className="w-4 h-4 text-amber-500" />
      case 'allocated': return <Laptop className="w-4 h-4 text-blue-500" />
      default: return <Info className="w-4 h-4 text-zinc-500" />
    }
  }

  const getBg = (action: string) => {
    switch (action) {
      case 'created': return 'bg-emerald-100 dark:bg-emerald-900/30'
      case 'status_changed': return 'bg-amber-100 dark:bg-amber-900/30'
      case 'allocated': return 'bg-blue-100 dark:bg-blue-900/30'
      default: return 'bg-zinc-100 dark:bg-zinc-800'
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <Bell className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={clearAll} className="p-1.5 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Clear all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 flex flex-col items-center">
                  <Bell className="w-8 h-8 mb-3 opacity-20" />
                  <p className="text-sm">No new activity</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {notifications.map((notif, index) => (
                    <div 
                      key={notif.id || index} 
                      className={`p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer flex gap-3 ${index < 3 ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                    >
                      <div className={`p-2 rounded-full h-fit shrink-0 ${getBg(notif.action_type || notif.action)}`}>
                        {getIcon(notif.action_type || notif.action)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`text-sm font-medium ${index < 3 ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'} capitalize`}>
                            {notif.entity_type} {notif.action_type || notif.action}
                          </h4>
                          <span className="text-xs text-zinc-400 whitespace-nowrap">
                            {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          {notif.description || `Activity on ${notif.entity_type}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 text-center bg-zinc-50 dark:bg-zinc-900/50">
                <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                  View full activity log
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
