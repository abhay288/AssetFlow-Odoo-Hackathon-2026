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
import { Textarea } from '@/components/ui/textarea'

interface CategoryFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryId: string | null
}

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#64748b', // Slate
]

export function CategoryFormDrawer({ open, onOpenChange, categoryId }: CategoryFormDrawerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    prefix: '',
    description: '',
    color: '#6366f1',
    warranty_period_months: '12',
    maintenance_cycle_days: '90'
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (open) {
      if (categoryId) {
        fetchCategory()
      } else {
        setFormData({
          name: '', prefix: '', description: '', color: '#6366f1', 
          warranty_period_months: '12', maintenance_cycle_days: '90'
        })
      }
    }
  }, [open, categoryId])

  const fetchCategory = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from('asset_categories').select('*').eq('id', categoryId).single()
      if (error) throw error
      if (data) {
        setFormData({
          name: data.name,
          prefix: data.prefix,
          description: data.description || '',
          color: data.color || '#6366f1',
          warranty_period_months: data.warranty_period_months?.toString() || '12',
          maintenance_cycle_days: data.maintenance_cycle_days?.toString() || '90'
        })
      }
    } catch (error) {
      toast.error('Failed to load category')
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
        prefix: formData.prefix,
        description: formData.description,
        color: formData.color,
        warranty_period_months: parseInt(formData.warranty_period_months),
        maintenance_cycle_days: parseInt(formData.maintenance_cycle_days)
      }

      if (categoryId) {
        const { error } = await supabase.from('asset_categories').update(payload).eq('id', categoryId)
        if (error) throw error
        toast.success('Category updated successfully')
      } else {
        const { error } = await supabase.from('asset_categories').insert([payload])
        if (error) throw error
        toast.success('Category created successfully')
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
          <SheetTitle>{categoryId ? 'Edit Asset Category' : 'New Asset Category'}</SheetTitle>
          <SheetDescription>
            {categoryId ? 'Modify the classification and tracking defaults.' : 'Create a new classification for physical or digital assets.'}
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Category Name</label>
            <Input 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Laptops & Computers" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Prefix / Tag ID</label>
            <Input 
              required
              value={formData.prefix}
              onChange={(e) => setFormData({ ...formData, prefix: e.target.value.toUpperCase() })}
              placeholder="e.g. LPT" 
            />
            <p className="text-xs text-zinc-500">Assets will be tagged like: {formData.prefix || 'LPT'}-0001</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Description</label>
            <Textarea 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of what belongs in this category..." 
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Identifier Color</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color ? 'border-zinc-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Warranty (Months)</label>
              <Input 
                type="number"
                min="0"
                value={formData.warranty_period_months}
                onChange={(e) => setFormData({ ...formData, warranty_period_months: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Maint. Cycle (Days)</label>
              <Input 
                type="number"
                min="0"
                value={formData.maintenance_cycle_days}
                onChange={(e) => setFormData({ ...formData, maintenance_cycle_days: e.target.value })}
              />
            </div>
          </div>

          <SheetFooter className="mt-8">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {categoryId ? 'Save Changes' : 'Create Category'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
