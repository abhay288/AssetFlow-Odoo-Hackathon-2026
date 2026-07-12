'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { LayoutGrid } from 'lucide-react'
import { useParams } from 'next/navigation'

export default function CatchAllPage() {
  const params = useParams()
  const slugArray = params.slug as string[]
  const pageName = slugArray?.[0] || 'Page'
  const title = pageName.charAt(0).toUpperCase() + pageName.slice(1)

  return (
    <motion.div 
      className="space-y-6 h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your {pageName} details here.</p>
      </div>

      <Card className="flex-1 border-dashed border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-center min-h-[400px]">
        <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="h-20 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500"
          >
            <LayoutGrid className="h-10 w-10" />
          </motion.div>
          <div className="text-center space-y-2 max-w-sm">
            <h3 className="font-semibold text-xl text-zinc-900 dark:text-zinc-100">No data available</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              This module will be populated with data in the next phase. The UI shell and RBAC protection are already active.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
