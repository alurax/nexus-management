import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { DashboardMetrics } from './types'

export const DASHBOARD_METRICS_QUERY_KEY = ['dashboard_metrics']
export const REVENUE_TREND_QUERY_KEY = ['revenue_trend']

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

export function useRevenueTrend() {
  return useQuery({
    queryKey: REVENUE_TREND_QUERY_KEY,
    queryFn: async () => {
      // Get the date 7 days ago
      const date = new Date()
      date.setDate(date.getDate() - 7)
      
      const { data, error } = await supabase
        .from('sales_orders')
        .select('created_at, total_amount')
        .eq('status', 'completed')
        .gte('created_at', date.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by date
      const dailyTotals = data.reduce((acc, order) => {
        // Just extract YYYY-MM-DD
        const day = order.created_at.split('T')[0]
        acc[day] = (acc[day] || 0) + Number(order.total_amount)
        return acc
      }, {} as Record<string, number>)

      // Format for recharts
      return Object.entries(dailyTotals).map(([date, amount]) => ({
        date,
        amount
      }))
    }
  })
}
