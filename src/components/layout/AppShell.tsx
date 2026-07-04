import { useState } from 'react'
import { Outlet } from 'react-router'
import { cn } from '@/utils/cn'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-(--surface-secondary)">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div
        className={cn(
          'transition-all duration-300 ease-in-out min-h-screen',
          sidebarCollapsed ? 'ml-[68px]' : 'ml-[240px]'
        )}
      >
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
