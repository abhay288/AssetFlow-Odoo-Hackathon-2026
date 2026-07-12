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

const areaData = [
  { name: 'Jan', total: 1050, allocated: 800 },
  { name: 'Feb', total: 1100, allocated: 850 },
  { name: 'Mar', total: 1120, allocated: 890 },
  { name: 'Apr', total: 1180, allocated: 920 },
  { name: 'May', total: 1200, allocated: 980 },
  { name: 'Jun', total: 1248, allocated: 1050 },
]

const barData = [
  { name: 'Engineering', assets: 450 },
  { name: 'Sales', assets: 220 },
  { name: 'HR', assets: 120 },
  { name: 'Finance', assets: 90 },
  { name: 'Marketing', assets: 180 },
  { name: 'Operations', assets: 188 },
]

const pieData = [
  { name: 'IT Equipment', value: 550 },
  { name: 'Vehicles', value: 120 },
  { name: 'Furniture', value: 340 },
  { name: 'Software', value: 238 },
]

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6']

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

export function DashboardCharts() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"
    >
      <motion.div variants={itemVariants} className="col-span-4">
        <Card className="h-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-zinc-50">Asset Growth & Allocation</CardTitle>
            <CardDescription>Monthly overview of total versus allocated assets</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-2 pl-0">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#3f3f46' : '#e4e4e7'} />
                <XAxis 
                  dataKey="name" 
                  stroke={isDark ? '#a1a1aa' : '#71717a'} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10} 
                />
                <YAxis 
                  stroke={isDark ? '#a1a1aa' : '#71717a'} 
                  fontSize={12} 
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
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Total Assets" />
                <Area type="monotone" dataKey="allocated" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAllocated)" name="Allocated Assets" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants} className="col-span-3">
        <Card className="h-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-zinc-50">Department Allocation</CardTitle>
            <CardDescription>Assets distributed across departments</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-2 pl-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDark ? '#3f3f46' : '#e4e4e7'} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke={isDark ? '#a1a1aa' : '#71717a'} 
                  fontSize={12} 
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

      <motion.div variants={itemVariants} className="col-span-3">
        <Card className="h-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-zinc-50">Asset Distribution</CardTitle>
            <CardDescription>Breakdown by asset category</CardDescription>
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
                  {pieData.map((entry, index) => (
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
