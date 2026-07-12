'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  Menu, 
  Search, 
  User as UserIcon, 
  LogOut,
  Moon,
  Sun
} from 'lucide-react'
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
  const { theme, setTheme } = useTheme()

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

        {/* Global Search trigger */}
        <button 
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all w-64"
        >
          <Search className="h-4 w-4" />
          <span>Search...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 px-1.5 font-mono text-[10px] font-medium text-zinc-500 opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
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
        <button className="relative p-2 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-zinc-950" />
        </button>

        {/* User Menu */}
        <DropdownMenu>
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
