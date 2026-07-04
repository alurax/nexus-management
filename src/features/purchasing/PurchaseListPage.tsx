import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/Card'
import { Plus, Truck } from 'lucide-react'

export function PurchaseListPage() {
  return (
    <PageContainer
      title="Purchase Orders"
      description="Manage supplier purchase orders and receiving"
      action={
        <Button icon={<Plus className="h-4 w-4" />}>
          New Purchase Order
        </Button>
      }
    >
      <Card>
        <EmptyState
          icon={<Truck className="h-6 w-6" />}
          title="No purchase orders"
          description="Create a purchase order to restock your inventory from suppliers."
          action={
            <Button size="sm" icon={<Plus className="h-4 w-4" />}>
              New Purchase Order
            </Button>
          }
        />
      </Card>
    </PageContainer>
  )
}
