'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building2, Users, Tags, Shield } from 'lucide-react'

const TABS = [
  { name: 'Departments', href: '/organization/departments', icon: Building2 },
  { name: 'Employees', href: '/organization/employees', icon: Users },
  { name: 'Categories', href: '/organization/categories', icon: Tags },
  { name: 'Roles', href: '/organization/roles', icon: Shield },
]

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Master Data</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your organization's core foundation.</p>
      </div>

      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.href)
            
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`
                  group relative min-w-0 overflow-hidden py-4 px-1 text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400
                  ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-400'}
                `}
              >
                <div className="flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="org-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="pt-2">
        {children}
      </div>
    </div>
  )
}
