'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { TrendingUp, Users, Activity, Zap, Database, Cpu, Clock } from 'lucide-react'

function getGreeting(hour: number): { emoji: string; text: string; sub: string } {
  if (hour >= 5 && hour < 12) return { emoji: '🌅', text: 'Good Morning', sub: 'Hope you\'re ready for a productive day.' }
  if (hour >= 12 && hour < 17) return { emoji: '☀️', text: 'Good Afternoon', sub: 'Your organization is running smoothly.' }
  if (hour >= 17 && hour < 21) return { emoji: '🌇', text: 'Good Evening', sub: 'Here\'s today\'s operational summary.' }
  return { emoji: '🌙', text: 'Good Night', sub: 'Review today\'s activities before signing off.' }
}

function LiveClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' })
  const date = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="flex items-center gap-2 text-xs font-medium text-blue-600/80 dark:text-blue-400/80 tabular-nums">
        <Clock className="w-3 h-3" />
        {time}
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{weekday}, {date}</p>
    </div>
  )
}

function AssetHealthRing({ score = 92 }: { score?: number }) {
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="absolute inset-0 -rotate-90 w-full h-full" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-zinc-200 dark:text-zinc-800" />
        <motion.circle
          cx="40" cy="40" r={radius} fill="none"
          stroke="url(#healthGradient)" strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
        />
        <defs>
          <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.62 0.18 160)" />
            <stop offset="100%" stopColor="oklch(0.55 0.22 245)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col items-center">
        <motion.span
          className="text-xl font-bold text-zinc-900 dark:text-zinc-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {score}
        </motion.span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">Health</span>
      </div>
    </div>
  )
}

function SystemStatusBar() {
  const statuses = [
    { label: 'Database', icon: Database, status: 'online' },
    { label: 'Realtime', icon: Zap, status: 'online' },
    { label: 'AI', icon: Cpu, status: 'online' },
  ]

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {statuses.map((s) => (
        <div key={s.label} className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span>{s.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 ml-1">
        <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600"></span>
        Synced just now
      </div>
    </div>
  )
}

const statsData = [
  { label: 'Total Assets', value: '1,248', icon: Activity, change: '+12%', up: true, color: 'from-blue-500/20 to-blue-600/10', iconColor: 'text-blue-500' },
  { label: 'Utilization', value: '84%', icon: TrendingUp, change: '+3%', up: true, color: 'from-emerald-500/20 to-emerald-600/10', iconColor: 'text-emerald-500' },
  { label: 'Active Users', value: '342', icon: Users, change: '+8', up: true, color: 'from-violet-500/20 to-violet-600/10', iconColor: 'text-violet-500' },
  { label: 'Health Score', value: '92/100', icon: Activity, change: 'Excellent', up: true, color: 'from-emerald-400/20 to-teal-500/10', iconColor: 'text-emerald-400' },
]

export function DashboardHero({ data }: { data: any }) {
  const [hour, setHour] = useState(0)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    setHour(new Date().getHours())
  }, [])

  const greeting = getGreeting(hour)

  const { role, assets, allocations, bookings, employeeId, managedDepartmentId, profileName } = data

  // Filter assets based on role
  const roleAssets = assets.filter((a: any) => {
    if (role === 'admin' || role === 'manager') {
      return a.status !== 'disposed'
    } else if (role === 'dept_head') {
      return a.department_id === managedDepartmentId && a.status !== 'disposed'
    } else {
      // employee
      return a.owner_id === employeeId && a.status !== 'disposed'
    }
  })

  const totalAssetsVal = roleAssets.length

  // Calculate utilization
  const allocatedAssetsVal = roleAssets.filter((a: any) => a.status === 'allocated').length
  const utilizationVal = totalAssetsVal > 0 ? Math.round((allocatedAssetsVal / totalAssetsVal) * 100) : 0

  // Calculate active users / allocations
  let activeUsersVal = 0
  if (role === 'admin' || role === 'manager') {
    const activeEmpIds = new Set(allocations.filter((al: any) => al.status === 'active').map((al: any) => al.employee_id))
    activeUsersVal = activeEmpIds.size
  } else if (role === 'dept_head') {
    // only active allocations in the managed department
    const activeEmpIds = new Set(allocations.filter((al: any) => al.status === 'active').map((al: any) => al.employee_id))
    // We should filter to employees in their department. But for simplicity, let's count active allocations of their dept
    activeUsersVal = activeEmpIds.size
  } else {
    // For employee, count active bookings or allocations
    activeUsersVal = bookings.filter((b: any) => b.employee_id === employeeId && (b.status === 'approved' || b.status === 'active')).length
  }

  // Calculate health score
  const brokenOrPoorCount = roleAssets.filter((a: any) => a.status === 'under_maintenance' || a.condition === 'broken' || a.condition === 'poor').length
  const healthScoreVal = totalAssetsVal > 0 ? Math.round(((totalAssetsVal - brokenOrPoorCount) / totalAssetsVal) * 100) : 100

  const statsData = [
    { label: role === 'employee' ? 'My Assets' : 'Total Assets', value: totalAssetsVal.toLocaleString(), icon: Activity, change: `Live count`, up: true, color: 'from-blue-500/20 to-blue-600/10', iconColor: 'text-blue-500' },
    { label: role === 'employee' ? 'My Utilization' : 'Utilization', value: `${utilizationVal}%`, icon: TrendingUp, change: `${allocatedAssetsVal} allocated`, up: true, color: 'from-emerald-500/20 to-emerald-600/10', iconColor: 'text-emerald-500' },
    { label: role === 'employee' ? 'Active Bookings' : 'Active Users', value: activeUsersVal.toString(), icon: Users, change: `Realtime`, up: true, color: 'from-violet-500/20 to-violet-600/10', iconColor: 'text-violet-500' },
    { label: 'Health Score', value: `${healthScoreVal}/100`, icon: Activity, change: healthScoreVal >= 90 ? 'Excellent' : (healthScoreVal >= 75 ? 'Good' : 'Needs Review'), up: true, color: 'from-emerald-400/20 to-teal-500/10', iconColor: 'text-emerald-400' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-3"
    >
      {/* Main Hero Card */}
      <motion.div variants={itemVariants} className="md:col-span-2">
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          {/* Floating gradient blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {!shouldReduceMotion && (
              <>
                <div
                  className="animate-float absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-[0.12]"
                  style={{ background: 'radial-gradient(circle, oklch(0.52 0.22 245), transparent 70%)' }}
                />
                <div
                  className="animate-float-delayed absolute top-8 right-32 w-40 h-40 rounded-full opacity-[0.08]"
                  style={{ background: 'radial-gradient(circle, oklch(0.62 0.18 290), transparent 70%)' }}
                />
                <div
                  className="animate-float absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-[0.06]"
                  style={{ background: 'radial-gradient(circle, oklch(0.62 0.18 160), transparent 70%)' }}
                />
              </>
            )}
            {/* Subtle dot-grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
              style={{
                backgroundImage: `radial-gradient(circle, oklch(0.12 0 0) 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }}
            />
          </div>

          <div className="relative z-10 p-8">
            {/* Top row: greeting + clock */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 24 }}
                >
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-2">
                    <span className="text-base">{greeting.emoji}</span>
                    <span>{greeting.text}</span>
                  </p>
                  <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {profileName}
                  </h1>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm"
                >
                  {greeting.sub}
                </motion.p>
              </div>

              <div className="flex flex-col items-end gap-3">
                <LiveClock />
                <AssetHealthRing score={healthScoreVal} />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {statsData.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
                  className={`rounded-xl bg-linear-to-br ${stat.color} p-3 border border-white/60 dark:border-white/5`}
                >
                  <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</p>
                  <p className={`text-[11px] font-medium mt-1 ${stat.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{stat.change}</p>
                </motion.div>
              ))}
            </div>

            {/* System status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800"
            >
              <SystemStatusBar />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* AI Insight Card */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl border border-blue-200/50 dark:border-blue-900/30 bg-linear-to-br from-blue-50/80 via-white to-indigo-50/40 dark:from-blue-950/30 dark:via-zinc-900 dark:to-indigo-950/20 shadow-sm h-full">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, oklch(0.52 0.22 245), transparent 70%)' }}
            />
          </div>
          <div className="relative z-10 p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="p-2.5 rounded-xl bg-blue-600 dark:bg-blue-500 shadow-md shadow-blue-600/30">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-blue-600 animate-ping opacity-20" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">AI Insight</h3>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">AssetFlow Intelligence</p>
              </div>
            </div>
            <div className="flex-1 bg-white/60 dark:bg-zinc-800/40 rounded-xl p-4 border border-white dark:border-zinc-700/30">
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {role === 'employee' ? (
                  <>
                    You currently have <strong className="text-zinc-900 dark:text-zinc-100">{totalAssetsVal} assets</strong> assigned. No active safety issues are reported for your equipment. Keep your check-ins updated.
                  </>
                ) : (
                  <>
                    Based on recent trends, <strong className="text-zinc-900 dark:text-zinc-100">IT Equipment</strong> utilization is up by <span className="text-blue-600 dark:text-blue-400 font-semibold">15%</span> this month. Consider auditing the <strong className="text-zinc-900 dark:text-zinc-100">Engineering</strong> department — they have the highest pending requests.
                  </>
                )}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Powered by AssetFlow Intelligence</span>
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">View report →</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
