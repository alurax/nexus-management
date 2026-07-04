import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-(--surface-tertiary) text-(--text-secondary)',
  success: 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-500',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-500/15 dark:text-danger-500',
  info: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400',
  outline: 'border border-(--border-primary) text-(--text-secondary)',
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-(--text-tertiary)',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-brand-500',
  outline: 'bg-(--text-tertiary)',
}

export function Badge({ children, variant = 'default', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  )
}
