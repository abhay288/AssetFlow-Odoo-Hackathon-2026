'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Building2, 
  Monitor, 
  Users, 
  CalendarDays, 
  Wrench, 
  ShieldCheck, 
  PieChart, 
  Bell, 
  Settings, 
  User,
  ChevronLeft,
  X
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
  { name: 'Audit', href: '/audit', icon: ShieldCheck, allowedRoles: ['admin'] },
  { name: 'Reports', href: '/reports', icon: PieChart, allowedRoles: ['admin', 'asset_manager', 'dept_head'] },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings, allowedRoles: ['admin'] },
  { name: 'Profile', href: '/profile', icon: User },
]

export function Sidebar({ isOpen, setIsOpen, isMobile, role }: SidebarProps) {
  const pathname = usePathname()

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 shadow-sm relative">
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
            <span className="text-white dark:text-zinc-900 font-bold text-sm">AF</span>
          </div>
          {isOpen && (
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white"
            >
              AssetFlow
            </motion.span>
          )}
        </div>
        
        {isMobile && (
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide relative">
        <nav className="space-y-1 px-3">
          {NAVIGATION.map((item) => {
            const isActive = pathname.startsWith(item.href)
            
            const linkContent = (
              <Link
                href={item.href}
                className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title={!isOpen ? item.name : undefined}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`} />
                {isOpen && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate">
                    {item.name}
                  </motion.span>
                )}
                {isActive && isOpen && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute left-0 w-1 h-8 bg-zinc-900 dark:bg-white rounded-r-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            )

            // Wrap with RoleGate if the item has allowedRoles
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
      
      {!isMobile && (
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-transform duration-200"
            style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      )}
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
              className="fixed inset-0 z-40 bg-zinc-900/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
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
      animate={{ width: isOpen ? 256 : 80 }}
      className="z-30 hidden lg:block shrink-0 h-full relative"
      transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
    >
      {sidebarContent}
    </motion.div>
  )
}
