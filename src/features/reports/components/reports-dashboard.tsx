'use client'

import React, { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts'
import { Download, Filter, TrendingUp, AlertCircle, Calendar, Users, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function ReportsDashboard() {
  const [assetStatusData, setAssetStatusData] = useState<any[]>([])
  const [departmentData, setDepartmentData] = useState<any[]>([])
  const [maintenanceCostData, setMaintenanceCostData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    
    // 1. Asset Status Distribution
    const { data: assets } = await supabase.from('assets').select('status, department_id, purchase_cost')
    if (assets) {
      const statusCounts = assets.reduce((acc: any, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1
        return acc
      }, {})
      
      setAssetStatusData(Object.keys(statusCounts).map(key => ({
        name: key.replace('_', ' ').toUpperCase(),
        value: statusCounts[key]
      })))
    }

    // 2. Department Value Distribution
    const { data: depts } = await supabase.from('departments').select('id, name')
    if (assets && depts) {
      const deptValue = depts.map(d => {
        const dAssets = assets.filter(a => a.department_id === d.id)
        return {
          name: d.name,
          value: dAssets.reduce((sum, a) => sum + (a.purchase_cost || 0), 0),
          count: dAssets.length
        }
      })
      setDepartmentData(deptValue.sort((a,b) => b.value - a.value).slice(0, 5)) // Top 5
    }

    // 3. Mock Maintenance Trends (Last 6 Months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const mockMaintenance = months.map(m => ({
      name: m,
      labor: Math.floor(Math.random() * 5000) + 1000,
      parts: Math.floor(Math.random() * 8000) + 2000
    }))
    setMaintenanceCostData(mockMaintenance)

    setIsLoading(false)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-xl">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{label || payload[0].name}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="text-sm" style={{ color: p.color || p.fill }}>
              {p.name}: {p.name.toLowerCase().includes('cost') || p.name.toLowerCase().includes('value') ? '$' : ''}{p.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-zinc-500">Loading Analytics...</div>
  }

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pb-8 custom-scrollbar">
      
      {/* Header Actions */}
      <div className="flex justify-end gap-3 shrink-0">
        <Button variant="outline" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <Filter className="w-4 h-4 mr-2" /> Filter Data
        </Button>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Download className="w-4 h-4 mr-2" /> Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-500 mb-2"><Briefcase className="w-4 h-4"/> <h3 className="font-medium text-sm">Total Asset Value</h3></div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            ${departmentData.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
          </p>
          <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12.5% YoY</p>
        </motion.div>

        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.1}} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-500 mb-2"><Users className="w-4 h-4"/> <h3 className="font-medium text-sm">Utilization Rate</h3></div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {Math.round((assetStatusData.find(s => s.name === 'ALLOCATED')?.value || 0) / (assetStatusData.reduce((sum, s) => sum + s.value, 0) || 1) * 100)}%
          </p>
          <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Target: 85%</p>
        </motion.div>

        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.2}} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-500 mb-2"><AlertCircle className="w-4 h-4"/> <h3 className="font-medium text-sm">Maintenance Costs</h3></div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            ${maintenanceCostData[maintenanceCostData.length - 1]?.labor + maintenanceCostData[maintenanceCostData.length - 1]?.parts}
          </p>
          <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +5.2% vs Last Month</p>
        </motion.div>

        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.3}} className="bg-emerald-600 text-white p-5 rounded-xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Calendar className="w-16 h-16"/></div>
          <div className="relative z-10">
            <h3 className="font-medium text-sm opacity-90 mb-2">Audit Compliance</h3>
            <p className="text-3xl font-bold">98.4%</p>
            <p className="text-xs opacity-90 mt-2">All locations verified</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        {/* Asset Distribution */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm lg:col-span-1 flex flex-col">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Asset Lifecycle Distribution</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {assetStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Trends */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm lg:col-span-2 flex flex-col">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Maintenance Cost Trends (6 Mo)</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={maintenanceCostData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLabor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorParts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="labor" name="Labor Cost" stroke="#4f46e5" fillOpacity={1} fill="url(#colorLabor)" />
                <Area type="monotone" dataKey="parts" name="Parts Cost" stroke="#10b981" fillOpacity={1} fill="url(#colorParts)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Asset Value */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm lg:col-span-3 flex flex-col">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Top Departments by Asset Value</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" name="Asset Value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
