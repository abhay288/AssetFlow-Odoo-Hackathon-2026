'use client'

import React, { useState, useEffect } from 'react'
import { DataTable } from '@/components/shared/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Trash2, Box } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createBrowserClient } from '@supabase/ssr'

interface Category {
  id: string
  name: string
  prefix: string
  description: string
  color: string
  warranty_period_months: number
  is_active: boolean
  asset_count: number
}

interface CategoryTableProps {
  onEdit: (id: string) => void
}

export function CategoryTable({ onEdit }: CategoryTableProps) {
  const [data, setData] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: catData, error } = await supabase
          .from('asset_categories')
          .select('*')
          .order('name')

        if (error) throw error

        const formatted = catData?.map((c: any) => ({
          id: c.id,
          name: c.name,
          prefix: c.prefix,
          description: c.description || 'No description',
          color: c.color || '#6366f1',
          warranty_period_months: c.warranty_period_months || 0,
          is_active: c.is_active,
          asset_count: Math.floor(Math.random() * 100), // Mock count
        })) || []

        setData(formatted)
      } catch (err) {
        console.error('Error fetching categories:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [supabase])

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'name',
      header: 'Category',
      cell: ({ row }) => {
        const cat = row.original
        return (
          <div className="flex items-center gap-3">
            <div 
              className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
            >
              <Box className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium text-zinc-900 dark:text-zinc-100">{cat.name}</div>
              <div className="text-xs text-zinc-500">{cat.description}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'prefix',
      header: 'Prefix (Tag)',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.getValue('prefix')}
        </Badge>
      ),
    },
    {
      accessorKey: 'warranty_period_months',
      header: 'Warranty (Months)',
      cell: ({ row }) => (
        <span className="text-zinc-600 dark:text-zinc-400">
          {row.getValue('warranty_period_months')} mo
        </span>
      ),
    },
    {
      accessorKey: 'asset_count',
      header: 'Total Assets',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('is_active') as boolean
        return (
          <Badge className={isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const cat = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(cat.id)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Category
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30">
                <Trash2 className="mr-2 h-4 w-4" /> Deactivate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-zinc-500">Loading categories...</div>
  }

  return <DataTable columns={columns} data={data} searchKey="name" placeholder="Search categories..." />
}
