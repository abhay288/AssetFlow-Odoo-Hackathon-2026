'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, CheckCircle2, UserCheck, Wrench,
  CalendarCheck, ArrowRightLeft, Clock, AlertTriangle,
  TrendingUp, TrendingDown, Bell
} from 'lucide-react'

// ── Counter animation hook ──────────────────────────────────────────────────
function useCountUp(target: number, duration = 1000, delay = 0) {
  const [value, setValue] = useState(0)
  const raf = useRef<number | null>(null)
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now()
      const step = (now: number) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 4)
        setValue(Math.round(eased * target))
        if (progress < 1) raf.current = requestAnimationFrame(step)
      }
      raf.current = requestAnimationFrame(step)
    }, delay)
    return () => {
      clearTimeout(timeout)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [target, duration, delay])

  return value
}

// ── Mini sparkline SVG ──────────────────────────────────────────────────────
function Sparkline({ data, color, up }: { data: number[]; color: string; up: boolean }) {
  const width = 80
  const height = 28
  const validData = data && data.length > 1 ? data : [0, 0]
  const min = Math.min(...validData)
  const max = Math.max(...validData)
  const range = max - min || 1

  const points = validData.map((v, i) => {
    const x = (i / (validData.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  const fillId = `spark-fill-${color.replace('#', '')}`

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill={`url(#${fillId})`}
        stroke="none"
        points={`0,${height} ${points} ${width},${height}`}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <circle
        cx={(validData.length - 1) / (validData.length - 1) * width}
        cy={height - ((validData[validData.length - 1] - min) / range) * height}
        r="2.5"
        fill={color}
      />
    </svg>
  )
}

// ── KPI Card Component ──────────────────────────────────────────────────────
function KPICard({ kpi, index }: { kpi: any; index: number }) {
  const count = useCountUp(kpi.rawValue, 800, index * 60)
  const [hovered, setHovered] = useState(false)

  const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown
  const trendClass = kpi.trend === 'up'
    ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30'
    : 'text-red-500 bg-red-100 dark:text-red-400 dark:bg-red-900/30'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay: index * 0.04 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="relative group cursor-default"
    >
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `0 8px 32px ${kpi.color}22` }}
      />

      <div className="relative rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden p-5 h-full">
        <div className={`absolute inset-0 bg-linear-to-br ${kpi.gradient} rounded-2xl pointer-events-none`} />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <motion.div
              className={`p-2.5 rounded-xl ${kpi.iconBg} shadow-sm`}
              animate={{ scale: hovered ? 1.1 : 1, rotate: hovered ? 5 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <kpi.icon className={`w-4 h-4 ${kpi.iconColor}`} />
            </motion.div>

            <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${trendClass}`}>
              <TrendIcon className="w-3.5 h-3.5" />
              {kpi.change}
            </div>
          </div>

          <div className="mb-3">
            <motion.p
              className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tabular-nums tracking-tight"
              key={count}
            >
              {count >= kpi.rawValue ? kpi.rawValue.toLocaleString() : count.toLocaleString()}
            </motion.p>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
              {kpi.title}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 + index * 0.04 }}
          >
            <Sparkline data={kpi.sparkData} color={kpi.color} up={kpi.trend === 'up'} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Export ─────────────────────────────────────────────────────────────
export function KPICards({ data }: { data: any }) {
  const { role, assets, allocations, bookings, transfers, maintenances, employees, managedDepartmentId, employeeId, notifications } = data
  const now = new Date()

  let kpis: any[] = []

  if (role === 'admin' || role === 'manager') {
    const totalAssets = assets.filter((a: any) => a.status !== 'disposed').length
    const available = assets.filter((a: any) => a.status === 'available').length
    const allocated = assets.filter((a: any) => a.status === 'allocated').length
    const maintenance = assets.filter((a: any) => a.status === 'under_maintenance').length
    const activeBookings = bookings.filter((b: any) => b.status === 'approved' || b.status === 'active').length
    const pendingTransfers = transfers.filter((t: any) => t.status === 'pending').length
    const upcomingReturns = allocations.filter((al: any) => al.status === 'active' && al.expected_return_date && new Date(al.expected_return_date) >= now).length
    const overdue = allocations.filter((al: any) => al.status === 'active' && al.expected_return_date && new Date(al.expected_return_date) < now).length

    kpis = [
      { title: 'Total Assets', rawValue: totalAssets, change: 'Live Assets', trend: 'up' as const, icon: Package, color: '#3b82f6', gradient: 'from-blue-500/[0.12] to-blue-600/[0.04]', iconBg: 'bg-blue-100 dark:bg-blue-900/40', iconColor: 'text-blue-600 dark:text-blue-400', sparkData: [0, 0, 0, 0, 0, 0, totalAssets] },
      { title: 'Available', rawValue: available, change: 'Ready for use', trend: 'up' as const, icon: CheckCircle2, color: '#10b981', gradient: 'from-emerald-500/[0.12] to-emerald-600/[0.04]', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40', iconColor: 'text-emerald-600 dark:text-emerald-400', sparkData: [0, 0, 0, 0, 0, 0, available] },
      { title: 'Allocated', rawValue: allocated, change: 'Assigned to staff', trend: 'up' as const, icon: UserCheck, color: '#6366f1', gradient: 'from-indigo-500/[0.12] to-indigo-600/[0.04]', iconBg: 'bg-indigo-100 dark:bg-indigo-900/40', iconColor: 'text-indigo-600 dark:text-indigo-400', sparkData: [0, 0, 0, 0, 0, 0, allocated] },
      { title: 'Maintenance', rawValue: maintenance, change: 'Being repaired', trend: 'down' as const, icon: Wrench, color: '#f59e0b', gradient: 'from-amber-500/[0.12] to-amber-600/[0.04]', iconBg: 'bg-amber-100 dark:bg-amber-900/40', iconColor: 'text-amber-600 dark:text-amber-400', sparkData: [0, 0, 0, 0, 0, 0, maintenance] },
      { title: 'Active Bookings', rawValue: activeBookings, change: 'Resource schedule', trend: 'up' as const, icon: CalendarCheck, color: '#8b5cf6', gradient: 'from-violet-500/[0.12] to-violet-600/[0.04]', iconBg: 'bg-violet-100 dark:bg-violet-900/40', iconColor: 'text-violet-600 dark:text-violet-400', sparkData: [0, 0, 0, 0, 0, 0, activeBookings] },
      { title: 'Pending Transfers', rawValue: pendingTransfers, change: 'Awaiting review', trend: 'down' as const, icon: ArrowRightLeft, color: '#06b6d4', gradient: 'from-cyan-500/[0.12] to-cyan-600/[0.04]', iconBg: 'bg-cyan-100 dark:bg-cyan-900/40', iconColor: 'text-cyan-600 dark:text-cyan-400', sparkData: [0, 0, 0, 0, 0, 0, pendingTransfers] },
      { title: 'Upcoming Returns', rawValue: upcomingReturns, change: 'Due soon', trend: 'up' as const, icon: Clock, color: '#f97316', gradient: 'from-orange-500/[0.12] to-orange-600/[0.04]', iconBg: 'bg-orange-100 dark:bg-orange-900/40', iconColor: 'text-orange-600 dark:text-orange-400', sparkData: [0, 0, 0, 0, 0, 0, upcomingReturns] },
      { title: 'Overdue Returns', rawValue: overdue, change: 'Action required', trend: 'down' as const, icon: AlertTriangle, color: '#ef4444', gradient: 'from-red-500/[0.12] to-red-600/[0.04]', iconBg: 'bg-red-100 dark:bg-red-900/40', iconColor: 'text-red-600 dark:text-red-400', sparkData: [0, 0, 0, 0, 0, 0, overdue] },
    ]
  } else if (role === 'dept_head') {
    const deptEmpIds = employees.filter((e: any) => e.department_id === managedDepartmentId).map((e: any) => e.id)
    const deptAssets = assets.filter((a: any) => a.department_id === managedDepartmentId && a.status !== 'disposed')
    
    const totalAssets = deptAssets.length
    const available = deptAssets.filter((a: any) => a.status === 'available').length
    const allocated = deptAssets.filter((a: any) => a.status === 'allocated').length
    const maintenance = deptAssets.filter((a: any) => a.status === 'under_maintenance').length
    const activeBookings = bookings.filter((b: any) => (b.status === 'approved' || b.status === 'active') && deptEmpIds.includes(b.employee_id)).length
    const pendingTransfers = transfers.filter((t: any) => t.status === 'pending' && (deptEmpIds.includes(t.from_employee_id) || deptEmpIds.includes(t.to_employee_id))).length
    const upcomingReturns = allocations.filter((al: any) => al.status === 'active' && al.expected_return_date && new Date(al.expected_return_date) >= now && deptEmpIds.includes(al.employee_id)).length
    const overdue = allocations.filter((al: any) => al.status === 'active' && al.expected_return_date && new Date(al.expected_return_date) < now && deptEmpIds.includes(al.employee_id)).length

    kpis = [
      { title: 'Dept Assets', rawValue: totalAssets, change: 'Department Total', trend: 'up' as const, icon: Package, color: '#3b82f6', gradient: 'from-blue-500/[0.12] to-blue-600/[0.04]', iconBg: 'bg-blue-100 dark:bg-blue-900/40', iconColor: 'text-blue-600 dark:text-blue-400', sparkData: [0, 0, 0, 0, 0, 0, totalAssets] },
      { title: 'Available', rawValue: available, change: 'Ready for use', trend: 'up' as const, icon: CheckCircle2, color: '#10b981', gradient: 'from-emerald-500/[0.12] to-emerald-600/[0.04]', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40', iconColor: 'text-emerald-600 dark:text-emerald-400', sparkData: [0, 0, 0, 0, 0, 0, available] },
      { title: 'Allocated', rawValue: allocated, change: 'Staff assignments', trend: 'up' as const, icon: UserCheck, color: '#6366f1', gradient: 'from-indigo-500/[0.12] to-indigo-600/[0.04]', iconBg: 'bg-indigo-100 dark:bg-indigo-900/40', iconColor: 'text-indigo-600 dark:text-indigo-400', sparkData: [0, 0, 0, 0, 0, 0, allocated] },
      { title: 'Maintenance', rawValue: maintenance, change: 'Being repaired', trend: 'down' as const, icon: Wrench, color: '#f59e0b', gradient: 'from-amber-500/[0.12] to-amber-600/[0.04]', iconBg: 'bg-amber-100 dark:bg-amber-900/40', iconColor: 'text-amber-600 dark:text-amber-400', sparkData: [0, 0, 0, 0, 0, 0, maintenance] },
      { title: 'Active Bookings', rawValue: activeBookings, change: 'Staff bookings', trend: 'up' as const, icon: CalendarCheck, color: '#8b5cf6', gradient: 'from-violet-500/[0.12] to-violet-600/[0.04]', iconBg: 'bg-violet-100 dark:bg-violet-900/40', iconColor: 'text-violet-600 dark:text-violet-400', sparkData: [0, 0, 0, 0, 0, 0, activeBookings] },
      { title: 'Pending Transfers', rawValue: pendingTransfers, change: 'Transfer requests', trend: 'down' as const, icon: ArrowRightLeft, color: '#06b6d4', gradient: 'from-cyan-500/[0.12] to-cyan-600/[0.04]', iconBg: 'bg-cyan-100 dark:bg-cyan-900/40', iconColor: 'text-cyan-600 dark:text-cyan-400', sparkData: [0, 0, 0, 0, 0, 0, pendingTransfers] },
      { title: 'Upcoming Returns', rawValue: upcomingReturns, change: 'Staff returns due', trend: 'up' as const, icon: Clock, color: '#f97316', gradient: 'from-orange-500/[0.12] to-orange-600/[0.04]', iconBg: 'bg-orange-100 dark:bg-orange-900/40', iconColor: 'text-orange-600 dark:text-orange-400', sparkData: [0, 0, 0, 0, 0, 0, upcomingReturns] },
      { title: 'Overdue Returns', rawValue: overdue, change: 'Action required', trend: 'down' as const, icon: AlertTriangle, color: '#ef4444', gradient: 'from-red-500/[0.12] to-red-600/[0.04]', iconBg: 'bg-red-100 dark:bg-red-900/40', iconColor: 'text-red-600 dark:text-red-400', sparkData: [0, 0, 0, 0, 0, 0, overdue] },
    ]
  } else {
    // employee
    const myAssets = assets.filter((a: any) => a.owner_id === employeeId && a.status !== 'disposed').length
    const myAllocations = allocations.filter((al: any) => al.employee_id === employeeId && al.status === 'active').length
    const approvedBookings = bookings.filter((b: any) => b.employee_id === employeeId && b.status === 'approved').length
    const activeBookings = bookings.filter((b: any) => b.employee_id === employeeId && b.status === 'active').length
    const myMaintenances = maintenances.filter((m: any) => m.reported_by === employeeId && m.status !== 'closed').length
    const pendingTransfers = transfers.filter((t: any) => t.status === 'pending' && (t.from_employee_id === employeeId || t.to_employee_id === employeeId)).length
    const overdue = allocations.filter((al: any) => al.employee_id === employeeId && al.status === 'active' && al.expected_return_date && new Date(al.expected_return_date) < now).length
    const unreadAlerts = notifications.filter((n: any) => !n.is_read).length

    kpis = [
      { title: 'My Assigned Assets', rawValue: myAssets, change: 'Custody Assets', trend: 'up' as const, icon: Package, color: '#3b82f6', gradient: 'from-blue-500/[0.12] to-blue-600/[0.04]', iconBg: 'bg-blue-100 dark:bg-blue-900/40', iconColor: 'text-blue-600 dark:text-blue-400', sparkData: [0, 0, 0, 0, 0, 0, myAssets] },
      { title: 'Active Allocations', rawValue: myAllocations, change: 'Assignments', trend: 'up' as const, icon: UserCheck, color: '#10b981', gradient: 'from-emerald-500/[0.12] to-emerald-600/[0.04]', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40', iconColor: 'text-emerald-600 dark:text-emerald-400', sparkData: [0, 0, 0, 0, 0, 0, myAllocations] },
      { title: 'Approved Bookings', rawValue: approvedBookings, change: 'Upcoming', trend: 'up' as const, icon: CalendarCheck, color: '#6366f1', gradient: 'from-indigo-500/[0.12] to-indigo-600/[0.04]', iconBg: 'bg-indigo-100 dark:bg-indigo-900/40', iconColor: 'text-indigo-600 dark:text-indigo-400', sparkData: [0, 0, 0, 0, 0, 0, approvedBookings] },
      { title: 'Active Bookings', rawValue: activeBookings, change: 'In use', trend: 'up' as const, icon: CalendarCheck, color: '#8b5cf6', gradient: 'from-violet-500/[0.12] to-violet-600/[0.04]', iconBg: 'bg-violet-100 dark:bg-violet-900/40', iconColor: 'text-violet-600 dark:text-violet-400', sparkData: [0, 0, 0, 0, 0, 0, activeBookings] },
      { title: 'My Maintenance Tickets', rawValue: myMaintenances, change: 'Open tickets', trend: 'down' as const, icon: Wrench, color: '#f59e0b', gradient: 'from-amber-500/[0.12] to-amber-600/[0.04]', iconBg: 'bg-amber-100 dark:bg-amber-900/40', iconColor: 'text-amber-600 dark:text-amber-400', sparkData: [0, 0, 0, 0, 0, 0, myMaintenances] },
      { title: 'My Transfers', rawValue: pendingTransfers, change: 'Pending requests', trend: 'down' as const, icon: ArrowRightLeft, color: '#06b6d4', gradient: 'from-cyan-500/[0.12] to-cyan-600/[0.04]', iconBg: 'bg-cyan-100 dark:bg-cyan-900/40', iconColor: 'text-cyan-600 dark:text-cyan-400', sparkData: [0, 0, 0, 0, 0, 0, pendingTransfers] },
      { title: 'My Overdue Returns', rawValue: overdue, change: 'Due soon', trend: 'down' as const, icon: AlertTriangle, color: '#ef4444', gradient: 'from-red-500/[0.12] to-red-600/[0.04]', iconBg: 'bg-red-100 dark:bg-red-900/40', iconColor: 'text-red-600 dark:text-red-400', sparkData: [0, 0, 0, 0, 0, 0, overdue] },
      { title: 'Unread Alerts', rawValue: unreadAlerts, change: 'Inbox', trend: 'up' as const, icon: Bell, color: '#f97316', gradient: 'from-orange-500/[0.12] to-orange-600/[0.04]', iconBg: 'bg-orange-100 dark:bg-orange-900/40', iconColor: 'text-orange-600 dark:text-orange-400', sparkData: [0, 0, 0, 0, 0, 0, unreadAlerts] },
    ]
  }

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, i) => (
        <KPICard key={kpi.title} kpi={kpi} index={i} />
      ))}
    </div>
  )
}
