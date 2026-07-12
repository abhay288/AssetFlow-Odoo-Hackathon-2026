'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/shared/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { createBrowserClient } from '@supabase/ssr'
import { Monitor, Laptop, Smartphone, Box, ShieldAlert } from 'lucide-react'

// Extended Asset Interface based on new Phase 6 fields
interface Asset {
  id: string
  tag_number: string
  name: string
  category: { name: string, icon?: string, color?: string }
  department: { name: string } | null
  owner: { first_name: string, last_name: string } | null
  status: string
  condition: string
  purchase_cost: number
  warranty_end: string | null
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'available': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'allocated': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'under_maintenance': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    case 'retired': return 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
    case 'lost': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
  }
}

const getConditionBadgeColor = (condition: string) => {
  switch (condition) {
    case 'new': return 'border-emerald-200 text-emerald-700 dark:border-emerald-900/50 dark:text-emerald-400'
    case 'good': return 'border-blue-200 text-blue-700 dark:border-blue-900/50 dark:text-blue-400'
    case 'fair': return 'border-amber-200 text-amber-700 dark:border-amber-900/50 dark:text-amber-400'
    case 'poor': return 'border-orange-200 text-orange-700 dark:border-orange-900/50 dark:text-orange-400'
    case 'broken': return 'border-red-200 text-red-700 dark:border-red-900/50 dark:text-red-400'
    default: return 'border-zinc-200 text-zinc-700 dark:border-zinc-800 dark:text-zinc-400'
  }
}

export function AssetDirectory() {
  const router = useRouter()
  const [data, setData] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const { data: assetsData, error } = await supabase
          .from('assets')
          .select(`
            id, tag_number, name, status, condition, purchase_cost, warranty_end,
            category:asset_categories(name, icon, color),
            department:departments(name),
            owner:employees!owner_id(profile:profiles(first_name, last_name))
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        const formatted = assetsData?.map((a: any) => {
          // Handle one-to-many inference
          const ownerProfile = Array.isArray(a.owner?.profile) ? a.owner.profile[0] : a.owner?.profile
          
          return {
            id: a.id,
            tag_number: a.tag_number,
            name: a.name,
            category: a.category || { name: 'Unknown' },
            department: a.department || null,
            owner: ownerProfile || null,
            status: a.status,
            condition: a.condition || 'good',
            purchase_cost: a.purchase_cost || 0,
            warranty_end: a.warranty_end || null
          }
        }) || []

        setData(formatted)
      } catch (err) {
        console.error('Error fetching assets:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssets()
  }, [supabase])

  const columns: ColumnDef<Asset>[] = [
    {
      accessorKey: 'tag_number',
      header: 'Tag ID',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
          {row.getValue('tag_number')}
        </Badge>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Asset Details',
      cell: ({ row }) => {
        const asset = row.original
        const catColor = asset.category.color || '#6366f1'
        return (
          <div className="flex items-center gap-3">
            <div 
              className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: `${catColor}15`, color: catColor }}
            >
              {/* Could map icons dynamically, fallback to Box */}
              <Box className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium text-zinc-900 dark:text-zinc-100">{asset.name}</div>
              <div className="text-xs text-zinc-500">{asset.category.name}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => {
        const dept = row.original.department
        return <span className="text-sm text-zinc-700 dark:text-zinc-300">{dept?.name || 'Unassigned'}</span>
      }
    },
    {
      accessorKey: 'owner',
      header: 'Assigned To',
      cell: ({ row }) => {
        const owner = row.original.owner
        return <span className="text-sm text-zinc-700 dark:text-zinc-300">{owner ? `${owner.first_name} ${owner.last_name}` : 'Pool Resource'}</span>
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge className={`capitalize ${getStatusBadgeColor(status)}`}>
            {status.replace('_', ' ')}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'condition',
      header: 'Condition',
      cell: ({ row }) => {
        const condition = row.getValue('condition') as string
        return (
          <Badge variant="outline" className={`capitalize bg-transparent border ${getConditionBadgeColor(condition)}`}>
            {condition}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'warranty_end',
      header: 'Warranty',
      cell: ({ row }) => {
        const dateStr = row.getValue('warranty_end') as string
        if (!dateStr) return <span className="text-zinc-400 text-xs">N/A</span>
        
        const date = new Date(dateStr)
        const isExpired = date < new Date()
        
        return (
          <div className="flex items-center gap-1.5">
            {isExpired && <ShieldAlert className="h-3.5 w-3.5 text-red-500" />}
            <span className={`text-sm ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
              {date.toLocaleDateString()}
            </span>
          </div>
        )
      }
    },
  ]

  if (isLoading) {
    return <div className="h-96 flex items-center justify-center text-zinc-500">Loading enterprise asset directory...</div>
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <DataTable 
        columns={columns} 
        data={data} 
        searchKey="name" 
        placeholder="Search assets by name, tag, or serial..."
        onRowClick={(row) => router.push(`/assets/${row.id}`)}
      />
    </div>
  )
}
