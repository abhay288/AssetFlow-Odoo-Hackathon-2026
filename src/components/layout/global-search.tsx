'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { Search, MonitorSmartphone, Users, Building2, Wrench, Calendar, ClipboardCheck, Sparkles, X, ChevronRight } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [assets, setAssets] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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

  useEffect(() => {
    if (open) {
      const search = async () => {
        if (!query) {
          setAssets([])
          setEmployees([])
          return
        }
        
        const { data: assetData } = await supabase
          .from('assets')
          .select('id, name, tag_number, status')
          .ilike('name', `%${query}%`)
          .limit(5)
          
        const { data: empData } = await supabase
          .from('employees')
          .select('id, first_name, last_name, designation')
          .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
          .limit(5)

        setAssets(assetData || [])
        setEmployees(empData || [])
      }

      const timer = setTimeout(search, 300)
      return () => clearTimeout(timer)
    }
  }, [query, open])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors border border-transparent dark:border-zinc-700 w-full sm:w-64"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search anything...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 font-mono text-[10px] font-medium text-zinc-500 bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-700">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <Dialog open={open} onOpenChange={setOpen}>
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="w-full max-w-xl mx-4 overflow-hidden bg-white dark:bg-zinc-950 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 cmdk-container"
              >
                <Command className="flex flex-col h-full bg-transparent" shouldFilter={false}>
                  <div className="flex items-center px-4 border-b border-zinc-200 dark:border-zinc-800">
                    <Search className="w-5 h-5 text-zinc-500 shrink-0" />
                    <Command.Input
                      autoFocus
                      placeholder="Search assets, employees, or pages..."
                      value={query}
                      onValueChange={setQuery}
                      className="flex-1 h-14 px-4 bg-transparent border-0 outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 text-lg"
                    />
                    <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <Command.List className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                    <Command.Empty className="p-6 text-center text-zinc-500">
                      No results found for "{query}".
                    </Command.Empty>

                    {!query && (
                      <Command.Group heading={<div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Quick Links</div>}>
                        <Command.Item onSelect={() => runCommand(() => router.push('/dashboard'))} className="flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-100 aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-900">
                          <Building2 className="w-4 h-4 mr-3 text-indigo-500" /> Dashboard
                        </Command.Item>
                        <Command.Item onSelect={() => runCommand(() => router.push('/assets'))} className="flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-100 aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-900">
                          <MonitorSmartphone className="w-4 h-4 mr-3 text-emerald-500" /> Assets Directory
                        </Command.Item>
                        <Command.Item onSelect={() => runCommand(() => router.push('/maintenance'))} className="flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-100 aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-900">
                          <Wrench className="w-4 h-4 mr-3 text-amber-500" /> Maintenance
                        </Command.Item>
                        <Command.Item onSelect={() => runCommand(() => router.push('/audits'))} className="flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-100 aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-900">
                          <ClipboardCheck className="w-4 h-4 mr-3 text-red-500" /> Audits
                        </Command.Item>
                      </Command.Group>
                    )}

                    {assets.length > 0 && (
                      <Command.Group heading={<div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-4">Assets</div>}>
                        {assets.map((asset) => (
                          <Command.Item 
                            key={asset.id} 
                            onSelect={() => runCommand(() => router.push(`/assets?search=${asset.tag_number}`))}
                            className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-100 aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-900"
                          >
                            <div className="flex items-center">
                              <MonitorSmartphone className="w-4 h-4 mr-3 text-zinc-400" />
                              <div>
                                <p className="font-medium">{asset.name}</p>
                                <p className="text-xs text-zinc-500 font-mono">{asset.tag_number}</p>
                              </div>
                            </div>
                            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-400 capitalize">{asset.status.replace('_', ' ')}</span>
                          </Command.Item>
                        ))}
                      </Command.Group>
                    )}

                    {employees.length > 0 && (
                      <Command.Group heading={<div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-4">Employees</div>}>
                        {employees.map((emp) => (
                          <Command.Item 
                            key={emp.id} 
                            onSelect={() => runCommand(() => router.push(`/organization?tab=employees&search=${emp.first_name}`))}
                            className="flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-100 aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-900"
                          >
                            <Users className="w-4 h-4 mr-3 text-zinc-400" />
                            <div>
                              <p className="font-medium">{emp.first_name} {emp.last_name}</p>
                              <p className="text-xs text-zinc-500">{emp.designation}</p>
                            </div>
                          </Command.Item>
                        ))}
                      </Command.Group>
                    )}

                    {query.length > 3 && (
                      <Command.Group heading={<div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-4">AI Actions</div>}>
                        <Command.Item 
                          onSelect={() => {
                            // In a real app we'd dispatch an event to open the AI drawer with this query
                            runCommand(() => toast.info(`Asking AI: "${query}"`))
                          }}
                          className="flex items-center px-3 py-3 rounded-lg cursor-pointer bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30"
                        >
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-3">
                            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Ask AssetFlow AI</p>
                            <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">"{query}"</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-indigo-400" />
                        </Command.Item>
                      </Command.Group>
                    )}
                  </Command.List>
                </Command>
              </motion.div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}

function Dialog({ open, onOpenChange, children }: { open: boolean, onOpenChange: (v: boolean) => void, children: React.ReactNode }) {
  // Simple wrapper for Radix Dialog logic
  return (
    <div role="dialog" aria-modal="true">
      {children}
    </div>
  )
}
