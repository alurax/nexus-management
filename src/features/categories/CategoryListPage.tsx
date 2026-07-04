import { useState, useMemo } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { DataTable } from '@/components/data-table/DataTable'
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/Button'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { CategoryDialog } from './CategoryDialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useCategories, useDeleteCategory } from './api'
import type { Category } from './types'

const columnHelper = createColumnHelper<Category>()

export function CategoryListPage() {
  const { data: categories, isLoading } = useCategories()
  const deleteMutation = useDeleteCategory()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (deletingCategory) {
      await deleteMutation.mutateAsync(deletingCategory.id)
      setDeleteConfirmOpen(false)
      setDeletingCategory(null)
    }
  }

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Category Name',
      cell: (info) => <span className="font-medium text-(--text-primary)">{info.getValue()}</span>,
    }),
    columnHelper.accessor('parent_id', {
      header: 'Parent Category',
      cell: (info) => {
        const parentId = info.getValue()
        if (!parentId) return <span className="text-(--text-tertiary)">-</span>
        const parent = categories?.find(c => c.id === parentId)
        return <span className="text-(--text-secondary)">{parent?.name || 'Unknown'}</span>
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => handleEdit(info.row.original)}
            aria-label="Edit category"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-danger-500 hover:text-danger-600 hover:bg-danger-50"
            onClick={() => handleDeleteClick(info.row.original)}
            aria-label="Delete category"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ], [categories])

  return (
    <PageContainer
      title="Categories"
      description="Manage product categories and taxonomy"
      action={
        <Button onClick={() => {
          setEditingCategory(null)
          setDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      }
    >
      <div className="bg-(--surface-primary) rounded-xl border border-(--border-primary) p-4">
        <DataTable
          data={categories || []}
          columns={columns as any}
          loading={isLoading}
          searchPlaceholder="Search categories..."
        />
      </div>

      <CategoryDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        categoryToEdit={editingCategory}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${deletingCategory?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Category"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </PageContainer>
  )
}
