import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  trailing?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, trailing, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-(--text-primary)"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-tertiary)">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-9 px-3 text-sm rounded-lg',
              'bg-(--surface-primary) text-(--text-primary)',
              'border border-(--border-primary)',
              'placeholder:text-(--text-tertiary)',
              'transition-colors duration-150',
              'hover:border-(--text-tertiary)',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
              icon && 'pl-10',
              trailing && 'pr-10',
              error && 'border-danger-500 focus:ring-danger-500/30 focus:border-danger-500',
              className
            )}
            {...props}
          />
          {trailing && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-tertiary)">
              {trailing}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-danger-600">{error}</p>}
        {hint && !error && <p className="text-xs text-(--text-tertiary)">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
