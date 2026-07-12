'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import { Loader2, ArrowDownLeft, CheckCircle2 } from 'lucide-react'

interface ReturnWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assetId: string
  assetName: string
  tagNumber: string
  onSuccess: () => void
}

export function ReturnWizard({ open, onOpenChange, assetId, assetName, tagNumber, onSuccess }: ReturnWizardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [allocationId, setAllocationId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    condition: 'good',
    damageNotes: '',
    accessoriesReturned: true
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (open) {
      fetchActiveAllocation()
      setFormData({ condition: 'good', damageNotes: '', accessoriesReturned: true })
    }
  }, [open, assetId])

  const fetchActiveAllocation = async () => {
    const { data } = await supabase
      .from('asset_allocations')
      .select('id')
      .eq('asset_id', assetId)
      .eq('status', 'active')
      .single()
      
    if (data) {
      setAllocationId(data.id)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allocationId) {
      toast.error('No active allocation found for this asset.')
      return
    }

    setIsLoading(true)
    
    try {
      // 1. Update Allocation Record to Returned
      const { error: allocError } = await supabase.from('asset_allocations').update({
        status: 'returned',
        return_date: new Date().toISOString(),
        return_condition: formData.condition,
        damage_notes: formData.damageNotes || null,
        accessories_returned: formData.accessoriesReturned
      }).eq('id', allocationId)
      
      if (allocError) throw allocError

      // 2. Update Asset Status back to Available
      const { error: assetError } = await supabase.from('assets').update({
        status: 'available',
        owner_id: null,
        condition: formData.condition
      }).eq('id', assetId)

      if (assetError) throw assetError

      // 3. Create Activity Log
      await supabase.from('activity_logs').insert([{
        asset_id: assetId,
        action_type: 'returned',
        description: `Asset returned in ${formData.condition} condition.`
      }])
      
      toast.success(`Asset successfully returned to inventory`)
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to process return')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ArrowDownLeft className="w-5 h-5 text-indigo-600" /> Process Asset Return
          </DialogTitle>
          <DialogDescription>
            Record the return of {assetName} ({tagNumber}) to the central pool.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Return Condition</label>
            <div className="grid grid-cols-5 gap-2">
              {['new', 'good', 'fair', 'poor', 'broken'].map(cond => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setFormData({...formData, condition: cond})}
                  className={`py-2 px-1 text-xs font-medium rounded-md border capitalize transition-colors ${
                    formData.condition === cond 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950 dark:text-indigo-400' 
                      : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.accessoriesReturned} 
                onChange={e => setFormData({...formData, accessoriesReturned: e.target.checked})} 
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" 
              />
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                All accessories returned <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </span>
            </label>
            <p className="text-xs text-zinc-500 pl-7">Ensure all chargers, cables, and bags are accounted for.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Damage Notes or Remarks</label>
            <Textarea 
              placeholder="Describe any damages or missing accessories..."
              value={formData.damageNotes}
              onChange={e => setFormData({...formData, damageNotes: e.target.value})}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading || !allocationId} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Complete Return'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
