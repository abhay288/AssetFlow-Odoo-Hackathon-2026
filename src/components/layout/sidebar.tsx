'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, Building2, Monitor, Users, CalendarDays,
  Wrench, ShieldCheck, PieChart, Bell, Settings, User,
  ChevronLeft, X, Zap
} from 'lucide-react'
import { UserRole } from '@/lib/rbac'
import { RoleGate } from '../auth/role-gate'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  isMobile: boolean
  role: UserRole
}

const NAVIGATION = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Organization', href: '/organization', icon: Building2, allowedRoles: ['admin', 'asset_manager'] },
  { name: 'Assets', href: '/assets', icon: Monitor },
  { name: 'Allocation', href: '/allocation', icon: Users, allowedRoles: ['admin', 'asset_manager', 'dept_head'] },
  { name: 'Bookings', href: '/bookings', icon: CalendarDays },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench, allowedRoles: ['admin', 'asset_manager'] },
  { name: 'Audit', href: '/audits', icon: ShieldCheck, allowedRoles: ['admin'] },
  { name: 'Reports', href: '/reports', icon: PieChart, allowedRoles: ['admin', 'asset_manager', 'dept_head'] },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings, allowedRoles: ['admin'] },
  { name: 'Profile', href: '/profile', icon: User },
]

export function Sidebar({ isOpen, setIsOpen, isMobile, role }: SidebarProps) {
  const pathname = usePathname()

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-xl relative">
      {/* Logo area */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <Link href="/dashboard" className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Image src="/assets/assetflow-logo.png" alt="AssetFlow" width={32} height={32} className="rounded-xl shadow-sm" />
          </motion.div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-white">AssetFlow</span>
              <div className="flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-blue-500" />
                <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase">Enterprise</span>
              </div>
            </motion.div>
          )}
        </Link>

        {isMobile && (
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">
        <nav className="space-y-0.5 px-2">
          {isOpen && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 px-3 py-2 mb-1"
            >
              Navigation
            </motion.p>
          )}
          {NAVIGATION.map((item) => {
            const isActive = pathname.startsWith(item.href)

            const linkContent = (
              <Link
                href={item.href}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
                title={!isOpen ? item.name : undefined}
              >
                {/* Active background */}
                {isActive && (
                  <motion.div
                    layoutId="active-sidebar-bg"
                    className="absolute inset-0 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Active left accent bar */}
                {isActive && (
                  <motion.div
                    layoutId="active-sidebar-bar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-linear-to-b from-blue-500 to-indigo-500"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  className="relative z-10 shrink-0"
                  animate={{
                    scale: isActive ? 1.05 : 1,
                  }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <item.icon className={`h-4 w-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'} transition-colors`} />
                </motion.div>

                {/* Label */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="relative z-10 truncate"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip when collapsed */}
                {!isOpen && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-zinc-900 dark:bg-zinc-700 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg z-50">
                    {item.name}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-zinc-900 dark:border-r-zinc-700" />
                  </div>
                )}
              </Link>
            )

            if (item.allowedRoles) {
              return (
                <RoleGate
                  key={item.name}
                  userRole={role}
                  allowedRoles={item.allowedRoles as UserRole[]}
                >
                  {linkContent}
                </RoleGate>
              )
            }

            return <div key={item.name}>{linkContent}</div>
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-200/60 dark:border-zinc-800/60">
        {/* Version badge */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 pt-3 pb-1"
          >
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">v2.0.0 · All systems operational</span>
            </div>
          </motion.div>
        )}

        {/* Collapse toggle */}
        {!isMobile && (
          <div className="p-2 flex justify-center">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
              animate={{ rotate: isOpen ? 0 : 180 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-zinc-900/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.32 }}
              className="fixed inset-y-0 left-0 z-50 w-72"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 256 : 72 }}
      className="z-30 hidden lg:block shrink-0 h-full relative"
      transition={{ type: 'spring', bounce: 0, duration: 0.32 }}
    >
      {sidebarContent}
    </motion.div>
  )
}
