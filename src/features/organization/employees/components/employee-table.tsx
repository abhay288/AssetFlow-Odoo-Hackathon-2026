'use client'

import React, { useState, useEffect } from 'react'
import { DataTable } from '@/components/shared/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Trash2, Mail, Phone } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createBrowserClient } from '@supabase/ssr'

interface Employee {
  id: string
  name: string
  email: string
  position: string
  department: string
  role: string
  is_active: boolean
  avatar_url?: string
}

interface EmployeeTableProps {
  onEdit: (id: string) => void
}

export function EmployeeTable({ onEdit }: EmployeeTableProps) {
  const [data, setData] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data: employeesData, error } = await supabase
          .from('employees')
          .select(`
            id, position, is_active,
            profile:profiles(first_name, last_name, email, avatar_url, role:roles(name)),
            department:departments(name)
          `)

        if (error) throw error

        const formatted = employeesData?.map((emp: any) => {
          const profile = Array.isArray(emp.profile) ? emp.profile[0] : emp.profile
          return {
            id: emp.id,
            name: `${profile?.first_name} ${profile?.last_name}`,
            email: profile?.email,
            position: emp.position || 'N/A',
            department: emp.department?.name || 'Unassigned',
            role: profile?.role?.name || 'Employee',
            is_active: emp.is_active,
            avatar_url: profile?.avatar_url
          }
        }) || []

        setData(formatted)
      } catch (err) {
        console.error('Error fetching employees:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployees()
  }, [supabase])

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'name',
      header: 'Employee',
      cell: ({ row }) => {
        const emp = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={emp.avatar_url} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700">
                {emp.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-zinc-900 dark:text-zinc-100">{emp.name}</div>
              <div className="text-xs text-zinc-500">{emp.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'department',
      header: 'Department',
    },
    {
      accessorKey: 'position',
      header: 'Title',
    },
    {
      accessorKey: 'role',
      header: 'System Role',
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
          {row.getValue('role')}
        </Badge>
      ),
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
        const emp = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(emp.id)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Mail className="mr-2 h-4 w-4" /> Send Email
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
    return <div className="h-64 flex items-center justify-center text-zinc-500">Loading directory...</div>
  }

  return <DataTable columns={columns} data={data} searchKey="name" placeholder="Search employees..." />
}
