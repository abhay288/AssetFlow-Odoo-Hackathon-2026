'use client'

import React from 'react'
import { ReportsDashboard } from '@/features/reports/components/reports-dashboard'

export default function ReportsPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-6">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Executive Analytics</h1>
          <p className="text-sm text-zinc-500 mt-1">High-level insights into asset utilization, health, and financials.</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ReportsDashboard />
      </div>
    </div>
  )
}
