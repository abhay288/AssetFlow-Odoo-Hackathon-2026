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
import { Loader2, Calendar, Clock, MapPin, Users, Tag } from 'lucide-react'

interface BookingDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  initialDate?: Date
}

export function BookingDrawer({ open, onOpenChange, onSuccess, initialDate }: BookingDrawerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [resources, setResources] = useState<{id: string, name: string, category: string}[]>([])
  const [employees, setEmployees] = useState<{id: string, name: string}[]>([])

  const [formData, setFormData] = useState({
    assetId: '',
    employeeId: '',
    purpose: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
    priority: 'normal',
    attendees: [] as string[],
    remarks: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (open) {
      fetchDependencies()
      
      const initDateStr = initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      setFormData(prev => ({
        ...prev,
        startDate: initDateStr,
        endDate: initDateStr,
        assetId: prev.assetId,
        employeeId: prev.employeeId,
      }))
    }
  }, [open, initialDate])

  const fetchDependencies = async () => {
    // Fetch bookable assets
    const { data: assetsData } = await supabase
      .from('assets')
      .select('id, name, category:asset_categories(name)')
      .eq('is_bookable', true)
      .in('status', ['available'])
    
    if (assetsData) {
      setResources(assetsData.map((a: any) => ({
        id: a.id,
        name: a.name,
        category: a.category?.name || 'Unknown'
      })))
    }

    // Fetch active employees
    const { data: empData } = await supabase
      .from('employees')
      .select('id, profile:profiles(first_name, last_name)')
      .eq('is_active', true)
    
    if (empData) {
      setEmployees(empData.map((e: any) => {
        const profile = Array.isArray(e.profile) ? e.profile[0] : e.profile
        return { id: e.id, name: `${profile?.first_name} ${profile?.last_name}` }
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const startIso = new Date(`${formData.startDate}T${formData.startTime}:00Z`).toISOString()
      const endIso = new Date(`${formData.endDate}T${formData.endTime}:00Z`).toISOString()

      if (new Date(startIso) >= new Date(endIso)) {
        throw new Error('End time must be after start time')
      }

      const { error } = await supabase.from('bookings').insert([{
        asset_id: formData.assetId,
        employee_id: formData.employeeId,
        status: 'approved', // Auto-approved for demo
        start_time: startIso,
        end_time: endIso,
        purpose: formData.purpose,
        priority: formData.priority,
        remarks: formData.remarks,
        attendees: formData.attendees
      }])

      if (error) {
        if (error.message.includes('no_overlapping_bookings')) {
          throw new Error('This resource is already booked during the selected time period.')
        }
        throw error
      }

      toast.success('Booking confirmed successfully')
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" /> New Booking
          </SheetTitle>
          <SheetDescription>
            Schedule a shared resource. Conflicts will be automatically rejected.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-zinc-400" /> Resource</label>
            <select 
              required 
              value={formData.assetId} 
              onChange={e => setFormData({...formData, assetId: e.target.value})} 
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <option value="">Select a bookable resource...</option>
              {resources.map(res => <option key={res.id} value={res.id}>{res.category} - {res.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><Users className="w-4 h-4 text-zinc-400" /> Booked By</label>
            <select 
              required 
              value={formData.employeeId} 
              onChange={e => setFormData({...formData, employeeId: e.target.value})} 
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <option value="">Select an employee...</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><Tag className="w-4 h-4 text-zinc-400" /> Booking Purpose</label>
            <Input 
              required 
              placeholder="e.g. Q3 Planning Meeting" 
              value={formData.purpose}
              onChange={e => setFormData({...formData, purpose: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input 
                required
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <Input 
                required
                type="time"
                value={formData.startTime}
                onChange={e => setFormData({...formData, startTime: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input 
                required
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <Input 
                required
                type="time"
                value={formData.endTime}
                onChange={e => setFormData({...formData, endTime: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Remarks / Needs</label>
            <Textarea 
              placeholder="E.g. Requires extra seating, projector setup..."
              value={formData.remarks}
              onChange={e => setFormData({...formData, remarks: e.target.value})}
              className="resize-none"
            />
          </div>

          <SheetFooter className="mt-8">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Booking
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
