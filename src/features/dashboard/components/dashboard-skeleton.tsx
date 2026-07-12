'use client'

import React from 'react'
import { motion } from 'framer-motion'

function SkeletonBox({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-shimmer rounded-2xl ${className}`} />
  )
}

function SkeletonLine({ width = 'full', height = 'h-3' }: { width?: string; height?: string }) {
  const widthClass = width === 'full' ? 'w-full' : `w-${width}`
  return <div className={`animate-shimmer rounded-full ${heightClass(height)} ${widthClass}`} />
}

function heightClass(h: string) { return h }

export function DashboardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      {/* Hero skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-8 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-3 flex-1">
                <div className="animate-shimmer rounded-full h-3.5 w-24" />
                <div className="animate-shimmer rounded-full h-7 w-48" />
                <div className="animate-shimmer rounded-full h-3 w-64" />
              </div>
              <div className="space-y-2 items-end flex flex-col">
                <div className="animate-shimmer rounded-full h-3 w-20" />
                <div className="animate-shimmer rounded-full h-3 w-32" />
                <div className="animate-shimmer w-20 h-20" style={{ borderRadius: '50%' }} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-shimmer rounded-xl h-20" />
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-shimmer rounded-full h-3 w-24" />
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-sm space-y-4">
          <div className="animate-shimmer rounded-full h-3 w-28" />
          <div className="animate-shimmer rounded-xl h-32 w-full" />
          <div className="space-y-2">
            <div className="animate-shimmer rounded-full h-3 w-full" />
            <div className="animate-shimmer rounded-full h-3 w-4/5" />
            <div className="animate-shimmer rounded-full h-3 w-3/5" />
          </div>
        </div>
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="animate-shimmer rounded-xl h-10 w-10" />
              <div className="animate-shimmer rounded-full h-5 w-14" />
            </div>
            <div className="space-y-1.5">
              <div className="animate-shimmer rounded-full h-8 w-20" />
              <div className="animate-shimmer rounded-full h-3 w-24" />
            </div>
            <div className="animate-shimmer rounded h-7 w-full opacity-50" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-sm">
            <div className="animate-shimmer rounded-full h-4 w-32 mb-6" />
            <div className="animate-shimmer rounded-xl h-48 w-full" />
          </div>
        ))}
      </div>

      {/* Bottom row skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-sm space-y-4">
          <div className="animate-shimmer rounded-full h-4 w-36" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="animate-shimmer rounded-full h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="animate-shimmer rounded-full h-3 w-1/2" />
                <div className="animate-shimmer rounded-full h-2.5 w-3/4" />
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-sm">
            <div className="animate-shimmer rounded-full h-4 w-28 mb-4" />
            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-shimmer rounded-xl h-20" />
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-sm h-48">
            <div className="animate-shimmer rounded-full h-4 w-24 mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-shimmer rounded-xl h-8 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
