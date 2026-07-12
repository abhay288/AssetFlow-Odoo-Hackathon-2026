'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Bell, Menu, Search, User as UserIcon, LogOut,
  Moon, Sun, Settings, Command
} from 'lucide-react'
import { NotificationWidget } from './notification-widget'
import { GlobalSearch } from './global-search'
import { UserRole } from '@/lib/rbac'
import { User } from '@supabase/supabase-js'
import { useTheme } from 'next-themes'
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'

interface TopNavProps {
  user: User
  role: UserRole
  toggleSidebar: () => void
}

const NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Assets', href: '/assets' },
  { label: 'Bookings', href: '/bookings' },
  { label: 'Maintenance', href: '/maintenance' },
  { label: 'Audits', href: '/audits' },
  { label: 'Reports', href: '/reports' },
]

function SearchBar() {
  const [focused, setFocused] = useState(false)
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.includes('Mac'))
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        // Trigger GlobalSearch (already handles its own state)
        document.dispatchEvent(new CustomEvent('open-command-palette'))
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="relative hidden md:block">
      <GlobalSearch />
    </div>
  )
}

export function TopNav({ user, role, toggleSidebar }: TopNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isActive = (path: string) => pathname?.startsWith(path)

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        toast.success('Logged out successfully')
        router.push('/auth/login')
        router.refresh()
      } else {
        toast.error('Failed to logout')
      }
    } catch {
      toast.error('Failed to logout')
    }
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    if (email) return email.substring(0, 2).toUpperCase()
    return 'U'
  }

  const initials = getInitials(user.user_metadata?.full_name, user.email)
  const displayName = user.user_metadata?.full_name || user.email || 'User'

  return (
    <header className="h-16 shrink-0 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl px-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Left — hamburger + nav */}
      <div className="flex items-center gap-3">
        <motion.button
          onClick={toggleSidebar}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </motion.button>

        {/* Nav links — desktop */}
        <nav className="hidden xl:flex items-center gap-1 mr-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
                isActive(link.href)
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {isActive(link.href) && (
                <motion.div
                  layoutId="topnav-active"
                  className="absolute inset-0 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          ))}
        </nav>

        <SearchBar />
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1.5">
        {/* Mobile search */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors md:hidden"
        >
          <Search className="h-4 w-4" />
        </motion.button>

        {/* Theme toggle */}
        {mounted && (
          <motion.button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95, rotate: 15 }}
            className="relative p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors overflow-hidden"
            title="Toggle theme"
          >
            <AnimatePresence mode="wait">
              {theme === 'dark' ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Sun className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Moon className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="sr-only">Toggle theme</span>
          </motion.button>
        )}

        {/* Notifications */}
        <NotificationWidget />

        {/* Divider */}
        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors outline-none group">
            <Avatar className="h-7 w-7 border-2 border-blue-200 dark:border-blue-800 shadow-sm group-hover:border-blue-400 dark:group-hover:border-blue-600 transition-colors">
              <AvatarFallback className="bg-linear-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-none">{displayName.split(' ')[0]}</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 capitalize leading-none mt-0.5">{role.replace('_', ' ')}</p>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-60 rounded-2xl shadow-xl border-zinc-200/80 dark:border-zinc-800 p-1">
            <DropdownMenuLabel className="font-normal px-3 py-2.5">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border-2 border-blue-200 dark:border-blue-800">
                  <AvatarFallback className="bg-linear-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-semibold leading-none truncate text-zinc-900 dark:text-zinc-50">{displayName}</p>
                  <p className="text-xs leading-none text-zinc-500 truncate mt-1">{user.email}</p>
                  <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded-md w-fit">
                    {role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem onClick={() => router.push('/profile')} className="rounded-xl gap-2.5 py-2.5">
              <UserIcon className="h-4 w-4 text-zinc-400" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')} className="rounded-xl gap-2.5 py-2.5">
              <Settings className="h-4 w-4 text-zinc-400" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="rounded-xl gap-2.5 py-2.5 text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
