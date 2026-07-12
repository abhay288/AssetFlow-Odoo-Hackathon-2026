'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Package, 
  CheckCircle2, 
  UserCheck, 
  Wrench, 
  CalendarCheck, 
  ArrowRightLeft, 
  Clock, 
  AlertTriangle 
} from 'lucide-react'

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
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
}

const kpis = [
  { title: 'Total Assets', value: '1,248', change: '+12%', trend: 'up', icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  { title: 'Available', value: '342', change: '+5%', trend: 'up', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { title: 'Allocated', value: '784', change: '+18%', trend: 'up', icon: UserCheck, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { title: 'Maintenance', value: '45', change: '-2%', trend: 'down', icon: Wrench, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { title: 'Active Bookings', value: '28', change: '+10%', trend: 'up', icon: CalendarCheck, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  { title: 'Pending Transfers', value: '12', change: '-5%', trend: 'down', icon: ArrowRightLeft, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  { title: 'Upcoming Returns', value: '64', change: '+22%', trend: 'up', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { title: 'Overdue', value: '3', change: '-1', trend: 'down', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
]

export function KPICards() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4 grid-cols-2 lg:grid-cols-4"
    >
      {kpis.map((kpi, i) => (
        <motion.div key={i} variants={itemVariants}>
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm hover:shadow-md transition-shadow duration-200 group">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${kpi.trend === 'up' ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'}`}>
                  {kpi.change}
                </div>
              </div>
              
              <div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-1 group-hover:scale-105 transition-transform origin-left">
                  {kpi.value}
                </p>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {kpi.title}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
