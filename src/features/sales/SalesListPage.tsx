import { useState, useMemo } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { DataTable } from '@/components/data-table/DataTable'
import { createColumnHelper } from '@tanstack/react-table'
import { Badge } from '@/components/ui/Badge'
import { format } from 'date-fns'
import { Undo2, Edit3, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/currency'
import { useSalesOrders } from './api'
import type { SalesOrder } from './types'
import { ReturnSaleDialog } from './ReturnSaleDialog'
import { EditRemarksDialog } from './EditRemarksDialog'
import { SaleDetailsDialog } from './SaleDetailsDialog'

const columnHelper = createColumnHelper<SalesOrder>()

export function SalesListPage() {
  const { data: sales, isLoading } = useSalesOrders()
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [remarksDialogOpen, setRemarksDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)

  const columns = useMemo(() => [
    columnHelper.accessor('created_at', {
      header: 'Date & Time',
      cell: (info) => (
        <span className="text-sm text-(--text-secondary)">
          {format(new Date(info.getValue()), 'MMM d, yyyy h:mm a')}
        </span>
      ),
    }),
    columnHelper.accessor('id', {
      header: 'Order ID',
      cell: (info) => (
        <span className="text-xs font-mono text-(--text-tertiary)" title={info.getValue()}>
          {info.getValue().substring(0, 8)}...
        </span>
      ),
    }),
    columnHelper.display({
      id: 'customer',
      header: 'Customer',
      cell: (info) => {
        const cust = info.row.original.customers
        if (!cust) return <span className="text-sm text-(--text-tertiary)">Walk-in</span>
        return <span className="font-medium text-(--text-primary)">{cust.first_name} {cust.last_name}</span>
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue()
        const variants = {
          pending: 'warning',
          completed: 'success',
          refunded: 'info',
          cancelled: 'danger'
        } as const
        return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
      },
    }),
    columnHelper.accessor('payment_method', {
      header: 'Payment',
      cell: (info) => (
        <span className="text-sm text-(--text-secondary) capitalize">
          {info.getValue() || '-'}
        </span>
      ),
    }),
    columnHelper.accessor('notes', {
      header: 'Remarks',
      cell: (info) => (
        <span className="text-xs text-(--text-secondary) italic max-w-[200px] truncate block" title={info.getValue() || ''}>
          {info.getValue() || '-'}
        </span>
      ),
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
      cell: (info) => {
        const order = info.row.original
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedOrder(order)
                setDetailsDialogOpen(true)
              }}
              title="View Receipt"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedOrder(order)
                setRemarksDialogOpen(true)
              }}
              title="Edit Remarks"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            
            {order.status === 'completed' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-danger-500 hover:text-danger-600 hover:bg-danger-50"
                onClick={() => {
                  setSelectedOrder(order)
                  setReturnDialogOpen(true)
                }}
                title="Process Return"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )
      }
    })
  ], [])

  return (
    <PageContainer
      title="Sales History"
      description="View past sales orders and transactions."
    >
      <div className="bg-(--surface-primary) rounded-xl border border-(--border-primary) p-4">
        <DataTable
          data={sales || []}
          columns={columns as any}
          loading={isLoading}
          searchPlaceholder="Search by Customer or Order ID..."
        />
      </div>

      <ReturnSaleDialog
        open={returnDialogOpen}
        onClose={() => {
          setReturnDialogOpen(false)
          setSelectedOrder(null)
        }}
        orderId={selectedOrder?.id || null}
      />

      <EditRemarksDialog
        open={remarksDialogOpen}
        onClose={() => {
          setRemarksDialogOpen(false)
          setSelectedOrder(null)
        }}
        orderId={selectedOrder?.id || null}
        initialNotes={selectedOrder?.notes || ''}
      />

      <SaleDetailsDialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
      />
    </PageContainer>
  )
}
