import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-(--text-primary)"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full min-h-[80px] px-3 py-2 text-sm rounded-lg resize-y',
            'bg-(--surface-primary) text-(--text-primary)',
            'border border-(--border-primary)',
            'placeholder:text-(--text-tertiary)',
            'transition-colors duration-150',
            'hover:border-(--text-tertiary)',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
            error && 'border-danger-500 focus:ring-danger-500/30 focus:border-danger-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger-600">{error}</p>}
        {hint && !error && <p className="text-xs text-(--text-tertiary)">{hint}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
