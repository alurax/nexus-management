import { useState, useMemo } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { DataTable } from '@/components/data-table/DataTable'
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import { StockAdjustmentDialog } from './StockAdjustmentDialog'
import { useInventory } from './api'
import { useLocations } from '@/features/locations/api'
import type { ProductWithInventory } from './types'

const columnHelper = createColumnHelper<ProductWithInventory>()

export function InventoryPage() {
  const { data: inventory, isLoading } = useInventory()
  const { data: locations } = useLocations()
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [adjustingProduct, setAdjustingProduct] = useState<ProductWithInventory | null>(null)

  const handleAdjust = (product: ProductWithInventory) => {
    setAdjustingProduct(product)
    setDialogOpen(true)
  }

  // Filter inventory by location if one is selected
  const displayData = useMemo(() => {
    if (!inventory) return []
    return inventory
  }, [inventory])

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Product',
      cell: (info) => (
        <div className="flex flex-col">
          <span className="font-medium text-(--text-primary)">{info.getValue()}</span>
          <span className="text-xs text-(--text-tertiary)">{info.row.original.sku || '-'}</span>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'total_stock',
      header: 'Total Stock',
      cell: (info) => {
        const levels = info.row.original.inventory_levels || []
        const total = levels.reduce((sum, level) => sum + level.quantity, 0)
        
        return (
          <div className="flex flex-col">
            <span className={`font-medium ${total <= 5 ? 'text-danger-600' : 'text-(--text-primary)'}`}>
              {total} units
            </span>
          </div>
        )
      },
    }),
    columnHelper.display({
      id: 'breakdown',
      header: 'Location Breakdown',
      cell: (info) => {
        const levels = info.row.original.inventory_levels || []
        if (levels.length === 0) return <span className="text-sm text-(--text-tertiary)">No stock data</span>
        
        return (
          <div className="flex flex-col gap-1">
            {levels.filter(l => l.quantity > 0).map((level) => {
              const loc = locations?.find(l => l.id === level.location_id)
              return (
                <div key={level.location_id} className="flex justify-between items-center text-xs w-48">
                  <span className="text-(--text-secondary)">{loc?.name || 'Unknown Location'}</span>
                  <span className="font-medium text-(--text-primary)">{level.quantity}</span>
                </div>
              )
            })}
          </div>
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <div className="flex items-center justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAdjust(info.row.original)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Adjust Stock
          </Button>
        </div>
      ),
    }),
  ], [locations])

  return (
    <PageContainer
      title="Inventory Levels"
      description="Track stock across all locations and make adjustments."
    >
      <div className="bg-(--surface-primary) rounded-xl border border-(--border-primary) p-4">
        <DataTable
          data={displayData}
          columns={columns as any}
          loading={isLoading}
          searchPlaceholder="Search products by name or SKU..."
        />
      </div>

      <StockAdjustmentDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        product={adjustingProduct}
      />
    </PageContainer>
  )
}
