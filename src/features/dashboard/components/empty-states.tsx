'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { FolderSearch, PlusCircle } from 'lucide-react'

export function DashboardEmptyState() {
  return (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm border-dashed">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6"
        >
          <FolderSearch className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
        </motion.div>
        
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">No Assets Found</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-[400px] mb-8 leading-relaxed">
          It looks like there are no assets registered in the system yet. Start by adding your first asset to see the dashboard come alive.
        </p>
        
        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white shadow hover:bg-indigo-700 h-10 px-6 py-2">
          <PlusCircle className="mr-2 h-4 w-4" /> Register First Asset
        </button>
      </CardContent>
    </Card>
  )
}
