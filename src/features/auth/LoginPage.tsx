import { useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, MapPin } from 'lucide-react'

export function LoginPage() {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already logged in
  if (!isLoading && user) {
    const from = location.state?.from?.pathname || '/'
    return <Navigate to={from} replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }
      // Success will trigger the onAuthStateChange in AuthProvider and redirect
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--surface-secondary) p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 mb-4">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-(--text-primary)">Nexus</h1>
          <p className="text-(--text-tertiary)">El Nido Outdoor Business Management</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-danger-50 border border-danger-200 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-danger-600 shrink-0 mt-0.5" />
                <p className="text-sm text-danger-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <FormField label="Email address" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nexuselnido.com"
                  required
                  autoComplete="email"
                />
              </FormField>

              <FormField label="Password" required>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </FormField>

              <Button 
                type="submit" 
                className="w-full mt-2" 
                loading={isSubmitting}
              >
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
