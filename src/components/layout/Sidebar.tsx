import { NavLink, useLocation } from 'react-router'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Users,
  Truck,
  Receipt,
  TentTree,
  BarChart3,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  MapPin,
  MonitorSmartphone,
} from 'lucide-react'
import { useAuth } from '@/features/auth'
import type { Role } from '@/features/auth/AuthContext'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  section?: string
  allowedRoles?: Role[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-5 w-5" />, allowedRoles: ['owner', 'manager', 'staff'] },

  { label: 'Products', path: '/products', icon: <Package className="h-5 w-5" />, section: 'Catalog', allowedRoles: ['owner', 'manager'] },
  { label: 'Categories', path: '/categories', icon: <FolderTree className="h-5 w-5" />, section: 'Catalog', allowedRoles: ['owner', 'manager'] },
  { label: 'Inventory', path: '/inventory', icon: <Warehouse className="h-5 w-5" />, section: 'Catalog', allowedRoles: ['owner', 'manager'] },
  { label: 'Locations', path: '/locations', icon: <MapPin className="h-5 w-5" />, section: 'Catalog', allowedRoles: ['owner', 'manager'] },

  { label: 'Point of Sale', path: '/pos', icon: <MonitorSmartphone className="h-5 w-5" />, section: 'Transactions', allowedRoles: ['owner', 'manager', 'staff'] },
  { label: 'Sales History', path: '/sales', icon: <ShoppingCart className="h-5 w-5" />, section: 'Transactions', allowedRoles: ['owner', 'manager', 'staff'] },
  { label: 'Purchasing', path: '/purchasing', icon: <Truck className="h-5 w-5" />, section: 'Transactions', allowedRoles: ['owner', 'manager'] },
  { label: 'Rentals', path: '/rentals', icon: <TentTree className="h-5 w-5" />, section: 'Transactions', allowedRoles: ['owner', 'manager'] },
  { label: 'Expenses', path: '/expenses', icon: <Receipt className="h-5 w-5" />, section: 'Transactions', allowedRoles: ['owner', 'manager'] },

  { label: 'Customers', path: '/customers', icon: <Users className="h-5 w-5" />, section: 'People', allowedRoles: ['owner', 'manager'] },
  { label: 'Suppliers', path: '/suppliers', icon: <Truck className="h-5 w-5" />, section: 'People', allowedRoles: ['owner', 'manager'] },

  { label: 'Reports', path: '/reports', icon: <BarChart3 className="h-5 w-5" />, section: 'Analytics', allowedRoles: ['owner', 'manager'] },
  { label: 'Audit Log', path: '/audit-log', icon: <ScrollText className="h-5 w-5" />, section: 'Analytics', allowedRoles: ['owner', 'manager'] },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation()
  const { profile } = useAuth()
  const userRole = profile?.role || 'staff'

  // Group items by section
  const sections = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    // Check role access
    if (item.allowedRoles && !item.allowedRoles.includes(userRole)) {
      return acc
    }

    const section = item.section || '_top'
    if (!acc[section]) acc[section] = []
    acc[section].push(item)
    return acc
  }, {})

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-[100dvh] z-50',
          'bg-(--sidebar-bg) text-(--sidebar-text)',
          'border-r border-(--sidebar-border)',
          'flex flex-col',
          'transition-all duration-300 ease-in-out',
          // Desktop width
          collapsed ? 'md:w-[68px]' : 'md:w-[240px]',
          // Mobile width & transform
          'w-[240px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-(--sidebar-border)">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="shrink-0 h-8 w-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-sm font-bold text-(--sidebar-text-active) leading-tight">
                Nexus
              </h1>
              <p className="text-[10px] text-(--sidebar-text) leading-tight opacity-70">
                El Nido Outdoor
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section}>
            {section !== '_top' && !collapsed && (
              <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-(--sidebar-text) opacity-50">
                {section}
              </p>
            )}
            {section !== '_top' && collapsed && <div className="my-2 mx-2 border-t border-(--sidebar-border)" />}
            {items.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path))

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium',
                    'transition-all duration-150',
                    'hover:bg-(--sidebar-hover) hover:text-(--sidebar-text-active)',
                    isActive
                      ? 'bg-(--sidebar-active) text-(--sidebar-text-active)'
                      : 'text-(--sidebar-text)',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Desktop Collapse Toggle */}
      <div className="p-3 border-t border-(--sidebar-border) hidden md:block">
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center justify-center w-full py-2 rounded-lg',
            'text-(--sidebar-text) hover:text-(--sidebar-text-active)',
            'hover:bg-(--sidebar-hover) transition-colors cursor-pointer'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </div>
          )}
        </button>
      </div>
    </aside>
    </>
  )
}
