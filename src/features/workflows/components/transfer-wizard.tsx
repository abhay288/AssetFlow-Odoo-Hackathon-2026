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
import { Loader2, ArrowRightLeft, User } from 'lucide-react'

interface TransferWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assetId: string
  assetName: string
  tagNumber: string
  currentOwnerId: string | null
  onSuccess: () => void
}

export function TransferWizard({ open, onOpenChange, assetId, assetName, tagNumber, currentOwnerId, onSuccess }: TransferWizardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [employees, setEmployees] = useState<{id: string, name: string}[]>([])
  const [allocationId, setAllocationId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    toEmployeeId: '',
    reason: '',
    conditionAtTransfer: 'good'
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (open) {
      fetchDependencies()
      setFormData({ toEmployeeId: '', reason: '', conditionAtTransfer: 'good' })
    }
  }, [open, assetId])

  const fetchDependencies = async () => {
    // Fetch active employees (excluding current owner)
    const { data: empData } = await supabase
      .from('employees')
      .select('id, profile:profiles(first_name, last_name)')
      .eq('is_active', true)
      .neq('id', currentOwnerId || '00000000-0000-0000-0000-000000000000')
    
    if (empData) {
      const formatted = empData.map((e: any) => {
        const profile = Array.isArray(e.profile) ? e.profile[0] : e.profile
        return { id: e.id, name: `${profile?.first_name} ${profile?.last_name}` }
      })
      setEmployees(formatted)
    }

    // Fetch active allocation
    const { data: allocData } = await supabase
      .from('asset_allocations')
      .select('id')
      .eq('asset_id', assetId)
      .eq('status', 'active')
      .single()
      
    if (allocData) {
      setAllocationId(allocData.id)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentOwnerId) {
      toast.error('Asset does not have a current owner to transfer from.')
      return
    }

    setIsLoading(true)
    
    try {
      // 1. Create Transfer Request (Auto-approved for demo)
      const { data: transferData, error: transferError } = await supabase.from('transfer_requests').insert([{
        asset_id: assetId,
        from_employee_id: currentOwnerId,
        to_employee_id: formData.toEmployeeId,
        status: 'approved',
        reason: formData.reason,
        condition_at_transfer: formData.conditionAtTransfer,
        transfer_notes: 'Auto-approved by admin UI'
      }]).select().single()
      
      if (transferError) throw transferError

      // 2. Close Old Allocation
      if (allocationId) {
        await supabase.from('asset_allocations').update({
          status: 'returned',
          return_date: new Date().toISOString(),
          return_condition: formData.conditionAtTransfer,
          damage_notes: 'Closed via direct transfer'
        }).eq('id', allocationId)
      }

      // 3. Create New Allocation
      await supabase.from('asset_allocations').insert([{
        asset_id: assetId,
        employee_id: formData.toEmployeeId,
        status: 'active',
        purpose: 'Direct Transfer',
        notes: `Transferred directly via request ID ${transferData.id}`
      }])

      // 4. Update Asset Owner
      await supabase.from('assets').update({
        owner_id: formData.toEmployeeId,
        condition: formData.conditionAtTransfer
      }).eq('id', assetId)

      // 5. Activity Log
      const toEmpName = employees.find(e => e.id === formData.toEmployeeId)?.name
      await supabase.from('activity_logs').insert([{
        asset_id: assetId,
        action_type: 'transferred',
        description: `Transferred to ${toEmpName}. Reason: ${formData.reason}`
      }])
      
      toast.success(`Asset successfully transferred to ${toEmpName}`)
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to process transfer')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ArrowRightLeft className="w-5 h-5 text-indigo-600" /> Transfer Asset
          </DialogTitle>
          <DialogDescription>
            Reassign {assetName} ({tagNumber}) to a different employee.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><User className="w-4 h-4 text-zinc-400" /> New Owner</label>
            <select 
              required 
              value={formData.toEmployeeId} 
              onChange={e => setFormData({...formData, toEmployeeId: e.target.value})} 
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <option value="">Select an active employee...</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Condition at Handover</label>
            <div className="grid grid-cols-5 gap-2">
              {['new', 'good', 'fair', 'poor', 'broken'].map(cond => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setFormData({...formData, conditionAtTransfer: cond})}
                  className={`py-2 px-1 text-xs font-medium rounded-md border capitalize transition-colors ${
                    formData.conditionAtTransfer === cond 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950 dark:text-indigo-400' 
                      : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Transfer Reason</label>
            <Textarea 
              required
              placeholder="e.g. Employee changed departments, hardware upgrade..."
              value={formData.reason}
              onChange={e => setFormData({...formData, reason: e.target.value})}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading || !currentOwnerId} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirm Transfer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
