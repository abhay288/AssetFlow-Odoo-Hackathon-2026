'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { EmployeeTable } from '@/features/organization/employees/components/employee-table'
import { EmployeeFormDrawer } from '@/features/organization/employees/components/employee-form-drawer'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function EmployeesPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)

  const handleAddNew = () => {
    setSelectedEmployeeId(null)
    setIsDrawerOpen(true)
  }

  const handleEdit = (id: string) => {
    setSelectedEmployeeId(id)
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
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Employee Directory</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your workforce, departments, and roles.</p>
        </div>
        <Button onClick={handleAddNew} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      <EmployeeTable onEdit={handleEdit} />

      <EmployeeFormDrawer 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen}
        employeeId={selectedEmployeeId}
      />
    </motion.div>
  )
}
