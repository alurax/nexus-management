import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface FormCurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  required?: boolean
}

export const FormCurrencyInput = forwardRef<HTMLInputElement, FormCurrencyInputProps>(
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
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-(--text-tertiary)">
            ₱
          </span>
          <input
            ref={ref}
            id={inputId}
            type="number"
            step="0.01"
            min="0"
            className={cn(
              'w-full h-9 pl-7 pr-3 text-sm rounded-lg',
              'bg-(--surface-primary) text-(--text-primary)',
              'border border-(--border-primary)',
              'placeholder:text-(--text-tertiary)',
              'transition-colors duration-150',
              'hover:border-(--text-tertiary)',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
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

FormCurrencyInput.displayName = 'FormCurrencyInput'
