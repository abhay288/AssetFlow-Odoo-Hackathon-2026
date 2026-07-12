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
import { Loader2, ClipboardList } from 'lucide-react'

interface CreateAuditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateAuditDrawer({ open, onOpenChange, onSuccess }: CreateAuditDrawerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([])

  const [formData, setFormData] = useState({
    name: '',
    departmentId: '',
    scope: 'all',
    startDate: new Date().toISOString().split('T')[0],
    priority: 'normal',
    description: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (open) {
      fetchDepartments()
      setFormData(prev => ({ ...prev, name: `Audit Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}` }))
    }
  }, [open])

  const fetchDepartments = async () => {
    const { data } = await supabase.from('departments').select('id, name').order('name')
    if (data) setDepartments(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 1. Create Audit Cycle
      const { data: cycle, error: cycleError } = await supabase.from('audit_cycles').insert([{
        name: formData.name,
        department_id: formData.departmentId || null,
        scope: formData.scope,
        priority: formData.priority,
        description: formData.description,
        status: 'planned',
        start_date: formData.startDate
      }]).select().single()

      if (cycleError) throw cycleError

      // 2. Fetch Assets for scope
      let assetQuery = supabase.from('assets').select('id, employee_id').in('status', ['available', 'allocated', 'reserved'])
      
      if (formData.departmentId) {
        assetQuery = assetQuery.eq('department_id', formData.departmentId)
      }

      const { data: assets, error: assetError } = await assetQuery
      if (assetError) throw assetError

      // 3. Create Audit Items
      if (assets && assets.length > 0) {
        const auditItems = assets.map(asset => ({
          audit_cycle_id: cycle.id,
          asset_id: asset.id,
          expected_employee_id: asset.employee_id,
          status: 'pending'
        }))

        const { error: itemsError } = await supabase.from('audit_items').insert(auditItems)
        if (itemsError) throw itemsError
      }

      toast.success(`Audit cycle created with ${assets?.length || 0} assets to verify.`)
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create audit cycle')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" /> New Audit Cycle
          </SheetTitle>
          <SheetDescription>
            Plan a new physical asset verification cycle.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Audit Name</label>
            <Input 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Department Scope</label>
              <select 
                value={formData.departmentId} 
                onChange={e => setFormData({...formData, departmentId: e.target.value})} 
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Asset Scope</label>
              <select 
                value={formData.scope} 
                onChange={e => setFormData({...formData, scope: e.target.value})} 
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="all">All IT & Non-IT</option>
                <option value="it_only">IT Assets Only</option>
                <option value="high_value">High Value Only</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input 
                type="date"
                required
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select 
                value={formData.priority} 
                onChange={e => setFormData({...formData, priority: e.target.value})} 
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Compliance Critical</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              placeholder="Provide instructions for the auditors..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="resize-none"
            />
          </div>

          <SheetFooter className="mt-8">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Audit
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
