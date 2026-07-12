'use client'

import React, { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import { Loader2, Play, User, Calendar, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface AllocationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assetId: string
  assetName: string
  tagNumber: string
  onSuccess: () => void
}

export function AllocationDrawer({ open, onOpenChange, assetId, assetName, tagNumber, onSuccess }: AllocationDrawerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [employees, setEmployees] = useState<{id: string, name: string}[]>([])

  const [formData, setFormData] = useState({
    employeeId: '',
    purpose: '',
    expectedReturnDate: '',
    priority: 'normal',
    notes: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (open) {
      fetchEmployees()
      setFormData({
        employeeId: '', purpose: '', expectedReturnDate: '', priority: 'normal', notes: ''
      })
    }
  }, [open])

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from('employees')
      .select('id, profile:profiles(first_name, last_name)')
      .eq('is_active', true)
    
    if (data) {
      const formatted = data.map((e: any) => {
        const profile = Array.isArray(e.profile) ? e.profile[0] : e.profile
        return { id: e.id, name: `${profile?.first_name} ${profile?.last_name}` }
      })
      setEmployees(formatted)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // 1. Create Allocation Record
      const { error: allocError } = await supabase.from('asset_allocations').insert([{
        asset_id: assetId,
        employee_id: formData.employeeId,
        status: 'active',
        purpose: formData.purpose,
        expected_return_date: formData.expectedReturnDate || null,
        priority: formData.priority,
        notes: formData.notes
      }])
      
      if (allocError) throw allocError

      // 2. Update Asset Status and Owner
      const { error: assetError } = await supabase.from('assets').update({
        status: 'allocated',
        owner_id: formData.employeeId
      }).eq('id', assetId)

      if (assetError) throw assetError

      // 3. Create Activity Log
      await supabase.from('activity_logs').insert([{
        asset_id: assetId,
        action_type: 'allocated',
        description: `Allocated to employee for: ${formData.purpose}`
      }])
      
      toast.success(`Asset successfully allocated`)
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to allocate asset')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-indigo-600" /> Allocate Asset
          </SheetTitle>
          <SheetDescription>
            Assign this asset to an employee. It will become unavailable for others until returned.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 mb-6 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">SELECTED ASSET</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{assetName}</p>
          </div>
          <Badge variant="outline" className="font-mono">{tagNumber}</Badge>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><User className="w-4 h-4 text-zinc-400" /> Assign To Employee</label>
            <select 
              required 
              value={formData.employeeId} 
              onChange={e => setFormData({...formData, employeeId: e.target.value})} 
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <option value="">Select an active employee...</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><Tag className="w-4 h-4 text-zinc-400" /> Allocation Purpose</label>
            <Input 
              required 
              placeholder="e.g. New hire onboarding, Project X" 
              value={formData.purpose}
              onChange={e => setFormData({...formData, purpose: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-zinc-400" /> Expected Return</label>
              <Input 
                type="date"
                value={formData.expectedReturnDate}
                onChange={e => setFormData({...formData, expectedReturnDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select 
                value={formData.priority} 
                onChange={e => setFormData({...formData, priority: e.target.value})} 
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Remarks / Handover Notes</label>
            <Textarea 
              placeholder="Include accessories provided like chargers, bags..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="resize-none"
            />
          </div>

          <SheetFooter className="mt-8">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Allocation
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
