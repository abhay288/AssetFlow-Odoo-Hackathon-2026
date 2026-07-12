'use client'

import React, { useState, useEffect } from 'react'
import { DataTable } from '@/components/shared/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Trash2, Shield } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createBrowserClient } from '@supabase/ssr'

interface Department {
  id: string
  name: string
  code: string
  is_active: boolean
  employee_count: number
  asset_count: number
  parent_name?: string | null
}

interface DepartmentTableProps {
  onEdit: (id: string) => void
}

export function DepartmentTable({ onEdit }: DepartmentTableProps) {
  const [data, setData] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        // In a real app we'd fetch employee and asset counts via RPC or aggregations
        // For now, doing a standard fetch of departments
        const { data: depts, error } = await supabase
          .from('departments')
          .select(`
            id, name, code, is_active,
            parent:departments!parent_id(name)
          `)
          .order('name')

        if (error) throw error

        const formatted = depts?.map((d: any) => ({
          id: d.id,
          name: d.name,
          code: d.code,
          is_active: d.is_active,
          parent_name: d.parent?.name || null,
          employee_count: Math.floor(Math.random() * 50), // Mock data for now
          asset_count: Math.floor(Math.random() * 200), // Mock data for now
        })) || []

        setData(formatted)
      } catch (err) {
        console.error('Error fetching departments:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDepartments()

    // Setup realtime subscription
    const channel = supabase
      .channel('public:departments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, () => {
        fetchDepartments()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: 'name',
      header: 'Department Name',
      cell: ({ row }) => (
        <div className="font-medium text-zinc-900 dark:text-zinc-100">
          {row.getValue('name')}
          {row.original.parent_name && (
            <div className="text-xs text-zinc-500 font-normal mt-0.5">
              ↳ {row.original.parent_name}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
          {row.getValue('code')}
        </Badge>
      ),
    },
    {
      accessorKey: 'employee_count',
      header: 'Employees',
    },
    {
      accessorKey: 'asset_count',
      header: 'Assets',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('is_active') as boolean
        return (
          <Badge className={isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const dept = row.original
        return (
          <DropdownMenu>
            {/* @ts-expect-error - Radix UI DropdownMenuTrigger typings conflict */}
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(dept.id)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30">
                <Trash2 className="mr-2 h-4 w-4" /> Deactivate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-zinc-500">Loading departments...</div>
  }

  return <DataTable columns={columns} data={data} searchKey="name" placeholder="Search departments..." />
}
