import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface FormDatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  required?: boolean
}

export const FormDatePicker = forwardRef<HTMLInputElement, FormDatePickerProps>(
  ({ className, label, error, required, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-(--text-primary)"
          >
            {label}
            {required && <span className="text-danger-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="date"
            className={cn(
              'w-full h-9 px-3 text-sm rounded-lg',
              'bg-(--surface-primary) text-(--text-primary)',
              'border border-(--border-primary)',
              'transition-colors duration-150',
              'hover:border-(--text-tertiary)',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
              error && 'border-danger-500 focus:ring-danger-500/30 focus:border-danger-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-danger-600">{error}</p>}
      </div>
    )
  }
)

FormDatePicker.displayName = 'FormDatePicker'
