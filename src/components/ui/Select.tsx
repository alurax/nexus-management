import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { ChevronDown } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-(--text-primary)"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-9 px-3 pr-9 text-sm rounded-lg appearance-none',
              'bg-(--surface-primary) text-(--text-primary)',
              'border border-(--border-primary)',
              'transition-colors duration-150',
              'hover:border-(--text-tertiary)',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
              error && 'border-danger-500 focus:ring-danger-500/30 focus:border-danger-500',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-tertiary) pointer-events-none" />
        </div>
        {error && <p className="text-xs text-danger-600">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
