'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import { Loader2, Wrench, Package, DollarSign, Clock, Activity, FileText } from 'lucide-react'

interface TicketModalProps {
  ticketId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function MaintenanceTicketModal({ ticketId, open, onOpenChange, onUpdate }: TicketModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [ticket, setTicket] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'parts' | 'labor'>('details')
  const [employees, setEmployees] = useState<{id: string, name: string}[]>([])
  
  // Parts Form
  const [newPart, setNewPart] = useState({ name: '', qty: 1, cost: 0 })
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (open && ticketId) {
      fetchTicket()
      fetchEmployees()
    }
  }, [open, ticketId])

  const fetchEmployees = async () => {
    const { data } = await supabase.from('employees').select('id, profile:profiles(first_name, last_name)').eq('is_active', true)
    if (data) {
      setEmployees(data.map((e: any) => {
        const p = Array.isArray(e.profile) ? e.profile[0] : e.profile
        return { id: e.id, name: `${p?.first_name} ${p?.last_name}` }
      }))
    }
  }

  const fetchTicket = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select(`
        *,
        asset:assets(name, tag_number),
        tech:employees!technician_id(profile:profiles(first_name, last_name))
      `)
      .eq('id', ticketId)
      .single()
      
    if (data) {
      // Clean up tech relation if exists
      if (data.tech) {
        data.tech = Array.isArray(data.tech.profile) ? data.tech.profile[0] : data.tech.profile
      }
      setTicket(data)
    }
    setIsLoading(false)
  }

  const assignTech = async (employeeId: string) => {
    try {
      await supabase.from('maintenance_requests').update({ technician_id: employeeId || null }).eq('id', ticketId)
      toast.success('Technician assigned')
      fetchTicket()
      onUpdate()
    } catch (e) {
      toast.error('Failed to assign tech')
    }
  }

  const addPart = async () => {
    if (!newPart.name || newPart.qty <= 0) return
    setIsSaving(true)
    try {
      const parts = ticket.parts_used || []
      const updatedParts = [...parts, newPart]
      
      const newPartsCost = updatedParts.reduce((sum, p) => sum + (p.qty * p.cost), 0)
      const totalCost = newPartsCost + (ticket.labor_cost || 0)

      await supabase.from('maintenance_requests').update({ 
        parts_used: updatedParts,
        total_cost: totalCost
      }).eq('id', ticketId)
      
      setNewPart({ name: '', qty: 1, cost: 0 })
      toast.success('Part added')
      fetchTicket()
      onUpdate()
    } catch (e) {
      toast.error('Failed to add part')
    } finally {
      setIsSaving(false)
    }
  }

  const updateLabor = async (hours: number, cost: number) => {
    setIsSaving(true)
    try {
      const partsCost = (ticket.parts_used || []).reduce((sum: number, p: any) => sum + (p.qty * p.cost), 0)
      const totalCost = partsCost + cost

      await supabase.from('maintenance_requests').update({ 
        labor_hours: hours,
        labor_cost: cost,
        total_cost: totalCost
      }).eq('id', ticketId)
      
      toast.success('Labor updated')
      fetchTicket()
      onUpdate()
    } catch (e) {
      toast.error('Failed to update labor')
    } finally {
      setIsSaving(false)
    }
  }

  if (!ticket && isLoading) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-zinc-50 dark:bg-zinc-950 p-0 overflow-hidden border-zinc-200 dark:border-zinc-800">
        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-600" /> Maintenance Ticket
          </DialogTitle>
          {ticket && (
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">{ticket.asset?.name}</h3>
                <p className="text-sm text-zinc-500 font-mono">{ticket.asset?.tag_number}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-300">
                  {ticket.status.replace('_', ' ')}
                </span>
                <p className="text-xs text-zinc-400 mt-1 capitalize">{ticket.priority} Priority</p>
              </div>
            </div>
          )}
        </div>

        {ticket && (
          <div className="flex h-[500px]">
            {/* Sidebar */}
            <div className="w-48 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-4 space-y-1 shrink-0">
              <button 
                onClick={() => setActiveTab('details')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${activeTab === 'details' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                <FileText className="w-4 h-4" /> Details
              </button>
              <button 
                onClick={() => setActiveTab('parts')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${activeTab === 'parts' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                <Package className="w-4 h-4" /> Parts Used
              </button>
              <button 
                onClick={() => setActiveTab('labor')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${activeTab === 'labor' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                <Clock className="w-4 h-4" /> Labor & Cost
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-zinc-500 mb-1">Issue Description</h4>
                    <p className="text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      {ticket.issue_description}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-zinc-500 mb-2">Assign Technician</h4>
                    <select 
                      value={ticket.technician_id || ''}
                      onChange={(e) => assignTech(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <option value="">Unassigned</option>
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'parts' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                          <th className="px-4 py-2 font-medium">Part Name</th>
                          <th className="px-4 py-2 font-medium text-right">Qty</th>
                          <th className="px-4 py-2 font-medium text-right">Cost ($)</th>
                          <th className="px-4 py-2 font-medium text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {(ticket.parts_used || []).length === 0 ? (
                          <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-500 italic">No parts recorded yet.</td></tr>
                        ) : (
                          (ticket.parts_used || []).map((part: any, i: number) => (
                            <tr key={i}>
                              <td className="px-4 py-3">{part.name}</td>
                              <td className="px-4 py-3 text-right">{part.qty}</td>
                              <td className="px-4 py-3 text-right">{part.cost.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right font-medium">{(part.qty * part.cost).toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-zinc-100 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <h4 className="text-sm font-medium mb-3">Add Used Part</h4>
                    <div className="grid grid-cols-12 gap-2">
                      <Input 
                        placeholder="Part name" 
                        className="col-span-6 bg-white dark:bg-zinc-900"
                        value={newPart.name}
                        onChange={e => setNewPart({...newPart, name: e.target.value})}
                      />
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="Qty" 
                        className="col-span-2 bg-white dark:bg-zinc-900"
                        value={newPart.qty}
                        onChange={e => setNewPart({...newPart, qty: parseInt(e.target.value) || 0})}
                      />
                      <Input 
                        type="number" 
                        min="0"
                        step="0.01"
                        placeholder="Cost" 
                        className="col-span-2 bg-white dark:bg-zinc-900"
                        value={newPart.cost}
                        onChange={e => setNewPart({...newPart, cost: parseFloat(e.target.value) || 0})}
                      />
                      <Button onClick={addPart} disabled={isSaving} className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white">Add</Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'labor' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Total Labor Cost</p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">${(ticket.labor_cost || 0).toFixed(2)}</p>
                      <p className="text-sm text-zinc-500">{ticket.labor_hours || 0} hours logged</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/30 text-center">
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold mb-1">Total Ticket Cost</p>
                      <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">${(ticket.total_cost || 0).toFixed(2)}</p>
                      <p className="text-sm text-indigo-600/70 dark:text-indigo-400/70">Parts + Labor</p>
                    </div>
                  </div>

                  <div className="bg-zinc-100 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <h4 className="text-sm font-medium mb-3">Update Labor</h4>
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-1">
                        <label className="text-xs text-zinc-500">Total Hours</label>
                        <Input 
                          type="number"
                          step="0.5"
                          className="bg-white dark:bg-zinc-900"
                          defaultValue={ticket.labor_hours}
                          id="laborHours"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-xs text-zinc-500">Total Labor Cost ($)</label>
                        <Input 
                          type="number"
                          step="0.01"
                          className="bg-white dark:bg-zinc-900"
                          defaultValue={ticket.labor_cost}
                          id="laborCost"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button 
                          disabled={isSaving}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={() => {
                            const h = parseFloat((document.getElementById('laborHours') as HTMLInputElement).value) || 0
                            const c = parseFloat((document.getElementById('laborCost') as HTMLInputElement).value) || 0
                            updateLabor(h, c)
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
