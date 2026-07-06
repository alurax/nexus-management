import { useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Settings, User, Shield, Save } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useStoreSettings, useUpdateProfile, useUpdateStoreSettings } from './api'
import { useLocations } from '@/features/locations/api'

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
})

type ProfileFormData = z.infer<typeof profileSchema>

const settingsSchema = z.object({
  store_name: z.string().min(1, 'Store name is required'),
  default_location_id: z.string().nullable(),
  tax_rate: z.number().min(0).max(100),
  currency: z.string().min(1),
  contact_email: z.string().email().nullable().or(z.literal('')),
  phone: z.string().nullable().or(z.literal('')),
  address: z.string().nullable().or(z.literal('')),
})

export function SettingsPage() {
  const { user, profile } = useAuth()
  const { data: storeSettings } = useStoreSettings()
  const { data: locations } = useLocations()
  
  const updateProfile = useUpdateProfile()
  const updateStoreSettings = useUpdateStoreSettings()

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
    },
  })

  const settingsForm = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      store_name: '',
      default_location_id: null,
      tax_rate: 0,
      currency: 'PHP',
      contact_email: '',
      phone: '',
      address: '',
    },
  })

  // Update form when data loads
  useEffect(() => {
    if (storeSettings) {
      settingsForm.reset({
        store_name: storeSettings.store_name,
        default_location_id: storeSettings.default_location_id,
        tax_rate: Number(storeSettings.tax_rate),
        currency: storeSettings.currency,
        contact_email: storeSettings.contact_email || '',
        phone: storeSettings.phone || '',
        address: storeSettings.address || '',
      })
    }
  }, [storeSettings, settingsForm])

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!profile?.id) return
    await updateProfile.mutateAsync({
      id: profile.id,
      ...data,
    })
  }

  const onSettingsSubmit = async (data: z.infer<typeof settingsSchema>) => {
    await updateStoreSettings.mutateAsync(data)
  }

  const isOwner = profile?.role === 'owner'

  return (
    <PageContainer
      title="Profile & Settings"
      description="Manage your account configuration"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-(--text-primary)">
              <User className="h-4 w-4 text-brand-500" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 bg-(--surface-secondary) p-3 rounded-lg border border-(--border-primary)">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-lg dark:bg-brand-500/20 dark:text-brand-300">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-(--text-tertiary) uppercase tracking-wider">Role & Access</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-(--text-primary) font-semibold capitalize">{profile?.role || 'Staff'}</p>
                  <span className="text-xs text-(--text-secondary) bg-(--surface-tertiary) px-2 py-0.5 rounded-full">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="First Name"
                  error={profileForm.formState.errors.first_name?.message}
                >
                  <Input {...profileForm.register('first_name')} />
                </FormField>
                <FormField
                  label="Last Name"
                  error={profileForm.formState.errors.last_name?.message}
                >
                  <Input {...profileForm.register('last_name')} />
                </FormField>
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  loading={updateProfile.isPending}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* System Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-(--text-primary)">
              <Settings className="h-4 w-4 text-brand-500" />
              Store Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isOwner ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-(--surface-secondary) rounded-xl border border-(--border-primary) border-dashed">
                <Shield className="h-8 w-8 text-(--text-tertiary) mb-3" />
                <p className="text-sm font-medium text-(--text-primary)">Restricted Access</p>
                <p className="text-xs text-(--text-secondary) mt-1 max-w-xs">
                  Only the store owner can modify system-wide settings like taxes and receipts.
                </p>
              </div>
            ) : (
              <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Store Name"
                    error={settingsForm.formState.errors.store_name?.message}
                  >
                    <Input {...settingsForm.register('store_name')} />
                  </FormField>
                  <div>
                    <label className="block text-xs font-medium text-(--text-tertiary) uppercase tracking-wider mb-1.5">
                      Default Location (POS)
                    </label>
                    <select
                      {...settingsForm.register('default_location_id')}
                      className="w-full h-10 px-3 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-brand-500"
                    >
                      <option value="">No Default</option>
                      {locations?.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Tax Rate (%)"
                    error={settingsForm.formState.errors.tax_rate?.message}
                  >
                    <Input 
                      type="number"
                      step="0.01"
                      {...settingsForm.register('tax_rate', { valueAsNumber: true })}
                    />
                  </FormField>
                  <FormField
                    label="Currency Code"
                    error={settingsForm.formState.errors.currency?.message}
                  >
                    <Input {...settingsForm.register('currency')} />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Contact Email"
                    error={settingsForm.formState.errors.contact_email?.message}
                  >
                    <Input 
                      type="email"
                      {...settingsForm.register('contact_email')}
                    />
                  </FormField>
                  <FormField
                    label="Phone Number"
                    error={settingsForm.formState.errors.phone?.message}
                  >
                    <Input {...settingsForm.register('phone')} />
                  </FormField>
                </div>

                <FormField
                  label="Address"
                  error={settingsForm.formState.errors.address?.message}
                >
                  <Input {...settingsForm.register('address')} />
                </FormField>

                <div className="flex justify-end pt-2">
                  <Button 
                    type="submit" 
                    loading={updateStoreSettings.isPending}
                    className="w-full sm:w-auto"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
