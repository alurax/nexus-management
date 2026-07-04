import { useEffect, useCallback, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

interface ModalHeaderProps {
  children: ReactNode
  className?: string
  onClose?: () => void
}

interface ModalContentProps {
  children: ReactNode
  className?: string
}

interface ModalFooterProps {
  children: ReactNode
  className?: string
}

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[90vw]',
}

export function Modal({ open, onClose, children, className, size = 'md' }: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, handleEscape])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-(--surface-overlay) animate-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          'relative w-full mx-4 bg-(--surface-primary)',
          'rounded-2xl shadow-xl border border-(--border-primary)',
          'animate-scale-in',
          sizeStyles[size],
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({ children, className, onClose }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-6 py-4',
        'border-b border-(--border-secondary)',
        className
      )}
    >
      <h2 className="text-base font-semibold text-(--text-primary)">{children}</h2>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-(--text-tertiary) hover:text-(--text-primary) hover:bg-(--interactive-hover) transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export function ModalContent({ children, className }: ModalContentProps) {
  return (
    <div className={cn('px-6 py-4 max-h-[70vh] overflow-y-auto', className)}>
      {children}
    </div>
  )
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 px-6 py-4',
        'border-t border-(--border-secondary)',
        className
      )}
    >
      {children}
    </div>
  )
}
