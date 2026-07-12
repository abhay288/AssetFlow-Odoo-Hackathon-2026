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
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface DepartmentFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  departmentId: string | null
}

export function DepartmentFormDrawer({ open, onOpenChange, departmentId }: DepartmentFormDrawerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', code: '', parent_id: '' })
  const [parents, setParents] = useState<{ id: string, name: string }[]>([])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (open) {
      fetchParents()
      if (departmentId) {
        fetchDepartment()
      } else {
        setFormData({ name: '', code: '', parent_id: '' })
      }
    }
  }, [open, departmentId])

  const fetchParents = async () => {
    const { data } = await supabase.from('departments').select('id, name').neq('id', departmentId || '00000000-0000-0000-0000-000000000000')
    if (data) setParents(data)
  }

  const fetchDepartment = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from('departments').select('*').eq('id', departmentId).single()
      if (error) throw error
      if (data) {
        setFormData({ name: data.name, code: data.code, parent_id: data.parent_id || '' })
      }
    } catch (error) {
      toast.error('Failed to load department')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        parent_id: formData.parent_id || null
      }

      if (departmentId) {
        const { error } = await supabase.from('departments').update(payload).eq('id', departmentId)
        if (error) throw error
        toast.success('Department updated successfully')
      } else {
        const { error } = await supabase.from('departments').insert([payload])
        if (error) throw error
        toast.success('Department created successfully')
      }
      
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{departmentId ? 'Edit Department' : 'New Department'}</SheetTitle>
          <SheetDescription>
            {departmentId ? 'Make changes to the department here.' : 'Create a new department for your organization.'}
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Department Name</label>
            <Input 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Human Resources" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Department Code</label>
            <Input 
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. HR-01" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Parent Department (Optional)</label>
            <select 
              value={formData.parent_id}
              onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
              className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-400 dark:focus:ring-indigo-500 dark:focus:ring-offset-zinc-950"
            >
              <option value="">None</option>
              {parents.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <SheetFooter className="mt-8">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {departmentId ? 'Save Changes' : 'Create Department'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
