import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/currency'
import { format } from 'date-fns'
import type { SalesOrder } from './types'

interface SaleDetailsDialogProps {
  open: boolean
  onClose: () => void
  order: SalesOrder | null
}

export function SaleDetailsDialog({ open, onClose, order }: SaleDetailsDialogProps) {
  if (!order) return null

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="flex flex-col max-h-[80vh]">
        <div className="px-6 py-4 border-b border-(--border-primary) flex justify-between items-center bg-(--surface-primary)">
          <div>
            <h2 className="text-lg font-semibold text-(--text-primary)">
              Order Details
            </h2>
            <p className="text-sm text-(--text-tertiary)">
              {format(new Date(order.created_at), 'PPP p')}
            </p>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
              ${order.status === 'completed' ? 'bg-success-100 text-success-700' :
                order.status === 'refunded' ? 'bg-info-100 text-info-700' :
                order.status === 'cancelled' ? 'bg-danger-100 text-danger-700' :
                'bg-warning-100 text-warning-700'}`}
            >
              {order.status}
            </span>
          </div>
        </div>
        
        <div className="p-6 bg-(--surface-secondary) flex-1 overflow-y-auto space-y-6">
          {/* Customer Info */}
          {order.customers && (
            <div>
              <h3 className="text-sm font-medium text-(--text-secondary) mb-2">Customer</h3>
              <p className="text-sm text-(--text-primary)">
                {order.customers.first_name} {order.customers.last_name}
              </p>
            </div>
          )}

          {/* Items Table */}
          <div>
            <h3 className="text-sm font-medium text-(--text-secondary) mb-2">Purchased Items</h3>
            <div className="bg-(--surface-primary) rounded-lg border border-(--border-primary) overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-(--surface-secondary) text-(--text-secondary) text-xs border-b border-(--border-primary)">
                  <tr>
                    <th className="px-4 py-2 font-medium">Item</th>
                    <th className="px-4 py-2 font-medium text-right">Qty</th>
                    <th className="px-4 py-2 font-medium text-right">Price</th>
                    <th className="px-4 py-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-primary)">
                  {order.sales_order_items?.map((item) => (
                    <tr key={item.id} className="text-(--text-primary)">
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.products?.name || 'Unknown Item'}</p>
                        {item.products?.sku && <p className="text-xs text-(--text-tertiary)">{item.products.sku}</p>}
                      </td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-(--text-secondary)">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))}
                  {(!order.sales_order_items || order.sales_order_items.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-(--text-tertiary)">
                        No items found for this order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end">
            <div className="w-1/2 space-y-2 text-sm">
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-(--text-secondary)">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              {order.tax_amount > 0 && (
                <div className="flex justify-between text-(--text-secondary)">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax_amount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-(--text-primary) pt-2 border-t border-(--border-primary)">
                <span>Total Paid</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
              {order.payment_method && (
                <div className="flex justify-between text-xs text-(--text-tertiary) pt-1">
                  <span>Method</span>
                  <span className="capitalize">{order.payment_method}</span>
                </div>
              )}
            </div>
          </div>

          {/* Remarks */}
          {order.notes && (
            <div>
              <h3 className="text-sm font-medium text-(--text-secondary) mb-2">Remarks</h3>
              <div className="p-3 rounded-lg bg-(--surface-primary) border border-(--border-primary) text-sm text-(--text-primary) whitespace-pre-wrap">
                {order.notes}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-(--border-primary) bg-(--surface-primary) flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  )
}
