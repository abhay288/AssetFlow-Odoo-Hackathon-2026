'use client'

import React, { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { ClipboardCheck, PlayCircle, Clock, AlertTriangle, FileText, CheckCircle2, MoreVertical } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

interface AuditCycle {
  id: string
  name: string
  status: string
  start_date: string
  end_date: string
  department: { name: string }
  total_items: number
  verified_items: number
}

interface AuditDashboardProps {
  onOpenAudit: (id: string) => void
}

export function AuditDashboard({ onOpenAudit }: AuditDashboardProps) {
  const [audits, setAudits] = useState<AuditCycle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchAudits = async () => {
    setIsLoading(true)
    // Fetch audits with count of items and verified items
    const { data: cycles } = await supabase
      .from('audit_cycles')
      .select(`
        id, name, status, start_date, end_date,
        department:departments(name)
      `)
      .order('created_at', { ascending: false })

    if (cycles) {
      // In a real app we'd use a postgres view or RPC for counts. For now, fetch items manually.
      const { data: items } = await supabase.from('audit_items').select('audit_cycle_id, status')
      
      const enriched = cycles.map((c: any) => {
        const cycleItems = (items || []).filter(i => i.audit_cycle_id === c.id)
        const verified = cycleItems.filter(i => i.status === 'verified').length
        return {
          ...c,
          total_items: cycleItems.length,
          verified_items: verified
        }
      })
      setAudits(enriched)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchAudits()
    const channel = supabase.channel('realtime:audits')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_cycles' }, () => fetchAudits())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_items' }, () => fetchAudits())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'planned':
      case 'scheduled': return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Scheduled</Badge>
      case 'in_progress': return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">In Progress</Badge>
      case 'completed': return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Completed</Badge>
      case 'closed': return <Badge className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">Closed</Badge>
      default: return <Badge variant="outline" className="capitalize">{status}</Badge>
    }
  }

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pb-8 custom-scrollbar">
      
      {/* High-Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-2">
            <ClipboardCheck className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Active Audits</h3>
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {audits.filter(a => a.status === 'in_progress').length}
          </p>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-2">
            <Clock className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Scheduled</h3>
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {audits.filter(a => ['planned', 'scheduled'].includes(a.status)).length}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Global Discrepancies</h3>
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {/* Mock total for global discrepancies */}
            {audits.reduce((acc, curr) => acc + (curr.total_items - curr.verified_items), 0)}
          </p>
        </div>

        <div className="bg-indigo-600 p-5 rounded-xl border border-indigo-500 shadow-sm text-white">
          <div className="flex items-center gap-3 mb-2 opacity-90">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Verification Rate</h3>
          </div>
          <p className="text-3xl font-bold">
            {(() => {
              const total = audits.reduce((acc, c) => acc + c.total_items, 0)
              const ver = audits.reduce((acc, c) => acc + c.verified_items, 0)
              return total > 0 ? Math.round((ver/total)*100) : 100
            })()}%
          </p>
        </div>
      </div>

      {/* Audit List */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex-1">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/50">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Audit Cycles</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-zinc-500">Loading audits...</div>
        ) : audits.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <ClipboardCheck className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No Audits Found</h3>
            <p className="text-zinc-500 max-w-sm mt-1">Create a new audit cycle to begin verifying your physical assets.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {audits.map((audit, i) => {
              const progress = audit.total_items > 0 ? (audit.verified_items / audit.total_items) * 100 : 0
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={audit.id} 
                  className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
                  onClick={() => onOpenAudit(audit.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">{audit.name}</h3>
                      {getStatusBadge(audit.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {audit.department?.name || 'Cross-Department'}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Started {new Date(audit.start_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="w-full md:w-64 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500 font-medium">Verification Progress</span>
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                      />
                    </div>
                    <p className="text-xs text-zinc-400 text-right">{audit.verified_items} of {audit.total_items} items verified</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
