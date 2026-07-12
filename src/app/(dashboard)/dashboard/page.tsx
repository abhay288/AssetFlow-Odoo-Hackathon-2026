'use client'

import React, { useState, useEffect } from 'react'
import { DashboardHero } from '@/features/dashboard/components/dashboard-hero'
import { KPICards } from '@/features/dashboard/components/kpi-cards'
import { DashboardCharts } from '@/features/dashboard/components/dashboard-charts'
import { ActivityTimeline } from '@/features/dashboard/components/activity-timeline'
import { QuickActions } from '@/features/dashboard/components/quick-actions'
import { AIInsightsWidget } from '@/features/dashboard/components/ai-insights-widget'
import { DashboardSkeleton } from '@/features/dashboard/components/dashboard-skeleton'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="py-2">
        <DashboardSkeleton />
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-6 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <DashboardHero />
      
      <KPICards />
      
      <DashboardCharts />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <ActivityTimeline />
        </div>
        <div className="lg:col-span-3 space-y-4">
          <QuickActions />
          {/* We can use the AI Widget here as a standalone card alongside Quick Actions */}
          <div className="h-[250px]">
             <AIInsightsWidget />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
