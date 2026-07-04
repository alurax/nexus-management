import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { stockAdjustmentSchema, type ProductWithInventory, type StockAdjustmentFormData } from './types'
import { useAdjustInventory } from './api'
import { useLocations } from '@/features/locations/api'

interface StockAdjustmentDialogProps {
  open: boolean
  onClose: () => void
  product: ProductWithInventory | null
}

export function StockAdjustmentDialog({ open, onClose, product }: StockAdjustmentDialogProps) {
  const { data: locations } = useLocations()
  const adjustMutation = useAdjustInventory()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(stockAdjustmentSchema) as any,
    defaultValues: {
      product_id: '',
      location_id: '',
      type: 'receive',
      quantity_change: 0,
      notes: '',
    },
  })

  useEffect(() => {
    if (open && product) {
      reset({
        product_id: product.id,
        location_id: locations?.[0]?.id || '', // default to first location if available
        type: 'receive',
        quantity_change: 0,
        notes: '',
      })
    }
  }, [open, product, locations, reset])

  const [action, setAction] = useState<'add' | 'reduce'>('add')

  const onSubmit = async (data: StockAdjustmentFormData) => {
    try {
      const finalData = {
        ...data,
        type: action === 'add' ? 'receive' as const : 'adjustment' as const,
        quantity_change: action === 'add' ? Math.abs(data.quantity_change) : -Math.abs(data.quantity_change)
      }
      await adjustMutation.mutateAsync(finalData)
      onClose()
      setAction('add')
    } catch (error) {
      // Error handled by mutation toast
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="flex flex-col">
        <div className="px-6 py-4 border-b border-(--border-primary) flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-(--text-primary)">
              Adjust Stock
            </h2>
            <p className="text-sm text-(--text-tertiary)">
              {product?.name} ({product?.sku || 'No SKU'})
            </p>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField label="Location" error={errors.location_id?.message} required>
              <select
                {...register('location_id')}
                disabled={isSubmitting}
                className="w-full h-10 px-3 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--border-focus) focus:ring-1 focus:ring-(--border-focus) transition-shadow disabled:opacity-50 disabled:bg-(--surface-secondary)"
              >
                <option value="">Select a location</option>
                {locations?.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Action" required>
                <div className="flex bg-(--surface-secondary) p-1 rounded-lg border border-(--border-primary)">
                  <button
                    type="button"
                    onClick={() => setAction('add')}
                    className={`flex-1 h-8 text-sm font-medium rounded-md transition-all ${
                      action === 'add'
                        ? 'bg-success-600 text-white shadow-sm'
                        : 'text-(--text-secondary) hover:text-(--text-primary)'
                    }`}
                  >
                    Add Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction('reduce')}
                    className={`flex-1 h-8 text-sm font-medium rounded-md transition-all ${
                      action === 'reduce'
                        ? 'bg-danger-600 text-white shadow-sm'
                        : 'text-(--text-secondary) hover:text-(--text-primary)'
                    }`}
                  >
                    Reduce Stock
                  </button>
                </div>
              </FormField>

              <FormField label="Quantity" error={errors.quantity_change?.message} required>
                <Input
                  {...register('quantity_change', { valueAsNumber: true })}
                  type="number"
                  placeholder="e.g. 10"
                  min="1"
                  disabled={isSubmitting}
                />
              </FormField>
            </div>

            <FormField label="Notes" error={errors.notes?.message}>
              <textarea
                {...register('notes')}
                disabled={isSubmitting}
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--border-focus) focus:ring-1 focus:ring-(--border-focus) transition-shadow disabled:opacity-50 disabled:bg-(--surface-secondary) resize-none"
                placeholder="Reason for adjustment..."
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-(--border-primary)">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Confirm Adjustment
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  )
}
