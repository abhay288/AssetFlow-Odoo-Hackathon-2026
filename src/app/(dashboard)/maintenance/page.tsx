'use client'

import React, { useState } from 'react'
import { MaintenanceKanban } from '@/features/maintenance/components/maintenance-kanban'
import { MaintenanceRequestDrawer } from '@/features/maintenance/components/maintenance-request-drawer'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function MaintenancePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-6">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Maintenance Workflow</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage asset repairs, servicing, and technician workloads.</p>
        </div>
        <Button onClick={() => setIsDrawerOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Request
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <MaintenanceKanban />
      </div>

      <MaintenanceRequestDrawer 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
        onSuccess={() => {
          // Triggered when a new request is made
          // The realtime listener in MaintenanceKanban handles the refresh automatically!
        }} 
      />
    </div>
  )
}
