import { useState, useMemo } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Search, Plus, Minus, Trash2 } from 'lucide-react'
import { useProducts } from '@/features/products/api'
import { useCustomers } from '@/features/customers/api'
import { useCreateRental } from './api'
import type { CreateRentalPayload } from './types'
import { toast } from 'sonner'

interface RentalDialogProps {
  open: boolean
  onClose: () => void
}

interface CartItem {
  product_id: string
  name: string
  quantity: number
  unit_price: number
}

export function RentalDialog({ open, onClose }: RentalDialogProps) {
  const { data: products } = useProducts()
  const { data: customers } = useCustomers()
  const createMutation = useCreateRental()

  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [deposit, setDeposit] = useState<number>(0)
  const [dateOverride, setDateOverride] = useState('')
  
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])

  // Only show rental products
  const rentalProducts = useMemo(() => {
    if (!products) return []
    return products.filter(p => p.type === 'rental').filter(p => {
      if (!searchQuery) return true
      return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [products, searchQuery])

  const addToCart = (product: typeof rentalProducts[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id)
      if (existing) {
        return prev.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        quantity: 1,
        unit_price: product.base_price, // selling at base price per day/rental period
      }]
    })
  }

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === productId) {
        const newQ = item.quantity + delta
        if (newQ < 1) return item
        return { ...item, quantity: newQ }
      }
      return item
    }))
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product_id !== productId))
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

  const handleCreate = async () => {
    if (!selectedCustomerId) return toast.error('Please select a customer')
    if (!startDate || !endDate) return toast.error('Please select dates')
    if (cart.length === 0) return toast.error('Cart is empty')
    if (new Date(startDate) > new Date(endDate)) return toast.error('End date must be after start date')

    const payload: CreateRentalPayload = {
      customer_id: selectedCustomerId,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      deposit_amount: deposit,
      items: cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      created_at: dateOverride ? new Date(dateOverride).toISOString() : undefined
    }

    try {
      await createMutation.mutateAsync(payload)
      
      // reset form
      setSelectedCustomerId('')
      setStartDate('')
      setEndDate('')
      setDeposit(0)
      setCart([])
      setDateOverride('')
      onClose()
    } catch (error) {
      // handled by mutation toast
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="xl">
      <div className="flex flex-col max-h-[90dvh]">
        <div className="px-6 py-4 border-b border-(--border-primary) flex justify-between items-center bg-(--surface-primary)">
          <div>
            <h2 className="text-lg font-semibold text-(--text-primary)">
              New Reservation
            </h2>
            <p className="text-sm text-(--text-tertiary)">
              Book rental equipment for a customer.
            </p>
          </div>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left Side: Booking Details & Cart */}
          <div className="w-1/2 flex flex-col border-r border-(--border-primary) p-4 overflow-y-auto">
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-(--text-tertiary) uppercase tracking-wider mb-1.5">
                  Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--brand-primary)"
                >
                  <option value="">Select a customer...</option>
                  {customers?.map(c => (
                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-(--text-tertiary) uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <Input 
                    type="datetime-local" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-(--text-tertiary) uppercase tracking-wider mb-1.5">
                    End Date
                  </label>
                  <Input 
                    type="datetime-local" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 border-t border-(--border-primary) pt-4">
                <label className="block text-xs font-medium text-(--text-secondary) mb-1.5">
                  Advanced: Creation Date Override
                </label>
                <Input 
                  type="datetime-local" 
                  value={dateOverride}
                  onChange={(e) => setDateOverride(e.target.value)}
                  className="h-10 text-sm"
                />
                <p className="text-[10px] text-(--text-tertiary) mt-1">Leave blank for "Right Now"</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col border border-(--border-primary) rounded-xl overflow-hidden">
              <div className="p-3 border-b border-(--border-primary) bg-(--surface-secondary) text-sm font-semibold">
                Reserved Items
              </div>
              <div className="flex-1 overflow-y-auto p-2 bg-(--surface-primary)">
                {cart.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-(--text-tertiary)">
                    Select items from the right
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {cart.map(item => (
                      <li key={item.product_id} className="p-3 bg-(--surface-secondary) rounded-lg border border-(--border-primary)">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-sm text-(--text-primary)">{item.name}</div>
                          <div className="font-semibold text-sm text-(--text-primary)">
                            ${(item.quantity * item.unit_price).toFixed(2)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 bg-(--surface-primary) rounded-md border border-(--border-primary)">
                            <button 
                              onClick={() => updateCartQuantity(item.product_id, -1)}
                              className="p-1 hover:bg-(--surface-secondary) text-(--text-secondary) rounded-l-md"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartQuantity(item.product_id, 1)}
                              className="p-1 hover:bg-(--surface-secondary) text-(--text-secondary) rounded-r-md"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.product_id)}
                            className="p-1.5 text-danger-500 hover:bg-danger-50 rounded-md"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="p-3 border-t border-(--border-primary) bg-(--surface-secondary) space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-(--text-secondary)">Deposit Required</span>
                  <div className="w-24">
                    <Input 
                      type="number" 
                      value={deposit || ''} 
                      onChange={(e) => setDeposit(Number(e.target.value) || 0)}
                      placeholder="0.00"
                      className="h-8 text-right"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-end pt-2 border-t border-(--border-primary)">
                  <span className="font-semibold text-(--text-primary)">Total Amount</span>
                  <span className="text-xl font-bold text-(--brand-primary)">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Side: Rental Product Browser */}
          <div className="w-1/2 p-4 flex flex-col bg-(--surface-secondary)">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-tertiary)" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rental gear..."
                className="w-full h-10 pl-9 pr-3 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--brand-primary)"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3">
                {rentalProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="flex flex-col text-left p-3 rounded-xl border border-(--border-primary) bg-(--surface-primary) hover:border-(--brand-primary) transition-all group"
                  >
                    <div className="font-medium text-(--text-primary) text-sm mb-1 line-clamp-2 group-hover:text-(--brand-primary)">
                      {product.name}
                    </div>
                    <div className="mt-auto flex justify-between w-full">
                      <span className="font-semibold text-sm text-(--text-primary)">
                        ${Number(product.base_price).toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
        
        <div className="p-4 border-t border-(--border-primary) bg-(--surface-primary) flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} loading={createMutation.isPending}>
            Confirm Reservation
          </Button>
        </div>
      </div>
    </Modal>
  )
}
