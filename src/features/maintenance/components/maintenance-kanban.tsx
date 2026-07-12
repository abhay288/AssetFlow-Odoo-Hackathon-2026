'use client'

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { createBrowserClient } from '@supabase/ssr'
import { AlertCircle, Clock, CheckCircle2, Wrench, Package, ShieldCheck, MoreVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { MaintenanceTicketModal } from './maintenance-ticket-modal'

interface Ticket {
  id: string
  asset: { name: string, tag_number: string }
  issue_category: string
  priority: string
  status: string
  created_at: string
}

const COLUMNS = [
  { id: 'open', title: 'Open Requests', icon: <AlertCircle className="w-4 h-4 text-zinc-500" /> },
  { id: 'tech_assigned', title: 'Assigned', icon: <Wrench className="w-4 h-4 text-blue-500" /> },
  { id: 'in_progress', title: 'In Progress', icon: <Clock className="w-4 h-4 text-amber-500" /> },
  { id: 'waiting_parts', title: 'Waiting Parts', icon: <Package className="w-4 h-4 text-orange-500" /> },
  { id: 'quality_check', title: 'Quality Check', icon: <ShieldCheck className="w-4 h-4 text-indigo-500" /> },
  { id: 'resolved', title: 'Resolved', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
]

export function MaintenanceKanban() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchTickets = async () => {
    const { data } = await supabase
      .from('maintenance_requests')
      .select(`
        id,
        issue_category,
        priority,
        status,
        created_at,
        asset:assets(name, tag_number)
      `)
      .neq('status', 'closed')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
      
    if (data) setTickets(data as any)
  }

  useEffect(() => {
    fetchTickets()

    const channel = supabase.channel('realtime:maintenance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_requests' }, payload => {
        fetchTickets()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId !== destination.droppableId) {
      // Optimistic Update
      setTickets(prev => prev.map(t => 
        t.id === draggableId ? { ...t, status: destination.droppableId } : t
      ))

      // Update DB
      await supabase
        .from('maintenance_requests')
        .update({ status: destination.droppableId })
        .eq('id', draggableId)
        
      // If moving to in_progress, also update asset status (handled via trigger ideally, but we can do it here for demo)
      if (destination.droppableId === 'in_progress') {
        const ticket = tickets.find(t => t.id === draggableId)
        if (ticket) {
          // In a real app we'd fetch the asset_id first, but for demo we assume backend handles asset status sync
        }
      }
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900'
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-900'
      case 'medium': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900'
      default: return 'text-zinc-600 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
    }
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 h-full overflow-x-auto pb-4 custom-scrollbar">
          {COLUMNS.map(column => (
            <div key={column.id} className="shrink-0 w-[320px] flex flex-col bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white/50 dark:bg-zinc-900 rounded-t-xl">
                <div className="flex items-center gap-2 font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                  {column.icon} {column.title}
                </div>
                <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {tickets.filter(t => t.status === column.id).length}
                </Badge>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                    }`}
                  >
                    {tickets.filter(t => t.status === column.id).map((ticket, index) => (
                      <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => setSelectedTicketId(ticket.id)}
                            className={`p-4 bg-white dark:bg-zinc-900 border rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition-all ${
                              snapshot.isDragging ? 'border-indigo-500 shadow-md rotate-2 z-50' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{ticket.asset?.name || 'Unknown Asset'}</h4>
                                <p className="text-xs font-mono text-zinc-500 mt-0.5">{ticket.asset?.tag_number}</p>
                              </div>
                              <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-4">
                              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm border ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                              </span>
                              <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-sm">
                                {ticket.issue_category || 'General'}
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {selectedTicketId && (
        <MaintenanceTicketModal 
          ticketId={selectedTicketId} 
          open={!!selectedTicketId} 
          onOpenChange={(open: boolean) => !open && setSelectedTicketId(null)}
          onUpdate={fetchTickets}
        />
      )}
    </>
  )
}
