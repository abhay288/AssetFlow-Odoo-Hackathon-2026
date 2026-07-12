'use client'

import React, { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Search, Filter, Camera, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { DiscrepancyReportModal } from './discrepancy-report-modal'
import { motion, AnimatePresence } from 'framer-motion'

interface VerificationWorkspaceProps {
  auditId: string
  onBack: () => void
}

export function AuditVerificationWorkspace({ auditId, onBack }: VerificationWorkspaceProps) {
  const [audit, setAudit] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchData = async () => {
    const { data: auditData } = await supabase
      .from('audit_cycles')
      .select('*, department:departments(name)')
      .eq('id', auditId)
      .single()
    if (auditData) setAudit(auditData)

    const { data: itemsData } = await supabase
      .from('audit_items')
      .select('*, asset:assets(name, tag_number, serial_number, status, location:locations(name))')
      .eq('audit_cycle_id', auditId)
      .order('status', { ascending: false }) // Put pending at top implicitly if sorting works out
    if (itemsData) setItems(itemsData)
  }

  useEffect(() => {
    fetchData()
  }, [auditId])

  const markItem = async (itemId: string, newStatus: string) => {
    setIsUpdating(itemId)
    try {
      await supabase
        .from('audit_items')
        .update({ status: newStatus, verified_at: new Date().toISOString() })
        .eq('id', itemId)
      
      // Optimistic update
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: newStatus, verified_at: new Date().toISOString() } : i))
      toast.success(`Asset marked as ${newStatus.replace('_', ' ')}`)
    } catch (e) {
      toast.error('Failed to verify asset')
    } finally {
      setIsUpdating(null)
    }
  }

  const startAudit = async () => {
    await supabase.from('audit_cycles').update({ status: 'in_progress' }).eq('id', auditId)
    setAudit({ ...audit, status: 'in_progress' })
    toast.success('Audit started')
  }

  const filteredItems = items.filter(item => {
    if (filter === 'pending' && item.status !== 'pending') return false
    if (filter === 'verified' && item.status !== 'verified') return false
    if (filter === 'discrepancy' && ['pending', 'verified'].includes(item.status)) return false
    
    if (search) {
      const q = search.toLowerCase()
      return item.asset?.name.toLowerCase().includes(q) || item.asset?.tag_number.toLowerCase().includes(q)
    }
    return true
  })

  if (!audit) return <div className="p-8 text-center text-zinc-500">Loading workspace...</div>

  const verifiedCount = items.filter(i => i.status === 'verified').length
  const totalCount = items.length
  const discrepancyCount = items.filter(i => !['pending', 'verified'].includes(i.status)).length

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-zinc-500 hover:text-zinc-900">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              {audit.name}
              <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-600 uppercase font-bold tracking-wider">{audit.status.replace('_', ' ')}</span>
            </h1>
            <p className="text-sm text-zinc-500 mt-1">{audit.department?.name || 'All Departments'} • {audit.scope.replace('_', ' ')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {audit.status === 'planned' || audit.status === 'scheduled' ? (
            <Button onClick={startAudit} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Start Verification
            </Button>
          ) : audit.status === 'in_progress' ? (
            <Button onClick={() => setIsReportOpen(true)} className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900">
              Generate Report
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 shrink-0">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 font-medium">Verification Progress</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{verifiedCount} / {totalCount}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 font-medium">Discrepancies Found</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{discrepancyCount}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 font-medium">Pending Verification</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalCount - verifiedCount - discrepancyCount}</p>
          </div>
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
            <Search className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-950/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input 
              placeholder="Scan barcode or search by name..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-zinc-900"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select 
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="h-10 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <option value="all">All Items</option>
              <option value="pending">Pending Only</option>
              <option value="verified">Verified Only</option>
              <option value="discrepancy">Discrepancies Only</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="h-full flex items-center justify-center text-zinc-500">No assets match your criteria.</div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredItems.map(item => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={item.id} 
                    className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                      item.status === 'verified' ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50' : 
                      item.status !== 'pending' ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50' :
                      'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.asset?.name}</h4>
                        {item.status !== 'pending' && (
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm ${
                            item.status === 'verified' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-zinc-500">
                        <span className="font-mono">{item.asset?.tag_number}</span>
                        <span>{item.asset?.location?.name || 'Unknown Location'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {audit.status === 'in_progress' && item.status === 'pending' ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={isUpdating === item.id}
                            onClick={() => markItem(item.id, 'verified')}
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Verify
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={isUpdating === item.id}
                            onClick={() => markItem(item.id, 'missing')}
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Missing
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            disabled={isUpdating === item.id}
                            onClick={() => markItem(item.id, 'damaged')}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            title="Mark Damaged"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </Button>
                        </>
                      ) : audit.status === 'in_progress' ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => markItem(item.id, 'pending')}
                          className="text-zinc-400 hover:text-zinc-600"
                        >
                          Reset
                        </Button>
                      ) : null}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <DiscrepancyReportModal 
        auditId={auditId} 
        open={isReportOpen} 
        onOpenChange={setIsReportOpen}
        onComplete={() => {
          setIsReportOpen(false)
          fetchData()
        }}
      />
    </div>
  )
}
