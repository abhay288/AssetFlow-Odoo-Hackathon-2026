'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calculator, 
  Calendar, 
  CreditCard, 
  Settings, 
  Smile, 
  User,
  LayoutDashboard,
  Building2,
  Monitor,
  Users,
  CalendarDays,
  Wrench,
  ShieldCheck,
  PieChart,
  Bell
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { UserRole, hasRole, hasAnyRole } from '@/lib/rbac'

interface CommandPaletteProps {
  role: UserRole
}

export function CommandPalette({ role }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  const canAccess = (allowedRoles?: UserRole[]) => {
    if (!allowedRoles) return true
    return hasAnyRole(role, allowedRoles)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          
          {canAccess(['admin', 'asset_manager']) && (
            <CommandItem onSelect={() => runCommand(() => router.push('/organization'))}>
              <Building2 className="mr-2 h-4 w-4" />
              <span>Organization</span>
            </CommandItem>
          )}
          
          <CommandItem onSelect={() => runCommand(() => router.push('/assets'))}>
            <Monitor className="mr-2 h-4 w-4" />
            <span>Assets</span>
          </CommandItem>
          
          {canAccess(['admin', 'asset_manager', 'dept_head']) && (
            <CommandItem onSelect={() => runCommand(() => router.push('/allocation'))}>
              <Users className="mr-2 h-4 w-4" />
              <span>Allocation</span>
            </CommandItem>
          )}
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(() => router.push('/profile'))}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          
          {canAccess(['admin']) && (
            <CommandItem onSelect={() => runCommand(() => router.push('/settings'))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
