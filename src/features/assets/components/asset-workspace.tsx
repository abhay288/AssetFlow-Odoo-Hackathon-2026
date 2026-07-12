'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QRCodeDisplay } from './qr-code-display'
import { DocumentManager } from './document-manager'
import { AllocationDrawer } from '@/features/workflows/components/allocation-drawer'
import { ReturnWizard } from '@/features/workflows/components/return-wizard'
import { TransferWizard } from '@/features/workflows/components/transfer-wizard'
import { 
  ArrowLeft, Edit, MoreHorizontal, Calendar, 
  MapPin, User, Tag, DollarSign, ShieldAlert,
  Clock, Activity, FileText, CheckCircle2, AlertTriangle, Play, ArrowDownLeft, ArrowRightLeft
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AssetWorkspaceProps {
  assetId: string
}

export function AssetWorkspace({ assetId }: AssetWorkspaceProps) {
  const router = useRouter()
  const [asset, setAsset] = useState<any>(null)
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'documents' | 'qr'>('overview')

  // Modals state
  const [isAllocationOpen, setIsAllocationOpen] = useState(false)
  const [isReturnOpen, setIsReturnOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchAssetDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('assets')
          .select(`
            *,
            category:asset_categories(*),
            department:departments(name),
            owner:employees!owner_id(profile:profiles(first_name, last_name))
          `)
          .eq('id', assetId)
          .single()

        if (error) throw error

        if (data) {
          data.owner = Array.isArray(data.owner?.profile) ? data.owner.profile[0] : data.owner?.profile
          setAsset(data)
        }

        // Fetch Activity Logs
        const { data: logsData } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('asset_id', assetId)
          .order('created_at', { ascending: false })
          
        if (logsData) {
          setActivityLogs(logsData)
        }
      } catch (error) {
        console.error('Error fetching asset details', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssetDetails()
  }, [assetId, supabase])

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-zinc-500">Loading asset workspace...</div>
  }

  if (!asset) {
    return <div className="flex h-full items-center justify-center text-red-500">Asset not found.</div>
  }

  const isWarrantyExpired = asset.warranty_end ? new Date(asset.warranty_end) < new Date() : false

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full space-y-6"
    >
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/assets')} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-zinc-100 dark:border-zinc-800"
              style={{ backgroundColor: `${asset.category?.color || '#6366f1'}15`, color: asset.category?.color || '#6366f1' }}
            >
              <Tag className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{asset.name}</h1>
                <Badge variant="outline" className="font-mono bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {asset.tag_number}
                </Badge>
              </div>
              <p className="text-sm text-zinc-500 mt-1">{asset.category?.name} • Added {new Date(asset.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-white dark:bg-zinc-950">
              <Edit className="w-4 h-4 mr-2" /> Edit Asset
            </Button>
            <DropdownMenu>
              {/* @ts-expect-error Radix UI DropdownMenuTrigger typings */}
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-950">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {asset.status === 'allocated' && (
                  <>
                    <DropdownMenuItem onClick={() => setIsTransferOpen(true)}>
                      <ArrowRightLeft className="w-4 h-4 mr-2" /> Transfer Asset
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsReturnOpen(true)}>
                      <ArrowDownLeft className="w-4 h-4 mr-2" /> Return Asset
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem>Report Issue</DropdownMenuItem>
                <DropdownMenuItem>Schedule Maintenance</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50">Dispose Asset</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {asset.status === 'available' && (
              <Button onClick={() => setIsAllocationOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md ml-2">
                <Play className="w-4 h-4 mr-2" /> Allocate
              </Button>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-8 grid grid-cols-4 divide-x divide-zinc-200 dark:divide-zinc-800 border-t border-zinc-100 dark:border-zinc-800 pt-6">
          <div className="px-4">
            <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="font-medium text-zinc-900 dark:text-zinc-100 capitalize">{asset.status.replace('_', ' ')}</span>
            </div>
          </div>
          <div className="px-4">
            <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">Condition</p>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-zinc-900 dark:text-zinc-100 capitalize">{asset.condition}</span>
            </div>
          </div>
          <div className="px-4">
            <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">Location</p>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-400" />
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{asset.location || 'Not Specified'}</span>
            </div>
          </div>
          <div className="px-4">
            <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">Assigned To</p>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-zinc-400" />
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {asset.owner ? `${asset.owner.first_name} ${asset.owner.last_name}` : 'Unassigned'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 h-full min-h-[500px]">
        {/* Sidebar Navigation */}
        <div className="w-64 shrink-0 flex flex-col space-y-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'overview' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200 dark:border-zinc-800' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200 border border-transparent'
            }`}
          >
            <Activity className="w-4 h-4" /> Overview & Specs
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'history' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200 dark:border-zinc-800' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200 border border-transparent'
            }`}
          >
            <Clock className="w-4 h-4" /> Activity Timeline
          </button>
          <button 
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'documents' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200 dark:border-zinc-800' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200 border border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" /> Documents & Files
          </button>
          <button 
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'qr' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200 dark:border-zinc-800' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200 border border-transparent'
            }`}
          >
            <Tag className="w-4 h-4" /> QR & Barcode
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Financial Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500">Purchase Cost</span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center"><DollarSign className="w-3 h-3 text-zinc-400 mr-1" />{asset.purchase_cost?.toLocaleString() || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500">Current Value</span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center"><DollarSign className="w-3 h-3 text-zinc-400 mr-1" />{asset.current_value?.toLocaleString() || asset.purchase_cost?.toLocaleString() || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500">Vendor</span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{asset.vendor || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500">Purchase Date</span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center"><Calendar className="w-3 h-3 text-zinc-400 mr-1.5" />{asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Hardware & Lifecycle</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500">Serial Number</span>
                      <span className="text-sm font-mono text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{asset.serial_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500">Warranty Start</span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{asset.warranty_start ? new Date(asset.warranty_start).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500">Warranty End</span>
                      <div className="flex items-center gap-2">
                        {isWarrantyExpired && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                        <span className={`text-sm font-medium ${isWarrantyExpired ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                          {asset.warranty_end ? new Date(asset.warranty_end).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Notes & Description</h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  {asset.notes || asset.description || 'No additional notes provided.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-800 pb-2">Activity Timeline</h3>
              <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-3 space-y-8 pb-4">
                {activityLogs.map((log) => (
                  <div key={log.id} className="relative pl-6">
                    <div className={`absolute w-3 h-3 rounded-full left-[-7px] top-1.5 ring-4 ring-white dark:ring-zinc-900 ${
                      log.action_type === 'allocated' ? 'bg-indigo-600' :
                      log.action_type === 'returned' ? 'bg-amber-500' :
                      log.action_type === 'transferred' ? 'bg-blue-500' :
                      'bg-emerald-500'
                    }`}></div>
                    <div className="text-xs text-zinc-500 mb-1">{new Date(log.created_at).toLocaleString()}</div>
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize">{log.action_type}</div>
                    <div className="text-sm text-zinc-500 mt-1">{log.description}</div>
                  </div>
                ))}

                <div className="relative pl-6">
                  <div className="absolute w-3 h-3 bg-emerald-500 rounded-full left-[-7px] top-1.5 ring-4 ring-white dark:ring-zinc-900"></div>
                  <div className="text-xs text-zinc-500 mb-1">{new Date(asset.created_at).toLocaleString()}</div>
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Asset Registered</div>
                  <div className="text-sm text-zinc-500 mt-1">Initial registration and provisioning</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-2">Document Attachments</h3>
              <DocumentManager assetId={assetId} />
            </div>
          )}

          {activeTab === 'qr' && (
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-2">QR Code & Tags</h3>
              <QRCodeDisplay tagNumber={asset.tag_number} assetName={asset.name} />
            </div>
          )}
        </div>
      </div>

      <AllocationDrawer 
        open={isAllocationOpen} 
        onOpenChange={setIsAllocationOpen} 
        assetId={asset.id} 
        assetName={asset.name} 
        tagNumber={asset.tag_number} 
        onSuccess={() => window.location.reload()} 
      />
      
      <ReturnWizard 
        open={isReturnOpen} 
        onOpenChange={setIsReturnOpen} 
        assetId={asset.id} 
        assetName={asset.name} 
        tagNumber={asset.tag_number} 
        onSuccess={() => window.location.reload()} 
      />

      <TransferWizard 
        open={isTransferOpen} 
        onOpenChange={setIsTransferOpen} 
        assetId={asset.id} 
        assetName={asset.name} 
        tagNumber={asset.tag_number} 
        currentOwnerId={asset.owner_id}
        onSuccess={() => window.location.reload()} 
      />
    </motion.div>
  )
}
