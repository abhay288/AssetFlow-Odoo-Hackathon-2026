'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, ArrowRight, Lightbulb, AlertTriangle, TrendingUp } from 'lucide-react'

const insights = [
  {
    id: 1,
    type: 'trend',
    text: 'Maintenance requests increased 18% this week. Consider a preventative check on IT equipment.',
    icon: TrendingUp,
    color: 'text-indigo-500'
  },
  {
    id: 2,
    type: 'info',
    text: 'Department IT has the highest utilization rate (94%) across all branches.',
    icon: Lightbulb,
    color: 'text-emerald-500'
  },
  {
    id: 3,
    type: 'alert',
    text: '3 assets are overdue for return from the Marketing department.',
    icon: AlertTriangle,
    color: 'text-red-500'
  }
]

export function AIInsightsWidget() {
  return (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-linear-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-zinc-900/50 shadow-sm relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
        <Sparkles className="w-32 h-32" />
      </div>
      
      <CardContent className="p-6 relative z-10 flex flex-col h-full">
        <div className="flex items-center space-x-2 mb-6">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg shadow-sm border border-indigo-200/50 dark:border-indigo-800/50">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">AI Insights</h3>
        </div>
        
        <div className="space-y-4 flex-1">
          {insights.map((insight, idx) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className="group flex gap-3 p-3 rounded-xl hover:bg-white/60 dark:hover:bg-zinc-800/40 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800/50 cursor-pointer"
            >
              <div className={`mt-0.5 ${insight.color}`}>
                <insight.icon className="w-4 h-4" />
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed flex-1">
                {insight.text}
              </p>
              <ArrowRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity self-center" />
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors">
            Generate new report <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
