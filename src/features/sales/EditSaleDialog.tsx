import { useState, useEffect } from 'react'
import {
  Modal,
  ModalHeader,
  ModalContent,
} from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Trash2, Plus, Minus } from 'lucide-react'
import { formatCurrency } from '@/utils/currency'
import { useEditSale } from './api'
import type { SalesOrder } from './types'
import { toast } from 'sonner'
import { useInventory } from '@/features/inventory/api'

interface EditSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: SalesOrder | null
}

interface EditCartItem {
  product_id: string
  name: string
  sku: string | null
  quantity: number
  unit_price: number
  stock_available: number
}

export function EditSaleDialog({ open, onOpenChange, order }: EditSaleDialogProps) {
  const editSale = useEditSale()
  const { data: inventory } = useInventory()
  
  const [items, setItems] = useState<EditCartItem[]>([])
  const [discount, setDiscount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<string>('cash')
  const [status, setStatus] = useState<string>('completed')

  useEffect(() => {
    if (order && open && inventory) {
      setDiscount(Number(order.discount_amount) || 0)
      setPaymentMethod(order.payment_method || 'cash')
      setStatus(order.status || 'completed')
      
      const parsedItems = (order.sales_order_items || []).map(item => {
        // Find the product to get current stock. Note: Since we are editing a past sale, 
        // the "stock available" to the user is (current_stock + their_old_quantity) 
        // because returning their old quantity frees it up.
        // But for simplicity, we just look at the global inventory levels.
        return {
          product_id: item.product_id,
          name: item.products?.name || 'Unknown',
          sku: item.products?.sku || null,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
          stock_available: 9999, // Backend handles exact stock validation for edits
        }
      })
      setItems(parsedItems)
    }
  }, [order, open, inventory])

  const updateQuantity = (productId: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.product_id === productId) {
        const newQ = item.quantity + delta
        if (newQ < 1) return item
        return { ...item, quantity: newQ }
      }
      return item
    }))
  }

  const updatePrice = (productId: string, newPrice: number) => {
    if (newPrice < 0) return
    setItems(prev => prev.map(item => 
      item.product_id === productId ? { ...item, unit_price: newPrice } : item
    ))
  }

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.product_id !== productId))
  }

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  const total = subtotal - discount

  const handleSave = async () => {
    if (!order) return
    if (items.length === 0) {
      toast.error('Sale must have at least one item. If you want to void it, process a return instead.')
      return
    }

    if (items.some(i => !i.product_id)) {
      toast.error('System Error: Product ID is missing. Please hard refresh your browser (F5/Cmd+R) to clear the local cache and try again.')
      return
    }

    try {
      await editSale.mutateAsync({
        order_id: order.id,
        discount: discount,
        tax: Number(order.tax_amount) || 0,
        payment_method: paymentMethod,
        status: status,
        items: items.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price
        }))
      })
      onOpenChange(false)
    } catch (error) {
      // handled by mutation
    }
  }

  return (
    <Modal open={open} onClose={() => onOpenChange(false)} size="md">
      <ModalHeader onClose={() => onOpenChange(false)}>
        Edit Sale #{order?.id?.substring(0, 8)}
      </ModalHeader>

      <ModalContent className="space-y-4">
        <div className="bg-warning-50 text-warning-700 p-3 rounded-md text-sm border border-warning-200">
          <strong>Warning:</strong> Modifying quantities will directly update current inventory levels.
        </div>

        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {items.map(item => (
            <div key={item.product_id} className="p-3 bg-(--surface-secondary) rounded-lg border border-(--border-primary)">
              <div className="flex justify-between items-start mb-2 gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-(--text-primary) truncate">{item.name}</div>
                  <div className="text-xs text-(--text-secondary) flex items-center gap-1 mt-0.5">
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updatePrice(item.product_id, Number(e.target.value))}
                      className="h-6 w-20 text-xs px-1"
                      title="Override Unit Price"
                    />
                    <span>each</span>
                  </div>
                </div>
                <div className="font-semibold text-sm text-(--text-primary)">
                  {formatCurrency(item.quantity * item.unit_price)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-(--surface-primary) rounded-md border border-(--border-primary)">
                  <button 
                    onClick={() => updateQuantity(item.product_id, -1)}
                    className="p-1 hover:bg-(--surface-secondary) text-(--text-secondary) rounded-l-md transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-(--text-primary)">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => updateQuantity(item.product_id, 1)}
                    className="p-1 hover:bg-(--surface-secondary) text-(--text-secondary) rounded-r-md transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <button 
                  onClick={() => removeItem(item.product_id)}
                  className="p-1.5 text-danger-500 hover:bg-danger-50 rounded-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 pt-3 border-t border-(--border-primary)">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-(--text-secondary)">Payment Method</span>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-8 px-2 text-xs rounded-lg bg-(--surface-secondary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--brand-primary)"
            >
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="ewallet">E-Wallet</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-(--text-secondary)">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-8 px-2 text-xs rounded-lg bg-(--surface-secondary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--brand-primary)"
            >
              <option value="completed">Paid (Completed)</option>
              <option value="care_of">Care Of (Unpaid)</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-(--text-secondary)">Discount</span>
            <div className="w-24">
              <Input 
                type="number" 
                value={discount || ''} 
                onChange={e => setDiscount(Number(e.target.value) || 0)}
                placeholder="0.00"
                className="h-8 text-right text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-lg font-bold">
            <span className="text-(--text-primary)">New Total</span>
            <span className="text-brand-600 dark:text-brand-400">
              {formatCurrency(Math.max(0, total))}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-(--border-primary)">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={editSale.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={editSale.isPending}
          >
            Save Changes
          </Button>
        </div>
      </ModalContent>
    </Modal>
  )
}
