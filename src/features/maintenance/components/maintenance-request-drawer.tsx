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
import { Loader2, Wrench, AlertTriangle, FileText } from 'lucide-react'

interface RequestDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function MaintenanceRequestDrawer({ open, onOpenChange, onSuccess }: RequestDrawerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [assets, setAssets] = useState<{id: string, name: string, tag: string}[]>([])

  const [formData, setFormData] = useState({
    assetId: '',
    category: 'General',
    priority: 'medium',
    severity: 'minor',
    description: '',
    expectedDowntime: 0
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (open) {
      fetchAssets()
      setFormData({
        assetId: '', category: 'General', priority: 'medium', severity: 'minor', description: '', expectedDowntime: 0
      })
    }
  }, [open])

  const fetchAssets = async () => {
    // Only allocated or available assets can be repaired (not disposed or lost)
    const { data } = await supabase
      .from('assets')
      .select('id, name, tag_number')
      .in('status', ['allocated', 'available', 'reserved'])
    
    if (data) {
      setAssets(data.map((a: any) => ({ id: a.id, name: a.name, tag: a.tag_number })))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create request (Defaults to 'open')
      const { data: request, error } = await supabase.from('maintenance_requests').insert([{
        asset_id: formData.assetId,
        issue_category: formData.category,
        priority: formData.priority,
        severity: formData.severity,
        issue_description: formData.description,
        expected_downtime_days: formData.expectedDowntime,
        status: 'open'
      }]).select().single()

      if (error) throw error

      // Create Activity Log
      await supabase.from('activity_logs').insert([{
        asset_id: formData.assetId,
        action_type: 'maintenance_requested',
        description: `Maintenance requested: ${formData.category} issue.`
      }])

      toast.success('Maintenance request submitted successfully')
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit request')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-600" /> Raise Maintenance Request
          </SheetTitle>
          <SheetDescription>
            Report an issue with an asset to the maintenance team.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">Asset</label>
            <select 
              required 
              value={formData.assetId} 
              onChange={e => setFormData({...formData, assetId: e.target.value})} 
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <option value="">Select an asset...</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.tag} - {a.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Issue Category</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})} 
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="Electrical">Electrical</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Software">Software</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Network">Network</option>
                <option value="Safety">Safety</option>
                <option value="General">General</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select 
                value={formData.priority} 
                onChange={e => setFormData({...formData, priority: e.target.value})} 
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Issue Description</label>
            <Textarea 
              required
              placeholder="Provide a detailed description of the problem..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="resize-none h-32"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500">Expected Downtime (Days)</label>
            <Input 
              type="number"
              min="0"
              value={formData.expectedDowntime}
              onChange={e => setFormData({...formData, expectedDowntime: parseInt(e.target.value) || 0})}
            />
          </div>

          <SheetFooter className="mt-8">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
