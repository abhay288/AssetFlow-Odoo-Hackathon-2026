'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function DashboardPage() {
  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Overview of your asset management system.</p>
        </div>
      </motion.div>

      {/* KPI Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">
                  <Skeleton className="h-4 w-[100px]" />
                </CardTitle>
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Skeleton className="h-8 w-[60px]" />
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  <Skeleton className="h-3 w-[120px]" />
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <motion.div variants={itemVariants} className="col-span-4">
          <Card className="h-[400px] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col">
            <CardHeader>
              <CardTitle><Skeleton className="h-6 w-[150px]" /></CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center justify-center text-zinc-400 space-y-4 w-full h-full">
                <Skeleton className="h-full w-full rounded-xl opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants} className="col-span-3">
          <Card className="h-[400px] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col">
            <CardHeader>
              <CardTitle><Skeleton className="h-6 w-[120px]" /></CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-[80%]" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
