import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { expenseSchema, type ExpenseFormData, type Expense } from './types'
import { useCreateExpense, useUpdateExpense, useExpenseCategories } from './api'
import { format } from 'date-fns'

interface ExpenseDialogProps {
  open: boolean
  onClose: () => void
  expense?: Expense | null
}

export function ExpenseDialog({ open, onClose, expense }: ExpenseDialogProps) {
  const createMutation = useCreateExpense()
  const updateMutation = useUpdateExpense()
  const { data: categories } = useExpenseCategories()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      category_id: '',
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      payment_method: 'cash',
      receipt_url: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (expense) {
        reset({
          category_id: expense.category_id,
          amount: expense.amount,
          date: expense.date,
          description: expense.description,
          payment_method: expense.payment_method || 'cash',
          receipt_url: expense.receipt_url || '',
        })
      } else {
        reset({
          category_id: '',
          amount: 0,
          date: format(new Date(), 'yyyy-MM-dd'),
          description: '',
          payment_method: 'cash',
          receipt_url: '',
        })
      }
    }
  }, [open, expense, reset])

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      if (expense) {
        await updateMutation.mutateAsync({ id: expense.id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      onClose()
    } catch (error) {
      // Handled by mutation toast
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="flex flex-col">
        <div className="px-6 py-4 border-b border-(--border-primary) flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-(--text-primary)">
              {expense ? 'Edit Expense' : 'Log New Expense'}
            </h2>
            <p className="text-sm text-(--text-tertiary)">
              Record a new business expense.
            </p>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField label="Category" error={errors.category_id?.message} required>
              <select
                {...register('category_id')}
                disabled={isSubmitting}
                className="w-full h-10 px-3 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--border-focus) focus:ring-1 focus:ring-(--border-focus) transition-shadow disabled:opacity-50"
              >
                <option value="">Select a category...</option>
                {categories?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Amount" error={errors.amount?.message} required>
                <Input
                  type="number"
                  step="0.01"
                  {...register('amount', { valueAsNumber: true })}
                  placeholder="0.00"
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField label="Date" error={errors.date?.message} required>
                <Input
                  type="date"
                  {...register('date')}
                  disabled={isSubmitting}
                />
              </FormField>
            </div>

            <FormField label="Description" error={errors.description?.message} required>
              <Input
                {...register('description')}
                placeholder="What was this expense for?"
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Payment Method" error={errors.payment_method?.message} required>
              <select
                {...register('payment_method')}
                disabled={isSubmitting}
                className="w-full h-10 px-3 rounded-lg border border-(--border-primary) bg-(--surface-primary) text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="cash">Cash</option>
                <option value="gcash">GCash</option>
                <option value="ewallet">E-Wallet</option>
              </select>
            </FormField>

            <FormField label="Receipt URL (Optional)" error={errors.receipt_url?.message}>
              <Input
                {...register('receipt_url')}
                placeholder="https://..."
                disabled={isSubmitting}
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-(--border-primary)">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {expense ? 'Save Changes' : 'Log Expense'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  )
}
