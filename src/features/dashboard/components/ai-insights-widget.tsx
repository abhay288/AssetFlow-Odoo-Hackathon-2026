'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ArrowRight, Bot } from 'lucide-react'

// ── Typing animation hook ────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 18, startDelay = 400) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) {
          clearInterval(interval)
          setDone(true)
        }
      }, speed)
      return () => clearInterval(interval)
    }, startDelay)
    return () => clearTimeout(timeout)
  }, [text, speed, startDelay])

  return { displayed, done }
}

export function AIInsightsWidget({ data }: { data: any }) {
  const { role, assets, allocations, bookings, transfers, maintenances, employees, managedDepartmentId, employeeId, notifications, profileName } = data
  const now = new Date()

  // Filter scoped data
  const roleAssets = assets.filter((a: any) => {
    if (role === 'admin' || role === 'manager') {
      return a.status !== 'disposed'
    } else if (role === 'dept_head') {
      return a.department_id === managedDepartmentId && a.status !== 'disposed'
    } else {
      return a.owner_id === employeeId && a.status !== 'disposed'
    }
  })

  const deptEmpIds = role === 'dept_head' 
    ? employees.filter((e: any) => e.department_id === managedDepartmentId).map((e: any) => e.id)
    : []

  const totalAssets = roleAssets.length
  const available = roleAssets.filter((a: any) => a.status === 'available').length
  
  const activeMaintenances = maintenances.filter((m: any) => {
    if (role === 'admin' || role === 'manager') {
      return m.status !== 'closed' && m.status !== 'resolved'
    } else if (role === 'dept_head') {
      // asset belongs to department
      const asset = assets.find((a: any) => a.id === m.asset_id)
      return m.status !== 'closed' && m.status !== 'resolved' && asset?.department_id === managedDepartmentId
    } else {
      return m.reported_by === employeeId && m.status !== 'closed' && m.status !== 'resolved'
    }
  }).length

  const overdueReturns = allocations.filter((al: any) => {
    const isOverdue = al.status === 'active' && al.expected_return_date && new Date(al.expected_return_date) < now
    if (role === 'admin' || role === 'manager') {
      return isOverdue
    } else if (role === 'dept_head') {
      return isOverdue && deptEmpIds.includes(al.employee_id)
    } else {
      return isOverdue && al.employee_id === employeeId
    }
  }).length

  const operationalEfficiency = totalAssets > 0 
    ? Math.round(((totalAssets - activeMaintenances - overdueReturns) / totalAssets) * 100) 
    : 100

  // Build recommendation text dynamically
  let recommendation = 'All systems running optimally. Regular audits are recommended.'
  if (totalAssets === 0) {
    recommendation = 'Get started by registering your first asset in the Assets directory.'
  } else if (overdueReturns > 0) {
    recommendation = `Contact employees with the ${overdueReturns} overdue asset returns to arrange drop-off.`
  } else if (activeMaintenances > 0) {
    recommendation = `Assign open tickets to technicians to resolve the ${activeMaintenances} pending maintenance requests.`
  } else if (operationalEfficiency < 90) {
    recommendation = 'Asset operational health is sub-optimal. Review old assets or schedule check-ups.'
  }

  const introText = `Good morning, ${profileName.split(' ')[0]}. Here is your real-time asset summary:`

  const { displayed, done } = useTypewriter(introText)
  const [showStats, setShowStats] = useState(false)
  const [showInsights, setShowInsights] = useState(false)

  useEffect(() => {
    if (done) {
      const t1 = setTimeout(() => setShowStats(true), 200)
      const t2 = setTimeout(() => setShowInsights(true), 600)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [done])

  const quickStats = [
    { label: 'Available assets', value: available.toString() },
    { label: 'Under maintenance', value: activeMaintenances.toString() },
    { label: 'Overdue returns', value: overdueReturns.toString() },
    { label: 'Operational health', value: `${operationalEfficiency}%` },
  ]

  const insightsList = [
    {
      id: 1,
      text: recommendation,
      icon: Lightbulb,
      color: 'text-violet-500',
      bg: 'bg-violet-100 dark:bg-violet-900/30',
      border: 'border-violet-200/60 dark:border-violet-800/30',
    }
  ]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-200/50 dark:border-violet-900/30 bg-linear-to-br from-white via-violet-50/30 to-indigo-50/30 dark:from-zinc-900 dark:via-violet-950/10 dark:to-zinc-900 shadow-sm h-full flex flex-col">
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 pointer-events-none"
           style={{ background: 'radial-gradient(circle, oklch(0.62 0.18 290), transparent 70%)' }} />

      <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-violet-100/60 dark:border-violet-900/20 shrink-0">
        <div className="relative">
          <div className="p-2 rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-600/25">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="absolute inset-0 rounded-xl animate-ping bg-violet-500 opacity-20" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">AssetFlow AI</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Online</span>
          </div>
        </div>
        <Bot className="w-4 h-4 text-violet-400 dark:text-violet-500" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-4">
        <div className="flex gap-2.5">
          <div className="h-7 w-7 rounded-full bg-linear-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-zinc-100 dark:border-zinc-700 max-w-[90%]">
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {displayed}
              {!done && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.7 }}
                  className="inline-block w-0.5 h-3.5 bg-violet-500 ml-0.5 align-middle"
                />
              )}
            </p>
          </div>
        </div>

        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="ml-9 grid grid-cols-2 gap-2"
            >
              {quickStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white dark:bg-zinc-800 rounded-xl px-3 py-2 border border-zinc-100 dark:border-zinc-700 shadow-sm"
                >
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showInsights && insightsList.map((insight, idx) => {
            const Icon = insight.icon
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.12 }}
                className={`ml-9 flex gap-2.5 p-3 rounded-xl border ${insight.border} ${insight.bg} group cursor-pointer hover:shadow-sm transition-shadow`}
              >
                <Icon className={`w-3.5 h-3.5 ${insight.color} shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-bold text-violet-600 dark:text-violet-400 tracking-wider">AI Recommendation</p>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed mt-0.5">{insight.text}</p>
                </div>
                <ArrowRight className="w-3 h-3 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0" />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="px-5 py-3 border-t border-violet-100/60 dark:border-violet-900/20 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-400">Powered by AssetFlow Intelligence</span>
          <button className="text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1 transition-colors">
            Full report <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
