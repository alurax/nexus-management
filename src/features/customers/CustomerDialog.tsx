import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { customerSchema, type Customer, type CustomerFormData } from './types'
import { useCreateCustomer, useUpdateCustomer } from './api'

interface CustomerDialogProps {
  open: boolean
  onClose: () => void
  customerToEdit?: Customer | null
}

export function CustomerDialog({ open, onClose, customerToEdit }: CustomerDialogProps) {
  const isEditing = !!customerToEdit
  
  const createMutation = useCreateCustomer()
  const updateMutation = useUpdateCustomer()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema) as any,
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        first_name: customerToEdit?.first_name || '',
        last_name: customerToEdit?.last_name || '',
        email: customerToEdit?.email || '',
        phone: customerToEdit?.phone || '',
        address: customerToEdit?.address || '',
      })
    }
  }, [open, customerToEdit, reset])

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: customerToEdit.id, data })
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
              {isEditing ? 'Edit Customer' : 'Add Customer'}
            </h2>
            <p className="text-sm text-(--text-tertiary)">
              {isEditing ? 'Update customer details.' : 'Register a new customer profile.'}
            </p>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="First Name" error={errors.first_name?.message} required>
                <Input
                  {...register('first_name')}
                  placeholder="e.g. John"
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField label="Last Name" error={errors.last_name?.message} required>
                <Input
                  {...register('last_name')}
                  placeholder="e.g. Doe"
                  disabled={isSubmitting}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Email" error={errors.email?.message}>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="e.g. john@example.com"
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField label="Phone" error={errors.phone?.message}>
                <Input
                  {...register('phone')}
                  type="tel"
                  placeholder="e.g. +63 912 345 6789"
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
                placeholder="Full address..."
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-(--border-primary)">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {isEditing ? 'Save Changes' : 'Create Customer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  )
}
