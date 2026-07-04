import { useState, useMemo } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { DataTable } from '@/components/data-table/DataTable'
import { createColumnHelper } from '@tanstack/react-table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Plus, Settings } from 'lucide-react'
import { format } from 'date-fns'
import { useRentals, useUpdateRentalStatus } from './api'
import type { RentalReservation } from './types'
import { RentalDialog } from './RentalDialog'
import { formatCurrency } from '@/utils/currency'
import { Modal } from '@/components/ui/Modal'
import { useLocations } from '@/features/locations/api'

const columnHelper = createColumnHelper<RentalReservation>()

export function RentalListPage() {
  const { data: rentals, isLoading } = useRentals()
  const { data: locations } = useLocations()
  const updateStatus = useUpdateRentalStatus()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedRental, setSelectedRental] = useState<RentalReservation | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState('')
  const [statusDateOverride, setStatusDateOverride] = useState('')

  const handleStatusChange = async (newStatus: 'active' | 'completed' | 'cancelled') => {
    if (!selectedRental) return
    if (!selectedLocationId && (newStatus === 'active' || newStatus === 'completed')) {
      alert('Please select a location for inventory processing.')
      return
    }
    
    await updateStatus.mutateAsync({
      id: selectedRental.id,
      status: newStatus,
      location_id: selectedLocationId,
      created_at: statusDateOverride ? new Date(statusDateOverride).toISOString() : undefined
    })
    
    setStatusDialogOpen(false)
    setSelectedRental(null)
    setStatusDateOverride('')
  }

  const columns = useMemo(() => [
    columnHelper.accessor('id', {
      header: 'Reservation ID',
      cell: (info) => (
        <span className="text-xs font-mono text-(--text-tertiary)" title={info.getValue()}>
          {info.getValue().substring(0, 8)}...
        </span>
      ),
    }),
    columnHelper.accessor('customers', {
      header: 'Customer',
      cell: (info) => {
        const cust = info.getValue()
        return <span className="font-medium text-(--text-primary)">{cust?.first_name} {cust?.last_name}</span>
      },
    }),
    columnHelper.display({
      id: 'dates',
      header: 'Dates',
      cell: (info) => {
        const { start_date, end_date } = info.row.original
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-(--text-secondary)">{format(new Date(start_date), 'MMM d, h:mm a')}</span>
            <span className="text-xs text-(--text-tertiary)">to {format(new Date(end_date), 'MMM d, h:mm a')}</span>
          </div>
        )
      }
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue()
        const variants = {
          reserved: 'info',
          active: 'warning',
          completed: 'success',
          cancelled: 'danger'
        } as const
        return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
      },
    }),
    columnHelper.accessor('total_amount', {
      header: 'Total',
      cell: (info) => (
        <div className="font-semibold text-(--text-primary)">
          {formatCurrency(info.getValue())}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <div className="flex items-center justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm text-(--text-secondary) hover:text-(--brand-primary)"
            onClick={() => {
              setSelectedRental(info.row.original)
              setStatusDialogOpen(true)
            }}
          >
            <Settings className="h-4 w-4 mr-1.5" />
            Manage
          </Button>
        </div>
      ),
    }),
  ], [])

  return (
    <PageContainer
      title="Rental Management"
      description="Track equipment reservations and active rentals."
      action={
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Reservation
        </Button>
      }
    >
      <div className="bg-(--surface-primary) rounded-xl border border-(--border-primary) p-4">
        <DataTable
          data={rentals || []}
          columns={columns as any}
          loading={isLoading}
          searchPlaceholder="Search reservations..."
        />
      </div>

      <RentalDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

      {/* Status Management Dialog */}
      <Modal open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} size="sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-(--text-primary) mb-2">Manage Reservation</h3>
          <p className="text-sm text-(--text-secondary) mb-4">
            Update the status of this rental. Active and Completed statuses will automatically adjust inventory.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-(--text-secondary) mb-1.5">
                Processing Location
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--brand-primary)"
              >
                <option value="">Select location for inventory...</option>
                {locations?.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-6 mt-4">
              <label className="block text-xs font-medium text-(--text-secondary) mb-1.5">
                Advanced: Status Date Override
              </label>
              <input
                type="datetime-local"
                value={statusDateOverride}
                onChange={(e) => setStatusDateOverride(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--brand-primary)"
              />
              <p className="text-[10px] text-(--text-tertiary) mt-1">Leave blank for "Right Now"</p>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-(--border-primary)">
              {selectedRental?.status === 'reserved' && (
                <Button 
                  className="w-full"
                  onClick={() => handleStatusChange('active')}
                  loading={updateStatus.isPending}
                >
                  Mark as Active (Pick up items)
                </Button>
              )}
              {selectedRental?.status === 'active' && (
                <Button 
                  variant="outline"
                  className="w-full text-success-600 border-success-200 hover:bg-success-50 hover:border-success-300"
                  onClick={() => handleStatusChange('completed')}
                  loading={updateStatus.isPending}
                >
                  Mark as Completed (Return items)
                </Button>
              )}
              {(selectedRental?.status === 'reserved' || selectedRental?.status === 'active') && (
                <Button 
                  variant="ghost"
                  className="w-full text-danger-500 hover:text-danger-600 hover:bg-danger-50 mt-2"
                  onClick={() => handleStatusChange('cancelled')}
                  loading={updateStatus.isPending}
                >
                  Cancel Reservation
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>

    </PageContainer>
  )
}
