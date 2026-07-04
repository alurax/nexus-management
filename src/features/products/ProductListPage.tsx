import { useState, useMemo } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { DataTable } from '@/components/data-table/DataTable'
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { ProductDialog } from './ProductDialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useProducts, useDeleteProduct } from './api'
import type { Product } from './types'
import { formatCurrency } from '@/utils/currency'

const columnHelper = createColumnHelper<Product>()

export function ProductListPage() {
  const { data: products, isLoading } = useProducts()
  const deleteMutation = useDeleteProduct()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (deletingProduct) {
      await deleteMutation.mutateAsync(deletingProduct.id)
      setDeleteConfirmOpen(false)
      setDeletingProduct(null)
    }
  }

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Product',
      cell: (info) => (
        <div className="flex flex-col">
          <span className="font-medium text-(--text-primary)">{info.getValue()}</span>
          <span className="text-xs text-(--text-tertiary)">SKU: {info.row.original.sku || '-'}</span>
        </div>
      ),
    }),
    columnHelper.accessor('categories.name', {
      header: 'Category',
      cell: (info) => <span className="text-(--text-secondary)">{info.getValue() || '-'}</span>,
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: (info) => {
        const type = info.getValue()
        const variants = {
          retail: 'info',
          rental: 'success',
          service: 'warning'
        } as const
        return <Badge variant={variants[type]} className="capitalize">{type}</Badge>
      },
    }),
    columnHelper.accessor('base_price', {
      header: 'Price',
      cell: (info) => <span className="font-medium text-(--text-primary)">{formatCurrency(info.getValue())}</span>,
    }),
    columnHelper.accessor('cost_price', {
      header: 'Cost',
      cell: (info) => <span className="text-(--text-tertiary)">{formatCurrency(info.getValue())}</span>,
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
            aria-label="Edit product"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-danger-500 hover:text-danger-600 hover:bg-danger-50"
            onClick={() => handleDeleteClick(info.row.original)}
            aria-label="Delete product"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ], [])

  return (
    <PageContainer
      title="Products"
      description="Manage your inventory catalog, pricing, and details."
      action={
        <Button onClick={() => {
          setEditingProduct(null)
          setDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      }
    >
      <div className="bg-(--surface-primary) rounded-xl border border-(--border-primary) p-4">
        <DataTable
          data={products || []}
          columns={columns as any}
          loading={isLoading}
          searchPlaceholder="Search products by name or SKU..."
        />
      </div>

      <ProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        productToEdit={editingProduct}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Product"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </PageContainer>
  )
}
