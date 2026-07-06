import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TentTree,
} from 'lucide-react'
import { formatCurrency } from '@/utils/currency'
import { useDashboardMetrics, useRevenueTrend } from './api'
import { useInventory } from '@/features/inventory/api'
import { Link } from 'react-router'
import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts'
import { format, parseISO } from 'date-fns'

export function DashboardPage() {
  const { data: metrics, isLoading: loadingMetrics } = useDashboardMetrics()
  const { data: revenueTrend, isLoading: loadingTrend } = useRevenueTrend()
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
            <CardHeader>
              <h3 className="font-semibold text-(--text-primary)">Revenue Trend (Last 7 Days)</h3>
            </CardHeader>
            <CardContent className="p-6 h-[calc(100%-4rem)]">
              {loadingTrend ? (
                <div className="h-full flex items-center justify-center">
                  <Spinner size="md" />
                </div>
              ) : revenueTrend && revenueTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => format(parseISO(val), 'MMM d')}
                      stroke="var(--text-tertiary)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      tickFormatter={(val) => `₱${val.toLocaleString()}`}
                      stroke="var(--text-tertiary)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                    />
                    <RechartsTooltip 
                      formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
                      labelFormatter={(label) => format(parseISO(label as string), 'MMM d, yyyy')}
                      contentStyle={{ 
                        backgroundColor: 'var(--surface-elevated)', 
                        border: '1px solid var(--border-primary)',
                        borderRadius: '0.5rem',
                        color: 'var(--text-primary)'
                      }}
                      itemStyle={{ color: 'var(--text-secondary)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="var(--brand-primary)" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-(--text-tertiary)">
                  <div className="text-center space-y-2">
                    <div className="text-lg font-medium">No Data Available</div>
                    <div className="text-sm">There are no completed sales in the last 7 days.</div>
                  </div>
                </div>
              )}
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
