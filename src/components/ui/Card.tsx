import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
  action?: ReactNode
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({ children, className, padding = 'none', hover }: CardProps) {
  return (
    <div
      className={cn(
        'bg-(--surface-primary) rounded-xl border border-(--border-primary)',
        'shadow-xs',
        hover && 'transition-shadow duration-200 hover:shadow-md',
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, action }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-5 py-4',
        'border-b border-(--border-secondary)',
        className
      )}
    >
      <div className="flex flex-col gap-0.5">{children}</div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-sm font-semibold text-(--text-primary)', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-xs text-(--text-tertiary)', className)}>
      {children}
    </p>
  )
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('p-5', className)}>{children}</div>
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center px-5 py-3',
        'border-t border-(--border-secondary)',
        className
      )}
    >
      {children}
    </div>
  )
}
