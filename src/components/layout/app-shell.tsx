'use client'

import React, { useState, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { TopNav } from './top-nav'
import { CommandPalette } from './command-palette'
import { AssetFlowAIAssistant } from './ai-assistant'
import { WelcomeTour } from './welcome-tour'
import { UserRole } from '@/lib/rbac'
import { User } from '@supabase/supabase-js'

interface AppShellProps {
  children: React.ReactNode
  user: User
  role: UserRole
}

export function AppShell({ children, user, role }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex h-screen w-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        isMobile={isMobile} 
        role={role} 
      />
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav 
          user={user} 
          role={role}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl h-full">
            {children}
          </div>
        </main>
      </div>

      <CommandPalette role={role} />
      <AssetFlowAIAssistant />
      <WelcomeTour />
    </div>
  )
}
