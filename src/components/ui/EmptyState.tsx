import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { PackageOpen } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4', className)}>
      <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-(--surface-tertiary) text-(--text-tertiary) mb-4">
        {icon || <PackageOpen className="h-6 w-6" />}
      </div>
      <h3 className="text-sm font-semibold text-(--text-primary) mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-(--text-tertiary) text-center max-w-xs mb-4">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
