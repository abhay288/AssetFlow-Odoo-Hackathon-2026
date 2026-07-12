'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { useTheme } from 'next-themes'

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#ef4444']

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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
}

export function DashboardCharts({ data }: { data: any }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const { role, assets, allocations, bookings, employees, departments, categories, managedDepartmentId, employeeId } = data

  // 1. Calculate monthly area data (last 6 months)
  const now = new Date()
  const areaData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date()
    d.setMonth(now.getMonth() - (5 - i))
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    const name = d.toLocaleDateString('en-US', { month: 'short' })

    // Assets created on or before this month's end
    const roleAssets = assets.filter((a: any) => {
      const created = new Date(a.created_at)
      const matchesCreated = created <= monthEnd
      const matchesActive = a.status !== 'disposed'
      
      if (role === 'admin' || role === 'manager') {
        return matchesCreated && matchesActive
      } else if (role === 'dept_head') {
        return matchesCreated && matchesActive && a.department_id === managedDepartmentId
      } else {
        return matchesCreated && matchesActive && a.owner_id === employeeId
      }
    })

    // Allocations active during this month
    const roleAllocations = allocations.filter((al: any) => {
      const start = new Date(al.start_date)
      const matchesStart = start <= monthEnd
      const returned = al.return_date ? new Date(al.return_date) : null
      const matchesEnd = !returned || returned > monthStart

      if (role === 'admin' || role === 'manager') {
        return matchesStart && matchesEnd && al.status === 'active'
      } else if (role === 'dept_head') {
        const deptEmpIds = employees.filter((e: any) => e.department_id === managedDepartmentId).map((e: any) => e.id)
        return matchesStart && matchesEnd && al.status === 'active' && deptEmpIds.includes(al.employee_id)
      } else {
        return matchesStart && matchesEnd && al.status === 'active' && al.employee_id === employeeId
      }
    })

    return {
      name,
      total: roleAssets.length,
      allocated: roleAllocations.length
    }
  })

  // 2. Calculate department allocations
  const deptCounts: Record<string, number> = {}
  assets.forEach((a: any) => {
    if (a.status !== 'disposed' && a.department_id) {
      deptCounts[a.department_id] = (deptCounts[a.department_id] || 0) + 1
    }
  })

  let barData = departments.map((d: any) => ({
    name: d.name,
    assets: deptCounts[d.id] || 0
  })).filter((item: any) => item.assets > 0)

  if (barData.length === 0) {
    barData = [{ name: 'No Data', assets: 0 }]
  }

  // 3. Calculate asset category distribution
  const catCounts: Record<string, number> = {}
  assets.forEach((a: any) => {
    if (a.status !== 'disposed' && a.category_id) {
      catCounts[a.category_id] = (catCounts[a.category_id] || 0) + 1
    }
  })

  let pieData = categories.map((c: any) => ({
    name: c.name,
    value: catCounts[c.id] || 0
  })).filter((item: any) => item.value > 0)

  if (pieData.length === 0) {
    pieData = [{ name: 'No Data', value: 0 }]
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"
    >
      <motion.div variants={itemVariants} className="lg:col-span-4">
        <Card className="h-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-zinc-50 text-sm font-semibold">Asset Growth & Allocation</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Monthly overview of total versus allocated assets</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-2 pl-0">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#27272a' : '#f4f4f5'} />
                <XAxis 
                  dataKey="name" 
                  stroke={isDark ? '#a1a1aa' : '#71717a'} 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10} 
                />
                <YAxis 
                  stroke={isDark ? '#a1a1aa' : '#71717a'} 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#18181b' : '#ffffff',
                    borderColor: isDark ? '#27272a' : '#e4e4e7',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  itemStyle={{ color: isDark ? '#f4f4f5' : '#18181b' }}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Total Assets" />
                <Area type="monotone" dataKey="allocated" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAllocated)" name="Allocated Assets" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants} className="lg:col-span-3">
        <Card className="h-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-zinc-50 text-sm font-semibold">Department Allocation</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Assets distributed across departments</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-2 pl-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDark ? '#27272a' : '#f4f4f5'} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke={isDark ? '#a1a1aa' : '#71717a'} 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  width={90}
                />
                <Tooltip 
                  cursor={{fill: isDark ? '#27272a' : '#f4f4f5'}}
                  contentStyle={{ 
                    backgroundColor: isDark ? '#18181b' : '#ffffff',
                    borderColor: isDark ? '#27272a' : '#e4e4e7',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="assets" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Assets" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="lg:col-span-3">
        <Card className="h-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-zinc-50 text-sm font-semibold">Asset Distribution</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Breakdown by asset category</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#18181b' : '#ffffff',
                    borderColor: isDark ? '#27272a' : '#e4e4e7',
                    borderRadius: '8px'
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
