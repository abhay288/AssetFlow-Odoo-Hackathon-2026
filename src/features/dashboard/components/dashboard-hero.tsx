'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, TrendingUp, Users, Activity } from 'lucide-react'

export function DashboardHero() {
  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid gap-4 md:grid-cols-3"
    >
      <Card className="md:col-span-2 overflow-hidden border-zinc-200 dark:border-zinc-800 bg-linear-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/50 shadow-sm relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48" />
        </div>
        <CardContent className="p-8 relative z-10 flex flex-col justify-between h-full">
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{currentDate}</p>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
              Welcome back, Admin
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-[600px]">
              Here is what's happening with your organization's assets today. Everything is running smoothly.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Assets</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">1,248</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Utilization</p>
              <div className="flex items-center space-x-1">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">84%</p>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active Users</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">342</p>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Health Score</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-emerald-500">92/100</p>
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm flex flex-col">
        <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">AI Insight of the Day</h3>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 flex-1">
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              Based on recent trends, <strong className="text-zinc-900 dark:text-zinc-100">IT Equipment</strong> utilization is up by 15% this month. Consider auditing the current inventory in the Engineering department as they have the highest pending requests.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
