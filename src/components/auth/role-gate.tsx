'use client'

import { hasAnyRole, hasRole, UserRole } from '@/lib/rbac'
import React from 'react'

interface RoleGateProps {
  children: React.ReactNode
  userRole?: string | null
  allowedRoles?: UserRole[]
  minimumRole?: UserRole
  fallback?: React.ReactNode
}

/**
 * A wrapper component that conditionally renders its children based on the user's role.
 * 
 * Provide either `allowedRoles` for an exact match of multiple roles, 
 * or `minimumRole` to check hierarchical access.
 */
export function RoleGate({
  children,
  userRole,
  allowedRoles,
  minimumRole,
  fallback = null,
}: RoleGateProps) {
  // If neither is provided, we assume it's open (or you can decide to restrict by default)
  if (!allowedRoles && !minimumRole) {
    return <>{children}</>
  }

  let isAllowed = false

  if (allowedRoles) {
    isAllowed = hasAnyRole(userRole, allowedRoles)
  } else if (minimumRole) {
    isAllowed = hasRole(userRole, minimumRole)
  }

  if (!isAllowed) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
