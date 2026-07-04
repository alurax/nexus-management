import { useState, useMemo } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { DataTable } from '@/components/data-table/DataTable'
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Plus, Edit2, Trash2, Mail, Phone } from 'lucide-react'
import { CustomerDialog } from './CustomerDialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useCustomers, useDeleteCustomer } from './api'
import type { Customer } from './types'

const columnHelper = createColumnHelper<Customer>()

export function CustomerListPage() {
  const { data: customers, isLoading } = useCustomers()
  const deleteMutation = useDeleteCustomer()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setDialogOpen(true)
  }

  const handleDeleteClick = (customer: Customer) => {
    setDeletingCustomer(customer)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (deletingCustomer) {
      await deleteMutation.mutateAsync(deletingCustomer.id)
      setDeleteConfirmOpen(false)
      setDeletingCustomer(null)
    }
  }

  const columns = useMemo(() => [
    columnHelper.accessor('first_name', {
      header: 'Customer Name',
      cell: (info) => {
        const c = info.row.original
        const fullName = `${c.first_name} ${c.last_name}`
        return (
          <div className="flex items-center gap-3">
            <Avatar name={fullName} size="sm" />
            <span className="font-medium text-(--text-primary)">{fullName}</span>
          </div>
        )
      },
    }),
    columnHelper.display({
      id: 'contact',
      header: 'Contact Info',
      cell: (info) => {
        const c = info.row.original
        return (
          <div className="flex flex-col gap-1">
            {c.email ? (
              <a href={`mailto:${c.email}`} className="flex items-center text-sm text-(--text-secondary) hover:text-(--brand-primary) transition-colors">
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                {c.email}
              </a>
            ) : (
              <span className="text-sm text-(--text-tertiary)">No email</span>
            )}
            {c.phone ? (
              <a href={`tel:${c.phone}`} className="flex items-center text-sm text-(--text-secondary) hover:text-(--brand-primary) transition-colors">
                <Phone className="h-3.5 w-3.5 mr-1.5" />
                {c.phone}
              </a>
            ) : (
              <span className="text-sm text-(--text-tertiary)">No phone</span>
            )}
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
            aria-label="Edit customer"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-danger-500 hover:text-danger-600 hover:bg-danger-50"
            onClick={() => handleDeleteClick(info.row.original)}
            aria-label="Delete customer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ], [])

  return (
    <PageContainer
      title="Customers"
      description="Manage your customer directory for sales and rentals."
      action={
        <Button onClick={() => {
          setEditingCustomer(null)
          setDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      }
    >
      <div className="bg-(--surface-primary) rounded-xl border border-(--border-primary) p-4">
        <DataTable
          data={customers || []}
          columns={columns as any}
          loading={isLoading}
          searchPlaceholder="Search customers by name, email, or phone..."
        />
      </div>

      <CustomerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        customerToEdit={editingCustomer}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Customer"
        description={`Are you sure you want to delete "${deletingCustomer?.first_name} ${deletingCustomer?.last_name}"?`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </PageContainer>
  )
}
