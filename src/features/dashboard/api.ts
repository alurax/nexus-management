import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { DashboardMetrics } from './types'

export const DASHBOARD_METRICS_QUERY_KEY = ['dashboard_metrics']

export function useDashboardMetrics() {
  return useQuery({
    queryKey: DASHBOARD_METRICS_QUERY_KEY,
    queryFn: async () => {
      // Get the user's local timezone (e.g. 'Asia/Manila', 'America/New_York')
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      const { data, error } = await supabase.rpc('get_dashboard_metrics', {
        p_timezone: userTimezone
      })
      if (error) throw error
      
      // Parse the JSON response
      return {
        salesToday: Number(data.salesToday) || 0,
        monthlyRevenue: Number(data.monthlyRevenue) || 0,
        inventoryValue: Number(data.inventoryValue) || 0,
        activeRentals: Number(data.activeRentals) || 0,
      } as DashboardMetrics
    },
  })
}
