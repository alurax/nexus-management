import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface PageContainerProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function PageContainer({ title, description, action, children, className }: PageContainerProps) {
  return (
    <div className={cn('animate-fade-in', className)}>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-(--text-primary)">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-(--text-secondary)">{description}</p>
          )}
        </div>
        {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
      </div>

      {/* Page content */}
      {children}
    </div>
  )
}
