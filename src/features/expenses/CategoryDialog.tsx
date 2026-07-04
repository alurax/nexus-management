import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { expenseCategorySchema, type ExpenseCategoryFormData } from './types'
import { useCreateExpenseCategory } from './api'

interface CategoryDialogProps {
  open: boolean
  onClose: () => void
}

export function CategoryDialog({ open, onClose }: CategoryDialogProps) {
  const createMutation = useCreateExpenseCategory()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseCategoryFormData>({
    resolver: zodResolver(expenseCategorySchema) as any,
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (open) reset({ name: '' })
  }, [open, reset])

  const onSubmit = async (data: ExpenseCategoryFormData) => {
    try {
      await createMutation.mutateAsync(data)
      onClose()
    } catch (error) {
      // Handled by mutation
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col">
        <div className="px-6 py-4 border-b border-(--border-primary)">
          <h2 className="text-lg font-semibold text-(--text-primary)">
            Add Category
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Category Name" error={errors.name?.message} required>
              <Input
                {...register('name')}
                placeholder="e.g. Marketing"
                disabled={isSubmitting}
                autoFocus
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-(--border-primary)">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Create
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  )
}
