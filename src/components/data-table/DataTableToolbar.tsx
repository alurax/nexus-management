import type { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/utils/cn'

interface DataTableToolbarProps {
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
  searchPlaceholder?: string
  children?: ReactNode
}

export function DataTableToolbar({
  globalFilter,
  onGlobalFilterChange,
  searchPlaceholder = 'Search...',
  children,
}: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-tertiary)" />
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          placeholder={searchPlaceholder}
          className={cn(
            'w-full h-9 pl-10 pr-4 text-sm rounded-lg',
            'bg-(--surface-primary) text-(--text-primary)',
            'border border-(--border-primary)',
            'placeholder:text-(--text-tertiary)',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
            'transition-colors duration-150'
          )}
        />
      </div>

      {/* Toolbar actions */}
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  )
}
