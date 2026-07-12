'use client'

import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { PlusCircle, HandCoins, CalendarPlus, Wrench, ShieldAlert, FileText, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

const actions = [
  { id: 1, title: 'Register Asset', icon: PlusCircle, href: '/assets?action=new', gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/30', glow: '#3b82f6' },
  { id: 2, title: 'Allocate Asset', icon: HandCoins, href: '/allocation?action=new', gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/30', glow: '#10b981' },
  { id: 3, title: 'Book Resource', icon: CalendarPlus, href: '/bookings?action=new', gradient: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/30', glow: '#8b5cf6' },
  { id: 4, title: 'Maintenance', icon: Wrench, href: '/maintenance?action=new', gradient: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/30', glow: '#f59e0b' },
  { id: 5, title: 'Start Audit', icon: ShieldAlert, href: '/audits?action=new', gradient: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/30', glow: '#6366f1' },
  { id: 6, title: 'Generate Report', icon: FileText, href: '/reports', gradient: 'from-cyan-500 to-cyan-600', shadow: 'shadow-cyan-500/30', glow: '#06b6d4' },
]

function RippleButton({ action }: { action: typeof actions[0] }) {
  const router = useRouter()
  const buttonRef = useRef<HTMLButtonElement>(null)

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current
    if (!button) return
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    const ripple = document.createElement('span')
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255,255,255,0.35);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple-anim 0.55s ease-out forwards;
      pointer-events: none;
    `
    button.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
  }

  return (
    <motion.button
      ref={buttonRef}
      onClick={(e) => { createRipple(e); router.push(action.href) }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="relative overflow-hidden flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm group hover:shadow-md transition-all duration-200 cursor-pointer"
      style={{
        '--glow-color': action.glow,
      } as React.CSSProperties}
    >
      {/* Hover gradient background */}
      <div className={`absolute inset-0 bg-linear-to-br ${action.gradient} opacity-0 group-hover:opacity-[0.07] dark:group-hover:opacity-[0.12] transition-opacity duration-200 rounded-xl`} />

      {/* Glow on hover */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `0 8px 24px ${action.glow}22` }}
      />

      {/* Icon */}
      <motion.div
        className={`relative p-3 rounded-xl bg-linear-to-br ${action.gradient} shadow-lg ${action.shadow}`}
        animate={{ rotate: 0 }}
        whileHover={{ rotate: 8, scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <action.icon className="w-5 h-5 text-white" />
      </motion.div>

      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 text-center leading-tight group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
        {action.title}
      </span>
    </motion.button>
  )
}

export function QuickActions() {
  return (
    <>
      {/* Inject ripple keyframe */}
      <style>{`
        @keyframes ripple-anim {
          to { transform: scale(1); opacity: 0; }
        }
      `}</style>

      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm h-full">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <Zap className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          </div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">Quick Actions</h2>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {actions.map((action, i) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
              >
                <RippleButton action={action} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
