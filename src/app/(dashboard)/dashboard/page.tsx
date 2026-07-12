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
import { createBrowserClient } from '@supabase/ssr'

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 24 } }
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } }
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setIsLoading(false)
          return
        }

        // Fetch profile and role name
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, role:roles(name)')
          .eq('id', user.id)
          .single()

        const role = profile?.role?.name || 'employee'
        const profileName = profile ? `${profile.first_name} ${profile.last_name}` : user.email

        // Fetch employee details
        const { data: employee } = await supabase
          .from('employees')
          .select('*')
          .eq('profile_id', user.id)
          .single()

        const employeeId = employee?.id
        const departmentId = employee?.department_id

        // Fetch managed department if dept head
        let managedDepartmentId = null
        if (role === 'dept_head') {
          const { data: managedDept } = await supabase
            .from('departments')
            .select('id')
            .eq('head_profile_id', user.id)
            .single()
          managedDepartmentId = managedDept?.id || departmentId
        }

        // Query raw tables
        const [
          { data: assets },
          { data: bookings },
          { data: transfers },
          { data: maintenances },
          { data: allocations },
          { data: departments },
          { data: categories },
          { data: notifications },
          { data: employees }
        ] = await Promise.all([
          supabase.from('assets').select('*'),
          supabase.from('bookings').select('*'),
          supabase.from('transfer_requests').select('*'),
          supabase.from('maintenance_requests').select('*'),
          supabase.from('asset_allocations').select('*'),
          supabase.from('departments').select('*'),
          supabase.from('asset_categories').select('*'),
          supabase.from('notifications').select('*').eq('user_id', user.id),
          supabase.from('employees').select('*')
        ])

        setDashboardData({
          role,
          profileName,
          employeeId,
          departmentId,
          managedDepartmentId,
          assets: assets || [],
          bookings: bookings || [],
          transfers: transfers || [],
          maintenances: maintenances || [],
          allocations: allocations || [],
          departments: departments || [],
          categories: categories || [],
          notifications: notifications || [],
          employees: employees || []
        })
      } catch (err) {
        console.error('Error loading dashboard data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [supabase])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!dashboardData) {
    return (
      <div className="flex h-[400px] items-center justify-center text-zinc-500">
        Authentication session not found. Please log in again.
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-10"
    >
      {/* Hero */}
      <motion.div variants={sectionVariants}>
        <DashboardHero data={dashboardData} />
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={sectionVariants}>
        <KPICards data={dashboardData} />
      </motion.div>

      {/* Charts */}
      <motion.div variants={sectionVariants}>
        <DashboardCharts data={dashboardData} />
      </motion.div>

      {/* Bottom row */}
      <motion.div variants={sectionVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <ActivityTimeline />
        </div>
        <div className="lg:col-span-3 flex flex-col gap-6">
          <QuickActions />
          <div className="min-h-[340px]">
            <AIInsightsWidget data={dashboardData} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

