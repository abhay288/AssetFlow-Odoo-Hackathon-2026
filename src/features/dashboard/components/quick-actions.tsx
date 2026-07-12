'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, HandCoins, CalendarPlus, Wrench, ShieldAlert, FileText } from 'lucide-react'

const actions = [
  { id: 1, title: 'Register Asset', icon: PlusCircle, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20' },
  { id: 2, title: 'Allocate Asset', icon: HandCoins, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20' },
  { id: 3, title: 'Book Resource', icon: CalendarPlus, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20' },
  { id: 4, title: 'Maintenance', icon: Wrench, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-900/20' },
  { id: 5, title: 'Start Audit', icon: ShieldAlert, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30', hoverBg: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20' },
  { id: 6, title: 'Generate Report', icon: FileText, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/30', hoverBg: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 24 } }
}

export function QuickActions() {
  return (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-zinc-900 dark:text-zinc-50">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 gap-3"
        >
          {actions.map((action) => (
            <motion.button
              key={action.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm ${action.hoverBg} transition-colors cursor-pointer group`}
            >
              <div className={`p-3 rounded-full ${action.bg} mb-3 group-hover:scale-110 transition-transform duration-200`}>
                <action.icon className={`w-5 h-5 ${action.color}`} />
              </div>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 text-center">
                {action.title}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  )
}
