import { useAuth } from './useAuth'
import type { Role } from './AuthContext'

interface RoleGateProps {
  allowedRoles: Role[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Renders children only if the current user has one of the allowed roles.
 */
export function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  const { profile, isLoading } = useAuth()

  if (isLoading) return null

  if (profile && allowedRoles.includes(profile.role)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
