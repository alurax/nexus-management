import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { supplierSchema, type Supplier, type SupplierFormData } from './types'
import { useCreateSupplier, useUpdateSupplier } from './api'

interface SupplierDialogProps {
  open: boolean
  onClose: () => void
  supplierToEdit?: Supplier | null
}

export function SupplierDialog({ open, onClose, supplierToEdit }: SupplierDialogProps) {
  const isEditing = !!supplierToEdit
  
  const createMutation = useCreateSupplier()
  const updateMutation = useUpdateSupplier()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema) as any,
    defaultValues: {
      name: '',
      contact_name: '',
      email: '',
      phone: '',
      address: '',
    },
  })

  // Reset form when opened with new data
  useEffect(() => {
    if (open) {
      reset({
        name: supplierToEdit?.name || '',
        contact_name: supplierToEdit?.contact_name || '',
        email: supplierToEdit?.email || '',
        phone: supplierToEdit?.phone || '',
        address: supplierToEdit?.address || '',
      })
    }
  }, [open, supplierToEdit, reset])

  const onSubmit = async (data: SupplierFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: supplierToEdit.id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      onClose()
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
              {isEditing ? 'Edit Supplier' : 'Add Supplier'}
            </h2>
            <p className="text-sm text-(--text-tertiary)">
              {isEditing ? 'Update partner details.' : 'Register a new supplier.'}
            </p>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField label="Company Name" error={errors.name?.message} required>
              <Input
                {...register('name')}
                placeholder="e.g. Shimano Inc."
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Contact Person" error={errors.contact_name?.message}>
              <Input
                {...register('contact_name')}
                placeholder="e.g. John Doe"
                disabled={isSubmitting}
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Email Address" error={errors.email?.message}>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="john@example.com"
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField label="Phone Number" error={errors.phone?.message}>
                <Input
                  {...register('phone')}
                  placeholder="+63 912 345 6789"
                  disabled={isSubmitting}
                />
              </FormField>
            </div>

            <FormField label="Address" error={errors.address?.message}>
              <textarea
                {...register('address')}
                disabled={isSubmitting}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--border-focus) focus:ring-1 focus:ring-(--border-focus) transition-shadow disabled:opacity-50 disabled:bg-(--surface-secondary) resize-none"
                placeholder="Full address of the supplier..."
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-(--border-primary)">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {isEditing ? 'Save Changes' : 'Create Supplier'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  )
}
