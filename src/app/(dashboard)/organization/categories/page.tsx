'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CategoryTable } from '@/features/organization/categories/components/category-table'
import { CategoryFormDrawer } from '@/features/organization/categories/components/category-form-drawer'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function CategoriesPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const handleAddNew = () => {
    setSelectedCategoryId(null)
    setIsDrawerOpen(true)
  }

  const handleEdit = (id: string) => {
    setSelectedCategoryId(id)
    setIsDrawerOpen(true)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Asset Categories</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage classification, depreciation, and custom fields.</p>
        </div>
        <Button onClick={handleAddNew} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <CategoryTable onEdit={handleEdit} />

      <CategoryFormDrawer 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen}
        categoryId={selectedCategoryId}
      />
    </motion.div>
  )
}
