import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent } from '@/components/ui/Card'
import { BarChart3 } from 'lucide-react'

export function ReportsPage() {
  return (
    <PageContainer
      title="Reports"
      description="Business intelligence and analytics"
    >
      <Card>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-(--surface-tertiary) text-(--text-tertiary) mb-4">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-(--text-primary) mb-1">
              Reports Coming Soon
            </h3>
            <p className="text-xs text-(--text-tertiary) text-center max-w-sm">
              Sales, inventory, product, rental, and financial reports will be available once transaction data is recorded.
            </p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
