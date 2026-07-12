'use client'

import React, { useState } from 'react'
import { AuditDashboard } from '@/features/audits/components/audit-dashboard'
import { CreateAuditDrawer } from '@/features/audits/components/create-audit-drawer'
import { AuditVerificationWorkspace } from '@/features/audits/components/audit-verification-workspace'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function AuditsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null)

  if (activeAuditId) {
    return <AuditVerificationWorkspace auditId={activeAuditId} onBack={() => setActiveAuditId(null)} />
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-6">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Audit & Verification</h1>
          <p className="text-sm text-zinc-500 mt-1">Plan verification cycles and locate physical assets globally.</p>
        </div>
        <Button onClick={() => setIsDrawerOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Audit Cycle
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        <AuditDashboard onOpenAudit={setActiveAuditId} />
      </div>

      <CreateAuditDrawer 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
        onSuccess={() => {
          // Dashboard handles its own realtime updates, so no direct refresh needed.
        }} 
      />
    </div>
  )
}
