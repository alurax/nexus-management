import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useReturnSale } from './api'
import { useLocations } from '@/features/locations/api'

interface ReturnSaleDialogProps {
  open: boolean
  onClose: () => void
  orderId: string | null
}

export function ReturnSaleDialog({ open, onClose, orderId }: ReturnSaleDialogProps) {
  const [notes, setNotes] = useState('')
  const [locationId, setLocationId] = useState('')
  const returnMutation = useReturnSale()
  const { data: locations } = useLocations()

  const handleSubmit = async () => {
    if (!orderId) return
    if (!locationId) {
      alert('Please select a location to restock the items.')
      return
    }

    try {
      await returnMutation.mutateAsync({
        order_id: orderId,
        location_id: locationId,
        notes: notes.trim()
      })
      setNotes('')
      setLocationId('')
      onClose()
    } catch (error) {
      // error handled by mutation
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="flex flex-col">
        <div className="px-6 py-4 border-b border-(--border-primary) flex justify-between items-center bg-(--surface-primary)">
          <div>
            <h2 className="text-lg font-semibold text-(--text-primary)">
              Process Order Return
            </h2>
            <p className="text-sm text-(--text-tertiary)">
              Restock all items to a specific location and mark order as refunded.
            </p>
          </div>
        </div>
        
        <div className="p-6 bg-(--surface-secondary) flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-(--text-secondary) mb-1.5">
              Restock Location <span className="text-danger-500">*</span>
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full h-10 px-3 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--brand-primary)"
            >
              <option value="">Select location...</option>
              {locations?.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-(--text-secondary) mb-1.5">
              Return Remarks (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Returned due to defect, exchanged..."
              className="w-full p-3 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--brand-primary) min-h-[100px]"
            />
          </div>
        </div>

        <div className="p-4 border-t border-(--border-primary) bg-(--surface-primary) flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={returnMutation.isPending}>
            Cancel
          </Button>
          <Button 
            variant="primary"
            className="bg-danger-600 hover:bg-danger-700" 
            onClick={handleSubmit} 
            loading={returnMutation.isPending}
            disabled={!locationId}
          >
            Confirm Return
          </Button>
        </div>
      </div>
    </Modal>
  )
}
