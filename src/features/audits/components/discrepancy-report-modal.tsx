'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import { Loader2, FileText, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react'

interface DiscrepancyReportModalProps {
  auditId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}

export function DiscrepancyReportModal({ auditId, open, onOpenChange, onComplete }: DiscrepancyReportModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isClosing, setIsClosing] = useState(false)
  const [items, setItems] = useState<any[]>([])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (open && auditId) {
      fetchDiscrepancies()
    }
  }, [open, auditId])

  const fetchDiscrepancies = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('audit_items')
      .select('*, asset:assets(name, tag_number, status)')
      .eq('audit_cycle_id', auditId)
      
    if (data) setItems(data)
    setIsLoading(false)
  }

  const handleCloseAudit = async () => {
    setIsClosing(true)
    try {
      const pendingItems = items.filter(i => i.status === 'pending')
      if (pendingItems.length > 0) {
        throw new Error(`Cannot close audit. ${pendingItems.length} items are still pending verification.`)
      }

      const discrepancies = items.filter(i => !['pending', 'verified'].includes(i.status))
      
      // Update core assets table based on discrepancies
      for (const item of discrepancies) {
        let newAssetStatus = item.asset.status
        if (item.status === 'missing' || item.status === 'lost') newAssetStatus = 'lost'
        else if (item.status === 'disposed') newAssetStatus = 'disposed'
        else if (item.status === 'damaged') newAssetStatus = 'under_maintenance' // Needs repair

        if (newAssetStatus !== item.asset.status) {
          await supabase.from('assets').update({ status: newAssetStatus }).eq('id', item.asset_id)
          
          await supabase.from('activity_logs').insert([{
            asset_id: item.asset_id,
            action_type: 'status_changed',
            description: `Status changed to ${newAssetStatus.replace('_', ' ')} due to Audit discrepancy.`
          }])
        }
      }

      // Close the audit cycle
      await supabase.from('audit_cycles').update({ 
        status: 'completed', 
        end_date: new Date().toISOString().split('T')[0] 
      }).eq('id', auditId)

      toast.success('Audit cycle closed successfully. Asset statuses updated.')
      onComplete()
    } catch (e: any) {
      toast.error(e.message || 'Failed to close audit')
    } finally {
      setIsClosing(false)
    }
  }

  const verified = items.filter(i => i.status === 'verified')
  const missing = items.filter(i => ['missing', 'lost'].includes(i.status))
  const damaged = items.filter(i => i.status === 'damaged')
  const pending = items.filter(i => i.status === 'pending')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-zinc-50 dark:bg-zinc-950 p-0 overflow-hidden border-zinc-200 dark:border-zinc-800">
        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6">
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Discrepancy Report
          </DialogTitle>
          <DialogDescription className="mt-2">
            Review the findings before officially closing this audit. Discrepancies will permanently update master asset records.
          </DialogDescription>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
        ) : (
          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30 rounded-lg p-4 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{verified.length}</p>
                <p className="text-xs text-emerald-600 font-medium">Verified</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg p-4 text-center">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{missing.length}</p>
                <p className="text-xs text-red-600 font-medium">Missing</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-lg p-4 text-center">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{damaged.length}</p>
                <p className="text-xs text-amber-600 font-medium">Damaged</p>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8">{pending.length}</p>
                <p className="text-xs text-zinc-500 font-medium">Pending</p>
              </div>
            </div>

            {missing.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4" /> Missing Assets Action Plan
                </h4>
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-red-200 dark:border-red-900 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                  {missing.map(item => (
                    <div key={item.id} className="p-3 text-sm flex items-center justify-between">
                      <div>
                        <span className="font-semibold">{item.asset?.name}</span>
                        <span className="text-zinc-500 font-mono ml-2">{item.asset?.tag_number}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500">
                        <span>{item.asset?.status}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-red-600 font-medium bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded">Lost</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {damaged.length > 0 && (
              <div>
                <h4 className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4" /> Damaged Assets Action Plan
                </h4>
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-amber-200 dark:border-amber-900 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                  {damaged.map(item => (
                    <div key={item.id} className="p-3 text-sm flex items-center justify-between">
                      <div>
                        <span className="font-semibold">{item.asset?.name}</span>
                        <span className="text-zinc-500 font-mono ml-2">{item.asset?.tag_number}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500">
                        <span>{item.asset?.status}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-amber-600 font-medium bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded">Maintenance</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Keep Audit Open</Button>
          <Button 
            onClick={handleCloseAudit} 
            disabled={isClosing || pending.length > 0} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isClosing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending.length > 0 ? 'Complete Pending First' : 'Close Audit & Apply Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
