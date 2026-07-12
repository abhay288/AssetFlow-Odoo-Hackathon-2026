'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './booking-calendar.css'
import { createBrowserClient } from '@supabase/ssr'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BookingDrawer } from './booking-drawer'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export function BookingCalendar() {
  const [events, setEvents] = useState<any[]>([])
  const [view, setView] = useState<View>(Views.WEEK)
  const [date, setDate] = useState(new Date())
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedSlotDate, setSelectedSlotDate] = useState<Date | undefined>(undefined)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchBookings = useCallback(async () => {
    const { data } = await supabase
      .from('bookings')
      .select(`
        id,
        start_time,
        end_time,
        purpose,
        status,
        asset:assets(name, category:asset_categories(name)),
        employee:employees(profile:profiles(first_name, last_name))
      `)
      .in('status', ['approved', 'active', 'pending'])
      
    if (data) {
      const formattedEvents = data.map((b: any) => {
        const profile = Array.isArray(b.employee?.profile) ? b.employee.profile[0] : b.employee?.profile
        const empName = profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown'
        
        return {
          id: b.id,
          title: `${b.asset?.name} - ${empName}`,
          start: new Date(b.start_time),
          end: new Date(b.end_time),
          status: b.status,
          resource: b.asset?.name,
          purpose: b.purpose
        }
      })
      setEvents(formattedEvents)
    }
  }, [supabase])

  useEffect(() => {
    fetchBookings()

    const channel = supabase.channel('realtime:bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, payload => {
        fetchBookings()
      })
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchBookings, supabase])

  const CustomEvent = ({ event }: any) => {
    let bg = 'bg-blue-500'
    let border = 'border-blue-600'
    
    if (event.status === 'active') {
      bg = 'bg-emerald-500'
      border = 'border-emerald-600'
    } else if (event.status === 'pending') {
      bg = 'bg-amber-500'
      border = 'border-amber-600'
    }

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`h-full w-full rounded-md p-1.5 text-xs text-white shadow-sm border ${bg} ${border} overflow-hidden`}
      >
        <div className="font-semibold truncate">{event.title}</div>
        <div className="text-[10px] opacity-90 truncate">{event.purpose}</div>
      </motion.div>
    )
  }

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedSlotDate(start)
    setIsDrawerOpen(true)
  }

  const navigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    let newDate = new Date(date)
    if (action === 'TODAY') {
      newDate = new Date()
    } else if (action === 'PREV') {
      if (view === Views.MONTH) newDate.setMonth(newDate.getMonth() - 1)
      else if (view === Views.WEEK) newDate.setDate(newDate.getDate() - 7)
      else newDate.setDate(newDate.getDate() - 1)
    } else if (action === 'NEXT') {
      if (view === Views.MONTH) newDate.setMonth(newDate.getMonth() + 1)
      else if (view === Views.WEEK) newDate.setDate(newDate.getDate() + 7)
      else newDate.setDate(newDate.getDate() + 1)
    }
    setDate(newDate)
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
      
      {/* Custom Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-1">
            <button onClick={() => navigate('PREV')} className="p-1 rounded hover:bg-white dark:hover:bg-zinc-800 text-zinc-500"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => navigate('TODAY')} className="px-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">Today</button>
            <button onClick={() => navigate('NEXT')} className="p-1 rounded hover:bg-white dark:hover:bg-zinc-800 text-zinc-500"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {format(date, view === Views.MONTH ? 'MMMM yyyy' : 'MMM d, yyyy')}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            {(['month', 'week', 'day'] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                  view === v ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <Button onClick={() => { setSelectedSlotDate(new Date()); setIsDrawerOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> New Booking
          </Button>
        </div>
      </div>

      {/* Calendar Area */}
      <div className="flex-1 p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          onView={(newView) => setView(newView as View)}
          selectable
          onSelectSlot={handleSelectSlot}
          components={{
            event: CustomEvent,
            toolbar: () => null // Hide default toolbar since we built a custom one
          }}
          className="h-[600px] font-sans"
        />
      </div>

      <BookingDrawer 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
        onSuccess={fetchBookings} 
        initialDate={selectedSlotDate}
      />
    </div>
  )
}
