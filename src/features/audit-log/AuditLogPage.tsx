import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent } from '@/components/ui/Card'
import { ScrollText } from 'lucide-react'

export function AuditLogPage() {
  return (
    <PageContainer
      title="Audit Log"
      description="Track all system changes and user actions"
    >
      <Card>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-(--surface-tertiary) text-(--text-tertiary) mb-4">
              <ScrollText className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-(--text-primary) mb-1">
              No Activity Logged
            </h3>
            <p className="text-xs text-(--text-tertiary) text-center max-w-sm">
              All critical actions will be tracked here once the system is connected to the database.
            </p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
