import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { categorySchema, type Category, type CategoryFormData } from './types'
import { useCategories, useCreateCategory, useUpdateCategory } from './api'

interface CategoryDialogProps {
  open: boolean
  onClose: () => void
  categoryToEdit?: Category | null
}

export function CategoryDialog({ open, onClose, categoryToEdit }: CategoryDialogProps) {
  const isEditing = !!categoryToEdit
  
  const { data: categories } = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      parent_id: '',
    },
  })

  // Reset form when opened with new data
  useEffect(() => {
    if (open) {
      reset({
        name: categoryToEdit?.name || '',
        parent_id: categoryToEdit?.parent_id || '',
      })
    }
  }, [open, categoryToEdit, reset])

  const onSubmit = async (data: CategoryFormData) => {
    // Convert empty string to null for parent_id
    const payload = {
      ...data,
      parent_id: data.parent_id || null,
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: categoryToEdit.id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onClose()
    } catch (error) {
      // Error handled by mutation toast
    }
  }

  // Filter out the category being edited from the parent dropdown to prevent self-reference
  const parentOptions = categories?.filter((c) => c.id !== categoryToEdit?.id) || []

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="flex flex-col">
        <div className="px-6 py-4 border-b border-(--border-primary) flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-(--text-primary)">
              {isEditing ? 'Edit Category' : 'Add Category'}
            </h2>
            <p className="text-sm text-(--text-tertiary)">
              {isEditing ? 'Make changes to this category.' : 'Create a new category for your products.'}
            </p>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Category Name" error={errors.name?.message} required>
          <Input
            {...register('name')}
            placeholder="e.g. Fishing Rods"
            disabled={isSubmitting}
          />
        </FormField>

        <FormField label="Parent Category" error={errors.parent_id?.message}>
          <select
            {...register('parent_id')}
            disabled={isSubmitting}
            className="w-full h-10 px-3 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--border-focus) focus:ring-1 focus:ring-(--border-focus) transition-shadow disabled:opacity-50 disabled:bg-(--surface-secondary)"
          >
            <option value="">None (Top-Level)</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>

        <div className="flex justify-end gap-3 pt-4 border-t border-(--border-primary)">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
      </div>
      </div>
    </Modal>
  )
}
