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
import { Loader2, UploadCloud, Link as LinkIcon, DollarSign, Calendar, Tag } from 'lucide-react'

interface AssetRegistrationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssetRegistrationDrawer({ open, onOpenChange }: AssetRegistrationDrawerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'financial' | 'lifecycle'>('general')
  
  const [categories, setCategories] = useState<{id: string, name: string, prefix: string}[]>([])
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([])

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    departmentId: '',
    serialNumber: '',
    vendor: '',
    purchaseCost: '',
    purchaseDate: '',
    warrantyStart: '',
    warrantyEnd: '',
    condition: 'new',
    location: '',
    notes: '',
    isSharedResource: false,
    isBookable: true
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (open) {
      fetchDependencies()
      // Reset form
      setFormData({
        name: '', categoryId: '', departmentId: '', serialNumber: '',
        vendor: '', purchaseCost: '', purchaseDate: '', warrantyStart: '',
        warrantyEnd: '', condition: 'new', location: '', notes: '',
        isSharedResource: false, isBookable: true
      })
      setActiveTab('general')
    }
  }, [open])

  const fetchDependencies = async () => {
    const [catRes, deptRes] = await Promise.all([
      supabase.from('asset_categories').select('id, name, prefix'),
      supabase.from('departments').select('id, name')
    ])
    if (catRes.data) setCategories(catRes.data)
    if (deptRes.data) setDepartments(deptRes.data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Auto-generate tag based on category prefix (simplified mockup logic)
      const cat = categories.find(c => c.id === formData.categoryId)
      const prefix = cat ? cat.prefix : 'AST'
      const tagNumber = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`

      const payload = {
        name: formData.name,
        tag_number: tagNumber,
        category_id: formData.categoryId,
        department_id: formData.departmentId || null,
        serial_number: formData.serialNumber || null,
        vendor: formData.vendor || null,
        purchase_cost: formData.purchaseCost ? parseFloat(formData.purchaseCost) : null,
        purchase_date: formData.purchaseDate || null,
        warranty_start: formData.warrantyStart || null,
        warranty_end: formData.warrantyEnd || null,
        condition: formData.condition,
        location: formData.location || null,
        notes: formData.notes || null,
        is_shared_resource: formData.isSharedResource,
        is_bookable: formData.isBookable,
        status: 'available'
      }

      const { error } = await supabase.from('assets').insert([payload])
      if (error) throw error
      
      toast.success(`Asset ${tagNumber} registered successfully!`)
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to register asset')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-0 border-l border-zinc-200 dark:border-zinc-800">
        <div className="bg-white dark:bg-zinc-900 px-6 py-6 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10 shadow-sm">
          <SheetTitle className="text-xl">Register New Asset</SheetTitle>
          <SheetDescription>
            Add a new physical or digital asset to the central directory.
          </SheetDescription>
          
          <div className="flex space-x-1 mt-6 border bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            {(['general', 'financial', 'lifecycle'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
                  activeTab === tab 
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className={activeTab === 'general' ? 'block space-y-6' : 'hidden'}>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Tag className="w-4 h-4 text-indigo-500" /> Basic Information</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Asset Name</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. MacBook Pro M3 Max" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950">
                    <option value="">Select category...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <select value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950">
                    <option value="">Pool Resource (Unassigned)</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Serial Number / IMEI</label>
                <Input value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} placeholder="C02..." />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><UploadCloud className="w-4 h-4 text-indigo-500" /> Primary Image</h3>
              <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <UploadCloud className="w-8 h-8 text-zinc-400 mb-2" />
                <p className="text-sm font-medium">Click or drag image to upload</p>
                <p className="text-xs text-zinc-500">Supports JPG, PNG up to 5MB</p>
              </div>
            </div>
          </div>

          <div className={activeTab === 'financial' ? 'block space-y-6' : 'hidden'}>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-500" /> Acquisition Details</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Vendor / Supplier</label>
                <Input value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})} placeholder="e.g. Apple Store, Dell Technologies" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Purchase Date</label>
                  <Input type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Purchase Cost (USD)</label>
                  <Input type="number" step="0.01" value={formData.purchaseCost} onChange={e => setFormData({...formData, purchaseCost: e.target.value})} placeholder="0.00" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><LinkIcon className="w-4 h-4 text-indigo-500" /> Invoices & Receipts</h3>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-950 flex justify-between items-center">
                <span className="text-sm text-zinc-500">No documents attached</span>
                <Button type="button" variant="outline" size="sm">Attach PDF</Button>
              </div>
            </div>
          </div>

          <div className={activeTab === 'lifecycle' ? 'block space-y-6' : 'hidden'}>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> Warranty & Lifecycle</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Warranty Start</label>
                  <Input type="date" value={formData.warrantyStart} onChange={e => setFormData({...formData, warrantyStart: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Warranty End</label>
                  <Input type="date" value={formData.warrantyEnd} onChange={e => setFormData({...formData, warrantyEnd: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Current Condition</label>
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
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="text-sm font-semibold">Settings & Notes</h3>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formData.isSharedResource} onChange={e => setFormData({...formData, isSharedResource: e.target.checked})} className="rounded text-indigo-600 focus:ring-indigo-500" />
                  Shared Resource
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formData.isBookable} onChange={e => setFormData({...formData, isBookable: e.target.checked})} className="rounded text-indigo-600 focus:ring-indigo-500" />
                  Bookable Asset
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Notes</label>
                <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="resize-none" />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 sticky bottom-0 bg-zinc-50 dark:bg-zinc-950 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Register Asset'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
