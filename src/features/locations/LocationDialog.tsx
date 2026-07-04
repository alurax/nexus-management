import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { locationSchema, type Location, type LocationFormData } from './types'
import { useCreateLocation, useUpdateLocation } from './api'

interface LocationDialogProps {
  open: boolean
  onClose: () => void
  locationToEdit?: Location | null
}

export function LocationDialog({ open, onClose, locationToEdit }: LocationDialogProps) {
  const isEditing = !!locationToEdit
  
  const createMutation = useCreateLocation()
  const updateMutation = useUpdateLocation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema) as any,
    defaultValues: {
      name: '',
      type: 'store',
      address: '',
    },
  })

  // Reset form when opened with new data
  useEffect(() => {
    if (open) {
      reset({
        name: locationToEdit?.name || '',
        type: locationToEdit?.type || 'store',
        address: locationToEdit?.address || '',
      })
    }
  }, [open, locationToEdit, reset])

  const onSubmit = async (data: LocationFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: locationToEdit.id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      onClose()
    } catch (error) {
      // Error handled by mutation toast
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col">
        <div className="px-6 py-4 border-b border-(--border-primary) flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-(--text-primary)">
              {isEditing ? 'Edit Location' : 'Add Location'}
            </h2>
            <p className="text-sm text-(--text-tertiary)">
              {isEditing ? 'Update location details.' : 'Register a new physical location.'}
            </p>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField label="Location Name" error={errors.name?.message} required>
              <Input
                {...register('name')}
                placeholder="e.g. Main Hub El Nido"
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Location Type" error={errors.type?.message} required>
              <select
                {...register('type')}
                disabled={isSubmitting}
                className="w-full h-10 px-3 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--border-focus) focus:ring-1 focus:ring-(--border-focus) transition-shadow disabled:opacity-50 disabled:bg-(--surface-secondary)"
              >
                <option value="store">Store Front</option>
                <option value="warehouse">Warehouse</option>
                <option value="rental_hub">Rental Hub</option>
              </select>
            </FormField>

            <FormField label="Address" error={errors.address?.message}>
              <textarea
                {...register('address')}
                disabled={isSubmitting}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--border-focus) focus:ring-1 focus:ring-(--border-focus) transition-shadow disabled:opacity-50 disabled:bg-(--surface-secondary) resize-none"
                placeholder="Full physical address..."
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-(--border-primary)">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {isEditing ? 'Save Changes' : 'Create Location'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  )
}
