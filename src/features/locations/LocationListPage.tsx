import { useState, useMemo } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { DataTable } from '@/components/data-table/DataTable'
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { LocationDialog } from './LocationDialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useLocations, useDeleteLocation } from './api'
import type { Location } from './types'

const columnHelper = createColumnHelper<Location>()

export function LocationListPage() {
  const { data: locations, isLoading } = useLocations()
  const deleteMutation = useDeleteLocation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null)

  const handleEdit = (location: Location) => {
    setEditingLocation(location)
    setDialogOpen(true)
  }

  const handleDeleteClick = (location: Location) => {
    setDeletingLocation(location)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (deletingLocation) {
      await deleteMutation.mutateAsync(deletingLocation.id)
      setDeleteConfirmOpen(false)
      setDeletingLocation(null)
    }
  }

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Location Name',
      cell: (info) => <span className="font-medium text-(--text-primary)">{info.getValue()}</span>,
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: (info) => {
        const type = info.getValue()
        const variants = {
          store: 'info',
          warehouse: 'warning',
          rental_hub: 'success'
        } as const
        
        const labels = {
          store: 'Store',
          warehouse: 'Warehouse',
          rental_hub: 'Rental Hub'
        }
        return <Badge variant={variants[type]}>{labels[type]}</Badge>
      },
    }),
    columnHelper.accessor('address', {
      header: 'Address',
      cell: (info) => (
        <span className="text-(--text-secondary) max-w-[300px] truncate block" title={info.getValue() || ''}>
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
            aria-label="Edit location"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-danger-500 hover:text-danger-600 hover:bg-danger-50"
            onClick={() => handleDeleteClick(info.row.original)}
            aria-label="Delete location"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ], [])

  return (
    <PageContainer
      title="Locations"
      description="Manage your physical stores, warehouses, and rental hubs."
      action={
        <Button onClick={() => {
          setEditingLocation(null)
          setDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      }
    >
      <div className="bg-(--surface-primary) rounded-xl border border-(--border-primary) p-4">
        <DataTable
          data={locations || []}
          columns={columns as any}
          loading={isLoading}
          searchPlaceholder="Search locations..."
        />
      </div>

      <LocationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        locationToEdit={editingLocation}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Location"
        description={`Are you sure you want to delete "${deletingLocation?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Location"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </PageContainer>
  )
}
