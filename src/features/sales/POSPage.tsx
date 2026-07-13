import { useState, useMemo, useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Search, ShoppingCart, Plus, Minus, Trash2, Banknote, Wallet, Smartphone } from 'lucide-react'
import { useInventory } from '@/features/inventory/api'
import { useLocations } from '@/features/locations/api'
import { useCustomers } from '@/features/customers/api'
import { useStoreSettings } from '@/features/settings/api'
import { useProcessSale } from './api'
import type { CartItem, PaymentMethod, SalesOrderStatus } from './types'
import { toast } from 'sonner'
import { formatCurrency } from '@/utils/currency'

export function POSPage() {
  const { data: inventory, isLoading: loadingInventory } = useInventory()
  const { data: locations } = useLocations()
  const { data: customers } = useCustomers()
  const { data: storeSettings } = useStoreSettings()
  const processSale = useProcessSale()

  // State
  const [selectedLocationId, setSelectedLocationId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [discount, setDiscount] = useState<number>(0)
  const [dateOverride, setDateOverride] = useState<string>('')
  const [cashGiven, setCashGiven] = useState<number | ''>('')
  
  // Track if we've loaded from localStorage
  const [hasLoadedPersistedState, setHasLoadedPersistedState] = useState(false)

  // 1. Load from localStorage & Default Settings
  useEffect(() => {
    if (hasLoadedPersistedState) return

    try {
      const savedState = localStorage.getItem('nexus_pos_state')
      if (savedState) {
        const parsed = JSON.parse(savedState)
        if (parsed.cart) setCart(parsed.cart)
        if (parsed.location_id) setSelectedLocationId(parsed.location_id)
        if (parsed.customer_id) setSelectedCustomerId(parsed.customer_id)
        if (parsed.discount) setDiscount(parsed.discount)
      } else if (storeSettings?.default_location_id) {
        setSelectedLocationId(storeSettings.default_location_id)
      }
    } catch (e) {
      console.error("Failed to load POS state", e)
    }
    setHasLoadedPersistedState(true)
  }, [hasLoadedPersistedState, storeSettings])

  // 2. Persist to localStorage
  useEffect(() => {
    if (!hasLoadedPersistedState) return
    
    localStorage.setItem('nexus_pos_state', JSON.stringify({
      cart,
      location_id: selectedLocationId,
      customer_id: selectedCustomerId,
      discount
    }))
  }, [cart, selectedLocationId, selectedCustomerId, discount, hasLoadedPersistedState])

  // Filter products
  const displayProducts = useMemo(() => {
    if (!inventory || !selectedLocationId) return []
    
    return inventory.filter(p => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = p.name.toLowerCase().includes(query)
        const matchesSku = p.sku ? p.sku.toLowerCase().includes(query) : false
        return matchesName || matchesSku
      }
      return true
    }).map(p => {
      const stockAtLocation = p.inventory_levels?.find(l => l.location_id === selectedLocationId)?.quantity || 0
      return {
        ...p,
        stockAtLocation: p.type === 'service' ? 9999 : stockAtLocation
      }
    })
  }, [inventory, selectedLocationId, searchQuery])

  const addToCart = (product: typeof displayProducts[0]) => {
    if (product.stockAtLocation <= 0 && product.type !== 'service') {
      toast.error('Product is out of stock at this location')
      return
    }
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id)
      if (existing) {
        if (existing.quantity >= product.stockAtLocation) {
          toast.error('Cannot add more than available stock')
          return prev
        }
        return prev.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        description: product.description,
        quantity: 1,
        unit_price: product.base_price,
        stock_available: product.stockAtLocation
      }]
    })
  }

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === productId) {
        const newQ = item.quantity + delta
        if (newQ > item.stock_available) {
          toast.error('Cannot exceed available stock')
          return item
        }
        if (newQ < 1) return item
        return { ...item, quantity: newQ }
      }
      return item
    }))
  }
  
  const updateCartPrice = (productId: string, newPrice: number) => {
    if (newPrice < 0) return
    setCart(prev => prev.map(item => 
      item.product_id === productId ? { ...item, unit_price: newPrice } : item
    ))
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product_id !== productId))
  }

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  const cartTotal = cartSubtotal - discount
  
  const changeDue = (paymentMethod === 'cash' && typeof cashGiven === 'number' && cashGiven >= cartTotal) 
    ? cashGiven - cartTotal 
    : null

  const handleCheckout = async (status: SalesOrderStatus = 'completed') => {
    if (cart.length === 0) return toast.error('Cart is empty')
    if (!selectedLocationId) return toast.error('Please select a location')
    if (paymentMethod === 'cash' && typeof cashGiven === 'number' && cashGiven < cartTotal && status === 'completed') {
      return toast.error('Cash given is less than the total amount')
    }
    
    try {
      await processSale.mutateAsync({
        location_id: selectedLocationId,
        customer_id: selectedCustomerId || undefined,
        discount: discount,
        tax: 0,
        payment_method: paymentMethod,
        status: status,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        })),
        created_at: dateOverride ? new Date(dateOverride).toISOString() : undefined
      })
      
      toast.success(status === 'care_of' ? 'Sale logged as Care Of' : 'Sale completed successfully')
      
      // Reset POS state
      setCart([])
      setDiscount(0)
      setSelectedCustomerId('')
      setDateOverride('')
      setCashGiven('')
      // Clear persistence
      localStorage.removeItem('nexus_pos_state')
    } catch (error) {
      // Handled by mutation
    }
  }

  return (
    <PageContainer
      title="Point of Sale"
      description="Create sales orders and process customer payments."
    >
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:h-[calc(100dvh-12rem)] min-h-[600px]">
        
        {/* Left Side: Product Browser */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-(--surface-primary) rounded-xl border border-(--border-primary) p-4 flex flex-col sm:flex-row gap-4 shadow-sm">
            <div className="flex-1">
              <label className="block text-xs font-medium text-(--text-tertiary) uppercase tracking-wider mb-1.5">
                Location
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => {
                  setSelectedLocationId(e.target.value)
                  setCart([]) // Clear cart when location changes
                }}
                className="w-full h-10 px-3 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--border-focus) focus:ring-1 focus:ring-(--border-focus) transition-shadow"
              >
                <option value="">Select a location to sell from...</option>
                {locations?.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-[2]">
              <label className="block text-xs font-medium text-(--text-tertiary) uppercase tracking-wider mb-1.5">
                Search Products
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-tertiary)" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or SKU..."
                  disabled={!selectedLocationId}
                  className="w-full h-10 pl-9 pr-3 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--border-focus) focus:ring-1 focus:ring-(--border-focus) transition-shadow disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="bg-(--surface-primary) rounded-xl border border-(--border-primary) flex-1 p-4 overflow-y-auto shadow-sm">
            {!selectedLocationId ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-(--text-tertiary)">
                <ShoppingCart className="h-12 w-12 mb-3 opacity-20" />
                <p>Select a location above to view available products.</p>
              </div>
            ) : loadingInventory ? (
              <div className="h-full flex items-center justify-center">
                <span className="text-(--text-secondary)">Loading catalog...</span>
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-(--text-tertiary)">
                No products in stock match your search.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayProducts.map(product => {
                  const outOfStock = product.stockAtLocation <= 0 && product.type !== 'service'
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={outOfStock}
                      className={`flex flex-col text-left p-3 rounded-xl border border-(--border-primary) hover:border-(--brand-primary) hover:bg-(--surface-secondary) transition-all group ${
                        outOfStock ? 'opacity-50 cursor-not-allowed hover:border-(--border-primary) hover:bg-transparent active:scale-100' : 'active:scale-[0.98]'
                      }`}
                    >
                      <div className="font-medium text-(--text-primary) text-sm line-clamp-2 mb-1 group-hover:text-(--brand-primary)">
                        {product.name}
                      </div>
                      <div className="text-xs text-(--text-tertiary) mb-2">
                        {product.sku || 'No SKU'}
                      </div>
                      <div className="mt-auto flex items-center justify-between w-full">
                        <span className="font-semibold text-(--text-primary)">
                          {formatCurrency(Number(product.base_price))}
                        </span>
                        {product.type === 'service' ? (
                          <span className="text-xs font-medium text-info-600 bg-info-50 px-1.5 py-0.5 rounded">
                            Service
                          </span>
                        ) : outOfStock ? (
                          <span className="text-xs font-medium text-danger-600 bg-danger-50 px-1.5 py-0.5 rounded">
                            Out of stock
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-success-600 bg-success-50 px-1.5 py-0.5 rounded">
                            {product.stockAtLocation} in stock
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Shopping Cart */}
        <div className="bg-(--surface-primary) rounded-xl border border-(--border-primary) flex flex-col shadow-sm">
          <div className="p-4 border-b border-(--border-primary) flex justify-between items-center bg-(--surface-secondary) rounded-t-xl">
            <h3 className="font-semibold text-(--text-primary) flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Current Order
            </h3>
            <span className="text-xs font-medium bg-(--brand-primary) text-white px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-(--text-tertiary) text-sm p-4 text-center">
                Cart is empty. Click products on the left to add them.
              </div>
            ) : (
              <ul className="space-y-1">
                {cart.map(item => (
                  <li key={item.product_id} className="p-3 bg-(--surface-secondary) rounded-lg border border-(--border-primary)">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-(--text-primary) truncate">{item.name}</div>
                        <div className="text-xs text-(--text-secondary) flex items-center gap-1 mt-0.5">
                          <Input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateCartPrice(item.product_id, Number(e.target.value))}
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
                          onClick={() => updateCartQuantity(item.product_id, -1)}
                          className="p-1 hover:bg-(--surface-secondary) text-(--text-secondary) rounded-l-md transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-(--text-primary)">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateCartQuantity(item.product_id, 1)}
                          className="p-1 hover:bg-(--surface-secondary) text-(--text-secondary) rounded-r-md transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product_id)}
                        className="p-1.5 text-danger-500 hover:bg-danger-50 rounded-md transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-(--border-primary) p-4 space-y-4 overflow-y-auto max-h-[350px]">
            
            <div className="space-y-2">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-lg bg-(--surface-secondary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--brand-primary)"
              >
                <option value="">Walk-in Customer (No profile)</option>
                {customers?.map(c => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border text-xs font-medium transition-all ${
                    paymentMethod === 'cash' 
                      ? 'bg-(--brand-primary) text-white border-(--brand-primary)' 
                      : 'bg-(--surface-primary) text-(--text-secondary) border-(--border-primary) hover:bg-(--surface-secondary)'
                  }`}
                >
                  <Banknote className="h-3.5 w-3.5" /> Cash
                </button>
                <button
                  onClick={() => setPaymentMethod('gcash')}
                  className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border text-xs font-medium transition-all ${
                    paymentMethod === 'gcash' 
                      ? 'bg-(--brand-primary) text-white border-(--brand-primary)' 
                      : 'bg-(--surface-primary) text-(--text-secondary) border-(--border-primary) hover:bg-(--surface-secondary)'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" /> GCash
                </button>
                <button
                  onClick={() => setPaymentMethod('ewallet')}
                  className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border text-xs font-medium transition-all ${
                    paymentMethod === 'ewallet' 
                      ? 'bg-(--brand-primary) text-white border-(--brand-primary)' 
                      : 'bg-(--surface-primary) text-(--text-secondary) border-(--border-primary) hover:bg-(--surface-secondary)'
                  }`}
                >
                  <Wallet className="h-3.5 w-3.5" /> E-Wallet
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm bg-(--surface-secondary) p-3 rounded-lg border border-(--border-primary)">
              <div className="flex justify-between text-(--text-secondary)">
                <span>Subtotal</span>
                <span>{formatCurrency(cartSubtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-(--text-secondary)">
                <span className="text-(--text-secondary)">Discount Amount</span>
                <div className="w-24">
                  <Input 
                    type="number" 
                    value={discount || ''} 
                    onChange={e => setDiscount(Number(e.target.value) || 0)}
                    placeholder="0.00"
                    className="h-7 text-right text-xs"
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-(--border-primary) flex justify-between items-end">
                <span className="font-semibold text-(--text-primary)">Total</span>
                <span className="text-2xl font-bold text-(--brand-primary)">
                  {formatCurrency(Math.max(0, cartTotal))}
                </span>
              </div>
            </div>

            {/* Cash Calculator */}
            {paymentMethod === 'cash' && cartTotal > 0 && (
              <div className="space-y-2 text-sm bg-(--surface-primary) p-3 rounded-lg border border-(--border-primary)">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-(--text-primary)">Cash Given</span>
                  <div className="w-32">
                    <Input 
                      type="number" 
                      value={cashGiven} 
                      onChange={e => setCashGiven(e.target.value ? Number(e.target.value) : '')}
                      placeholder="0.00"
                      className="h-8 text-right font-medium"
                    />
                  </div>
                </div>
                {changeDue !== null && (
                  <div className="flex justify-between items-center text-success-600 font-medium">
                    <span>Change Due</span>
                    <span className="text-lg">{formatCurrency(changeDue)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-(--border-primary)">
              <div className="flex flex-col gap-1 mb-2">
                <label className="text-xs font-medium text-(--text-secondary)">Advanced: Date Override</label>
                <Input 
                  type="datetime-local" 
                  value={dateOverride}
                  onChange={e => setDateOverride(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="flex-1 h-12 text-sm font-semibold border-warning-500 text-warning-600 hover:bg-warning-50"
                onClick={() => handleCheckout('care_of')}
                disabled={cart.length === 0 || !selectedLocationId}
                loading={processSale.isPending}
                title="Log as unpaid/care of"
              >
                Care Of
              </Button>
              <Button 
                className="flex-[2] h-12 text-lg font-semibold" 
                onClick={() => handleCheckout('completed')}
                disabled={cart.length === 0 || !selectedLocationId}
                loading={processSale.isPending}
              >
                Checkout
              </Button>
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  )
}
