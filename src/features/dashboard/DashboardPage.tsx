import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TentTree,
} from 'lucide-react'
import { formatCurrency } from '@/utils/currency'
import { useDashboardMetrics } from './api'
import { useInventory } from '@/features/inventory/api'
import { Link } from 'react-router'
import { useMemo } from 'react'

export function DashboardPage() {
  const { data: metrics, isLoading: loadingMetrics } = useDashboardMetrics()
  const { data: inventory } = useInventory()

  const lowStockItems = useMemo(() => {
    if (!inventory) return []
    // Items are low stock if total quantity across all locations is < 5
    return inventory.filter(item => {
      if (item.type === 'service') return false
      const totalStock = item.inventory_levels?.reduce((sum, level) => sum + level.quantity, 0) || 0
      return totalStock < 5
    })
  }, [inventory])

  if (loadingMetrics) {
    return (
      <PageContainer title="Dashboard" description="Overview of your business performance">
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      </PageContainer>
    )
  }

  const kpis = [
    {
      label: 'Sales Today',
      value: formatCurrency(metrics?.salesToday || 0),
      icon: <ShoppingCart className="h-5 w-5" />,
      color: 'text-brand-600 bg-brand-50 dark:bg-brand-500/15',
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(metrics?.monthlyRevenue || 0),
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-success-600 bg-success-50 dark:bg-success-500/15',
    },
    {
      label: 'Inventory Value',
      value: formatCurrency(metrics?.inventoryValue || 0),
      icon: <Package className="h-5 w-5" />,
      color: 'text-accent-600 bg-accent-50 dark:bg-accent-500/15',
    },
    {
      label: 'Active Rentals',
      value: String(metrics?.activeRentals || 0),
      icon: <TentTree className="h-5 w-5" />,
      color: 'text-warning-600 bg-warning-50 dark:bg-warning-500/15',
    },
  ]

  return (
    <PageContainer
      title="Dashboard"
      description="Overview of your business performance"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <Card key={i} className="group hover:border-(--brand-primary) transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${kpi.color}`}>
                  {kpi.icon}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-(--text-tertiary)">{kpi.label}</h3>
                <div className="text-2xl font-bold text-(--text-primary)">{kpi.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-[400px]">
            <CardContent className="p-6 h-full flex flex-col items-center justify-center text-(--text-tertiary)">
              <div className="text-center space-y-2">
                <div className="text-lg font-medium">Revenue Trend</div>
                <div className="text-sm">Historical analytics coming soon.</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel (Alerts) */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b border-(--border-primary)">
                <h3 className="font-semibold text-(--text-primary)">Action Required</h3>
              </div>
              <div className="divide-y divide-(--border-primary)">
                
                {lowStockItems.length > 0 && (
                  <Link 
                    to="/inventory"
                    className="flex items-start gap-3 p-4 hover:bg-(--surface-secondary) transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-warning-50 text-warning-600 shrink-0">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-(--text-primary)">Low Stock Alert</div>
                      <div className="text-xs text-(--text-secondary) mt-0.5">
                        {lowStockItems.length} products are running low on stock.
                      </div>
                    </div>
                  </Link>
                )}

                {lowStockItems.length === 0 && (
                  <div className="p-8 text-center text-sm text-(--text-tertiary)">
                    No pending alerts. You're all caught up!
                  </div>
                )}

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
