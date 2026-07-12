'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AssetDirectory } from '@/features/assets/components/asset-directory'
import { AssetRegistrationDrawer } from '@/features/assets/components/asset-registration-drawer'
import { Button } from '@/components/ui/button'
import { Plus, Sparkles } from 'lucide-react'

export default function AssetsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)

  const handleAddNew = () => {
    setIsDrawerOpen(true)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 h-full flex flex-col"
    >
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Digital Asset Directory</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Explore, manage, and track your organization's physical and digital assets.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsAIChatOpen(!isAIChatOpen)}
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-950"
          >
            <Sparkles className="mr-2 h-4 w-4" /> AssetFlow AI
          </Button>
          <Button onClick={handleAddNew} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
            <Plus className="mr-2 h-4 w-4" /> Register Asset
          </Button>
        </div>
      </div>

      {isAIChatOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-4 shrink-0"
        >
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full">
              <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <input 
                type="text" 
                placeholder='Try: "Show assets without warranty", "Which assets need maintenance?", or "Find Laptop AF-002"' 
                className="w-full bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Ask AI</Button>
          </div>
        </motion.div>
      )}

      <div className="flex-1 min-h-0 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
        <AssetDirectory />
      </div>

      <AssetRegistrationDrawer 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen}
      />
    </motion.div>
  )
}
