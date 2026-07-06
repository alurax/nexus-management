import { useState, useMemo } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { DataTable } from '@/components/data-table/DataTable'
import { createColumnHelper } from '@tanstack/react-table'
import { Badge } from '@/components/ui/Badge'
import { format } from 'date-fns'
import { Undo2, Edit3, Eye, CheckCircle2, PenSquare, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/currency'
import { useSalesOrders, useUpdateSaleStatus, useDeleteSale } from './api'
import { useExpenses } from '@/features/expenses/api'
import type { SalesOrder } from './types'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ReturnSaleDialog } from './ReturnSaleDialog'
import { EditRemarksDialog } from './EditRemarksDialog'
import { SaleDetailsDialog } from './SaleDetailsDialog'
import { EditSaleDialog } from './EditSaleDialog'

const columnHelper = createColumnHelper<SalesOrder>()

export function SalesListPage() {
  const { data: sales, isLoading: salesLoading } = useSalesOrders()
  const { data: expenses, isLoading: expensesLoading } = useExpenses()
  
  const isLoading = salesLoading || expensesLoading
  
  const updateStatus = useUpdateSaleStatus()
  const deleteSale = useDeleteSale()
  
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [remarksDialogOpen, setRemarksDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [editSaleDialogOpen, setEditSaleDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)
  
  const [paymentFilter, setPaymentFilter] = useState<string>('all')

  const filteredSales = useMemo(() => {
    if (!sales) return []
    if (paymentFilter === 'all') return sales
    return sales.filter(s => s.payment_method === paymentFilter)
  }, [sales, paymentFilter])

  const totalFilteredAmount = useMemo(() => {
    return filteredSales.reduce((sum, sale) => {
      // Only count completed sales in the total (Care Of is unpaid)
      if (sale.status === 'completed') {
        return sum + Number(sale.total_amount)
      }
      return sum
    }, 0)
  }, [filteredSales])

  const totalExpenses = useMemo(() => {
    if (!expenses) return 0
    let filteredExpenses = expenses
    if (paymentFilter !== 'all') {
      filteredExpenses = expenses.filter(e => (e.payment_method || 'cash') === paymentFilter)
    }
    return filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
  }, [expenses, paymentFilter])

  const netCashOnHand = totalFilteredAmount - totalExpenses

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
          care_of: 'warning',
          refunded: 'info',
          cancelled: 'danger'
        } as const
        const formatted = status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        return <Badge variant={variants[status as keyof typeof variants] || 'default'}>{formatted}</Badge>
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

            {order.status === 'care_of' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-success-600 hover:text-success-700 hover:bg-success-50"
                onClick={() => updateStatus.mutate({ order_id: order.id, status: 'completed' })}
                title="Mark as Paid"
                loading={updateStatus.isPending}
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}

            {(order.status === 'completed' || order.status === 'care_of') && (
              <Button
                variant="ghost"
                size="sm"
                className="text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                onClick={() => {
                  setSelectedOrder(order)
                  setEditSaleDialogOpen(true)
                }}
                title="Edit Checkout (Prices/Quantities)"
              >
                <PenSquare className="h-4 w-4" />
              </Button>
            )}
            
            {order.status === 'completed' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-warning-500 hover:text-warning-600 hover:bg-warning-50"
                onClick={() => {
                  setSelectedOrder(order)
                  setReturnDialogOpen(true)
                }}
                title="Process Return (Refund)"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-danger-500 hover:text-danger-600 hover:bg-danger-50"
              onClick={() => {
                setSelectedOrder(order)
                setDeleteDialogOpen(true)
              }}
              title="Delete Permanently"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex flex-wrap gap-4">
          <div className="bg-(--surface-primary) px-4 py-3 rounded-xl border border-(--border-primary) flex flex-col">
            <span className="text-xs font-medium text-(--text-tertiary) mb-1">Total Sales</span>
            <span className="text-lg font-bold text-success-600 dark:text-success-400">
              {formatCurrency(totalFilteredAmount)}
            </span>
          </div>
          
          <div className="bg-(--surface-primary) px-4 py-3 rounded-xl border border-(--border-primary) flex flex-col">
            <span className="text-xs font-medium text-(--text-tertiary) mb-1">Total Expenses</span>
            <span className="text-lg font-bold text-danger-500">
              {formatCurrency(totalExpenses)}
            </span>
          </div>

          <div className="bg-(--brand-primary) px-4 py-3 rounded-xl border border-brand-600 flex flex-col shadow-sm">
            <span className="text-xs font-medium text-white/80 mb-1">Net on Hand</span>
            <span className="text-lg font-bold text-white">
              {formatCurrency(netCashOnHand)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-(--text-tertiary)">Filter by Payment:</label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-(--border-primary) bg-(--surface-primary) text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Payments</option>
            <option value="cash">Cash</option>
            <option value="gcash">GCash</option>
            <option value="ewallet">E-Wallet</option>
          </select>
        </div>
      </div>

      <div className="bg-(--surface-primary) rounded-xl border border-(--border-primary) p-4">
        <DataTable
          data={filteredSales}
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

      <EditSaleDialog
        open={editSaleDialogOpen}
        onOpenChange={setEditSaleDialogOpen}
        order={selectedOrder}
      />

      <SaleDetailsDialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setSelectedOrder(null)
        }}
        onConfirm={async () => {
          if (selectedOrder) {
            await deleteSale.mutateAsync(selectedOrder.id)
            setDeleteDialogOpen(false)
            setSelectedOrder(null)
          }
        }}
        title="Delete Sale Permanently"
        description="Are you sure you want to completely erase this receipt? All quantities will be safely restored to the inventory. This action cannot be undone."
        confirmLabel="Yes, delete it"
        variant="danger"
        loading={deleteSale.isPending}
      />
    </PageContainer>
  )
}
