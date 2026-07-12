'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

export function DashboardSkeleton() {
  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-[250px] mb-2" />
          <Skeleton className="h-4 w-[350px]" />
        </div>
        <Skeleton className="h-10 w-[120px] rounded-md" />
      </div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
          <CardContent className="p-8 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-8 w-[300px]" />
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[70%]" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-[80px]" />
                  <Skeleton className="h-6 w-[100px]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
          <CardContent className="p-6 h-full flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-[150px]" />
            </div>
            <Skeleton className="flex-1 w-full rounded-xl" />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
            <CardContent className="p-5 flex flex-col justify-between h-[120px]">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-7 w-[80px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 h-[400px] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col">
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-[180px]" /></CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <Skeleton className="h-full w-full rounded-xl opacity-20" />
          </CardContent>
        </Card>
        <Card className="col-span-3 h-[400px] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col">
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-[140px]" /></CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
             {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-[70%]" />
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
