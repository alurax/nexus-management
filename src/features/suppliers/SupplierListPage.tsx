import { useState, useMemo } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { DataTable } from '@/components/data-table/DataTable'
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/Button'
import { Plus, Edit2, Trash2, Mail, Phone } from 'lucide-react'
import { SupplierDialog } from './SupplierDialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useSuppliers, useDeleteSupplier } from './api'
import type { Supplier } from './types'

const columnHelper = createColumnHelper<Supplier>()

export function SupplierListPage() {
  const { data: suppliers, isLoading } = useSuppliers()
  const deleteMutation = useDeleteSupplier()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null)

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setDialogOpen(true)
  }

  const handleDeleteClick = (supplier: Supplier) => {
    setDeletingSupplier(supplier)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (deletingSupplier) {
      await deleteMutation.mutateAsync(deletingSupplier.id)
      setDeleteConfirmOpen(false)
      setDeletingSupplier(null)
    }
  }

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Company Name',
      cell: (info) => (
        <div className="flex flex-col">
          <span className="font-medium text-(--text-primary)">{info.getValue()}</span>
          <span className="text-xs text-(--text-tertiary)">{info.row.original.contact_name || 'No contact person'}</span>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'contact',
      header: 'Contact Info',
      cell: (info) => {
        const email = info.row.original.email
        const phone = info.row.original.phone
        return (
          <div className="flex flex-col gap-1">
            {email && (
              <div className="flex items-center gap-1.5 text-xs text-(--text-secondary)">
                <Mail className="h-3 w-3 text-(--text-tertiary)" />
                <a href={`mailto:${email}`} className="hover:text-brand-500 hover:underline">{email}</a>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-1.5 text-xs text-(--text-secondary)">
                <Phone className="h-3 w-3 text-(--text-tertiary)" />
                <a href={`tel:${phone}`} className="hover:text-brand-500 hover:underline">{phone}</a>
              </div>
            )}
            {!email && !phone && <span className="text-xs text-(--text-tertiary)">-</span>}
          </div>
        )
      },
    }),
    columnHelper.accessor('address', {
      header: 'Address',
      cell: (info) => (
        <span className="text-(--text-secondary) max-w-[200px] truncate block" title={info.getValue() || ''}>
          {info.getValue() || '-'}
        </span>
      ),
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
            aria-label="Edit supplier"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-danger-500 hover:text-danger-600 hover:bg-danger-50"
            onClick={() => handleDeleteClick(info.row.original)}
            aria-label="Delete supplier"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ], [])

  return (
    <PageContainer
      title="Suppliers"
      description="Manage your wholesale partners and inventory sources."
      action={
        <Button onClick={() => {
          setEditingSupplier(null)
          setDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      }
    >
      <div className="bg-(--surface-primary) rounded-xl border border-(--border-primary) p-4">
        <DataTable
          data={suppliers || []}
          columns={columns as any}
          loading={isLoading}
          searchPlaceholder="Search suppliers by name or email..."
        />
      </div>

      <SupplierDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        supplierToEdit={editingSupplier}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Supplier"
        description={`Are you sure you want to delete "${deletingSupplier?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Supplier"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </PageContainer>
  )
}
