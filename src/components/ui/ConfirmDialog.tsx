import { Modal, ModalHeader, ModalContent, ModalFooter } from './Modal'
import { Button } from './Button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <ModalHeader onClose={onClose}>{title}</ModalHeader>
      <ModalContent>
        <div className="flex gap-4">
          <div
            className={`shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${
              variant === 'danger'
                ? 'bg-danger-50 text-danger-600 dark:bg-danger-500/15'
                : 'bg-warning-50 text-warning-600 dark:bg-warning-500/15'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-sm text-(--text-secondary) leading-relaxed">
            {description}
          </p>
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          size="sm"
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
