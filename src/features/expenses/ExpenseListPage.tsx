import { useState, useMemo } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { DataTable } from '@/components/data-table/DataTable'
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/Button'
import { Plus, Tag, Trash2, Link } from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency } from '@/utils/currency'
import { useExpenses, useDeleteExpense } from './api'
import type { Expense } from './types'
import { ExpenseDialog } from './ExpenseDialog'
import { CategoryDialog } from './CategoryDialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

const columnHelper = createColumnHelper<Expense>()

export function ExpenseListPage() {
  const { data: expenses, isLoading } = useExpenses()
  const deleteMutation = useDeleteExpense()

  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null)

  const columns = useMemo(() => [
    columnHelper.accessor('date', {
      header: 'Date',
      cell: (info) => (
        <span className="text-sm font-medium text-(--text-primary)">
          {format(new Date(info.getValue()), 'MMM d, yyyy')}
        </span>
      ),
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      cell: (info) => <span className="text-(--text-secondary)">{info.getValue()}</span>,
    }),
    columnHelper.accessor('expense_categories.name', {
      header: 'Category',
      cell: (info) => (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-(--surface-secondary) text-(--text-secondary) border border-(--border-primary)">
          {info.getValue() || '-'}
        </span>
      ),
    }),
    columnHelper.accessor('amount', {
      header: 'Amount',
      cell: (info) => (
        <span className="font-semibold text-(--text-primary)">
          {formatCurrency(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor('receipt_url', {
      header: 'Receipt',
      cell: (info) => {
        const url = info.getValue()
        if (!url) return <span className="text-xs text-(--text-tertiary)">-</span>
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-(--brand-primary) hover:underline flex items-center text-xs">
            <Link className="h-3 w-3 mr-1" /> View
          </a>
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <div className="flex items-center justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-danger-500 hover:text-danger-600 hover:bg-danger-50"
            onClick={() => {
              setDeletingExpense(info.row.original)
              setDeleteConfirmOpen(true)
            }}
            aria-label="Delete expense"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ], [])

  return (
    <PageContainer
      title="Expenses"
      description="Track and manage business expenses."
      action={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCategoryDialogOpen(true)}>
            <Tag className="h-4 w-4 mr-2" />
            Categories
          </Button>
          <Button onClick={() => setExpenseDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Log Expense
          </Button>
        </div>
      }
    >
      <div className="bg-(--surface-primary) rounded-xl border border-(--border-primary) p-4">
        <DataTable
          data={expenses || []}
          columns={columns as any}
          loading={isLoading}
          searchPlaceholder="Search expenses by description..."
        />
      </div>

      <ExpenseDialog open={expenseDialogOpen} onClose={() => setExpenseDialogOpen(false)} />
      <CategoryDialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={async () => {
          if (deletingExpense) {
            await deleteMutation.mutateAsync(deletingExpense.id)
            setDeleteConfirmOpen(false)
            setDeletingExpense(null)
          }
        }}
        title="Delete Expense"
        description="Are you sure you want to delete this expense record? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </PageContainer>
  )
}
