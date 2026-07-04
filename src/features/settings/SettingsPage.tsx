import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Settings, User, Mail, Shield } from 'lucide-react'
import { useAuth } from '@/features/auth'

export function SettingsPage() {
  const { user, profile } = useAuth()

  return (
    <PageContainer
      title="Profile & Settings"
      description="Manage your account configuration"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-(--text-primary)">
              <User className="h-4 w-4 text-brand-500" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-(--text-tertiary)" />
              <div>
                <p className="text-xs text-(--text-tertiary)">Email Address</p>
                <p className="text-sm text-(--text-primary) font-medium">{user?.email || 'Unknown'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-(--text-tertiary)" />
              <div>
                <p className="text-xs text-(--text-tertiary)">Full Name</p>
                <p className="text-sm text-(--text-primary) font-medium">
                  {profile?.first_name || profile?.last_name 
                    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
                    : 'Not set'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-(--text-tertiary)" />
              <div>
                <p className="text-xs text-(--text-tertiary)">Role</p>
                <p className="text-sm text-(--text-primary) font-medium capitalize">{profile?.role || 'Staff'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-(--text-primary)">
              <Settings className="h-4 w-4 text-brand-500" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-(--surface-tertiary) text-(--text-tertiary) mb-3">
                <Settings className="h-5 w-5" />
              </div>
              <p className="text-xs text-(--text-tertiary) text-center">
                System configuration (taxes, receipts, branding) is managed by the owner in the Supabase Dashboard for now.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
