import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useUpdateSaleNotes } from './api'

interface EditRemarksDialogProps {
  open: boolean
  onClose: () => void
  orderId: string | null
  initialNotes: string
}

export function EditRemarksDialog({ open, onClose, orderId, initialNotes }: EditRemarksDialogProps) {
  const [notes, setNotes] = useState(initialNotes)
  const updateMutation = useUpdateSaleNotes()

  useEffect(() => {
    if (open) {
      setNotes(initialNotes || '')
    }
  }, [open, initialNotes])

  const handleSubmit = async () => {
    if (!orderId) return
    try {
      await updateMutation.mutateAsync({
        order_id: orderId,
        notes: notes.trim()
      })
      onClose()
    } catch (error) {
      // error handled by mutation
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col">
        <div className="px-6 py-4 border-b border-(--border-primary) flex justify-between items-center bg-(--surface-primary)">
          <div>
            <h2 className="text-lg font-semibold text-(--text-primary)">
              Edit Remarks
            </h2>
            <p className="text-sm text-(--text-tertiary)">
              Update order notes or payment remarks.
            </p>
          </div>
        </div>
        
        <div className="p-6 bg-(--surface-secondary) flex-1 overflow-y-auto">
          <div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Payment in care of John Doe..."
              className="w-full p-3 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--brand-primary) min-h-[120px]"
            />
          </div>
        </div>

        <div className="p-4 border-t border-(--border-primary) bg-(--surface-primary) flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={updateMutation.isPending}>
            Save Remarks
          </Button>
        </div>
      </div>
    </Modal>
  )
}
