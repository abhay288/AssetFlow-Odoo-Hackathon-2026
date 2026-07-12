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

interface EmployeeFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId: string | null
}

export function EmployeeFormDrawer({ open, onOpenChange, employeeId }: EmployeeFormDrawerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([])
  const [roles, setRoles] = useState<{id: string, name: string}[]>([])
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    departmentId: '',
    roleId: '',
    employeeCode: '',
    phone: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (open) {
      fetchDependencies()
      if (employeeId) {
        fetchEmployee()
      } else {
        setFormData({
          firstName: '', lastName: '', email: '', position: '',
          departmentId: '', roleId: '', employeeCode: '', phone: ''
        })
      }
    }
  }, [open, employeeId])

  const fetchDependencies = async () => {
    const [deptRes, roleRes] = await Promise.all([
      supabase.from('departments').select('id, name'),
      supabase.from('roles').select('id, name')
    ])
    if (deptRes.data) setDepartments(deptRes.data)
    if (roleRes.data) setRoles(roleRes.data)
  }

  const fetchEmployee = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id, employee_code, position, phone, department_id,
          profile:profiles(first_name, last_name, email, role_id)
        `)
        .eq('id', employeeId)
        .single()

      if (error) throw error
      if (data) {
        const profile: any = Array.isArray(data.profile) ? data.profile[0] : data.profile
        setFormData({
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          email: profile?.email || '',
          position: data.position || '',
          departmentId: data.department_id || '',
          roleId: profile?.role_id || '',
          employeeCode: data.employee_code || '',
          phone: data.phone || ''
        })
      }
    } catch (error) {
      toast.error('Failed to load employee')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // In a real application, creating an employee involves creating an auth user first.
      // We will simulate a success toast for the UI mockup.
      await new Promise(r => setTimeout(r, 1000))
      
      if (employeeId) {
        toast.success('Employee profile updated successfully')
      } else {
        toast.success('Employee created and invitation sent')
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
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{employeeId ? 'Edit Employee' : 'New Employee'}</SheetTitle>
          <SheetDescription>
            {employeeId ? 'Update employee details and assignments.' : 'Add a new employee to the directory.'}
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">First Name</label>
              <Input 
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Jane" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Last Name</label>
              <Input 
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Work Email</label>
            <Input 
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jane.doe@company.com" 
              disabled={!!employeeId} // Can't easily change email without auth flow
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Employee Code</label>
              <Input 
                required
                value={formData.employeeCode}
                onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value.toUpperCase() })}
                placeholder="EMP-001" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Phone</label>
              <Input 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 ..." 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Job Title / Position</label>
            <Input 
              required
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Senior Developer" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Department</label>
            <select 
              required
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            >
              <option value="">Select a department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">System Role</label>
            <select 
              required
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 capitalize"
            >
              <option value="">Select a role</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name.replace('_', ' ')}</option>
              ))}
            </select>
            <p className="text-xs text-zinc-500">Only Admins can assign system roles.</p>
          </div>

          <SheetFooter className="mt-8">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {employeeId ? 'Save Changes' : 'Create Employee'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
