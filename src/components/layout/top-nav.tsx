'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Bell, 
  Menu, 
  Search, 
  User as UserIcon, 
  LogOut,
  Moon,
  Sun,
  Settings
} from 'lucide-react'
import { NotificationWidget } from './notification-widget'
import { GlobalSearch } from './global-search'
import { UserRole } from '@/lib/rbac'
import { User } from '@supabase/supabase-js'
import { useTheme } from 'next-themes'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface TopNavProps {
  user: User
  role: UserRole
  toggleSidebar: () => void
}

export function TopNav({ user, role, toggleSidebar }: TopNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

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
    } catch (e) {
      toast.error('Failed to logout')
    }
  }

  // Get initials for avatar
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  const initials = getInitials(user.user_metadata?.full_name, user.email)
  const displayName = user.user_metadata?.full_name || user.email || 'User'

  return (
    <header className="h-16 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav className="hidden lg:flex items-center gap-6 mr-4">
          <Link href="/dashboard" className={`text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50'}`}>Dashboard</Link>
          <Link href="/assets" className={`text-sm font-medium transition-colors ${isActive('/assets') ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50'}`}>Assets</Link>
          <Link href="/bookings" className={`text-sm font-medium transition-colors ${isActive('/bookings') ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50'}`}>Bookings</Link>
          <Link href="/maintenance" className={`text-sm font-medium transition-colors ${isActive('/maintenance') ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50'}`}>Maintenance</Link>
          <Link href="/audits" className={`text-sm font-medium transition-colors ${isActive('/audits') ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50'}`}>Audits</Link>
          <Link href="/organization" className={`text-sm font-medium transition-colors ${isActive('/organization') ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50'}`}>Organization</Link>
          <Link href="/reports" className={`text-sm font-medium transition-colors ${isActive('/reports') ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50'}`}>Reports</Link>
        </nav>

        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile search icon */}
        <button className="p-2 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors md:hidden">
          <Search className="h-5 w-5" />
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 top-[18px]" />
          <span className="sr-only">Toggle theme</span>
        </button>

        {/* Notifications */}
        <NotificationWidget />

        {/* User Menu */}
        <DropdownMenu>
          {/* @ts-expect-error - Radix UI DropdownMenuTrigger typings conflict */}
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 ml-2 rounded-full outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800">
              <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-800">
                <AvatarFallback className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate">{displayName}</p>
                <p className="text-xs leading-none text-zinc-500 truncate">{user.email}</p>
                <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider mt-1">{role.replace('_', ' ')}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
