import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { cn } from '@/utils/cn'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-(--surface-secondary)">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      
      <div
        className={cn(
          'transition-all duration-300 ease-in-out min-h-screen flex flex-col',
          // Desktop margins
          'md:ml-[240px]',
          sidebarCollapsed && 'md:ml-[68px]',
          // Mobile margins
          'ml-0'
        )}
      >
        <Header onMobileMenuClick={() => setMobileMenuOpen(true)} />
        <main className="p-4 md:p-6 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
