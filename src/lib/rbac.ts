export type UserRole = 'admin' | 'asset_manager' | 'dept_head' | 'employee'

export const ROLES: Record<Uppercase<UserRole>, UserRole> = {
  ADMIN: 'admin',
  ASSET_MANAGER: 'asset_manager',
  DEPT_HEAD: 'dept_head',
  EMPLOYEE: 'employee',
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  employee: 1,
  dept_head: 2,
  asset_manager: 3,
  admin: 4,
}

/**
 * Checks if the user has the required role or higher
 */
export function hasRole(userRole: string | null | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false
  
  const userLevel = ROLE_HIERARCHY[userRole as UserRole] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole]
  
  return userLevel >= requiredLevel
}

/**
 * Checks if the user has exactly one of the allowed roles
 */
export function hasAnyRole(userRole: string | null | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false
  return allowedRoles.includes(userRole as UserRole)
}
