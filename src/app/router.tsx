import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute, LoginPage, RoleGate } from '@/features/auth'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ProductListPage } from '@/features/products/ProductListPage'
import { CategoryListPage } from '@/features/categories/CategoryListPage'
import { InventoryPage } from '@/features/inventory/InventoryPage'
import { SalesListPage } from '@/features/sales/SalesListPage'
import { PurchaseListPage } from '@/features/purchasing/PurchaseListPage'
import { RentalListPage } from '@/features/rentals/RentalListPage'
import { ExpenseListPage } from '@/features/expenses/ExpenseListPage'
import { CustomerListPage } from '@/features/customers/CustomerListPage'
import { SupplierListPage } from '@/features/suppliers/SupplierListPage'
import { LocationListPage } from '@/features/locations/LocationListPage'
import { POSPage } from '@/features/sales/POSPage'
import { ReportsPage } from '@/features/reports/ReportsPage'
import { AuditLogPage } from '@/features/audit-log/AuditLogPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard
      { 
        index: true, 
        element: <RoleGate allowedRoles={['owner', 'manager', 'staff']}><DashboardPage /></RoleGate> 
      },

      // Catalog
      { path: 'products', element: <RoleGate allowedRoles={['owner', 'manager']}><ProductListPage /></RoleGate> },
      { path: 'categories', element: <RoleGate allowedRoles={['owner', 'manager']}><CategoryListPage /></RoleGate> },
      { path: 'locations', element: <RoleGate allowedRoles={['owner', 'manager']}><LocationListPage /></RoleGate> },
      { path: 'inventory', element: <RoleGate allowedRoles={['owner', 'manager']}><InventoryPage /></RoleGate> },

      // Transactions
      { path: 'pos', element: <RoleGate allowedRoles={['owner', 'manager', 'staff']}><POSPage /></RoleGate> },
      { path: 'sales', element: <RoleGate allowedRoles={['owner', 'manager', 'staff']}><SalesListPage /></RoleGate> },
      { path: 'purchasing', element: <RoleGate allowedRoles={['owner', 'manager']}><PurchaseListPage /></RoleGate> },
      { path: 'rentals', element: <RoleGate allowedRoles={['owner', 'manager']}><RentalListPage /></RoleGate> },
      { path: 'expenses', element: <RoleGate allowedRoles={['owner', 'manager']}><ExpenseListPage /></RoleGate> },

      // CRM
      { path: 'customers', element: <RoleGate allowedRoles={['owner', 'manager']}><CustomerListPage /></RoleGate> },
      { path: 'suppliers', element: <RoleGate allowedRoles={['owner', 'manager']}><SupplierListPage /></RoleGate> },

      // Analytics
      { path: 'reports', element: <RoleGate allowedRoles={['owner', 'manager']}><ReportsPage /></RoleGate> },
      { path: 'audit-log', element: <RoleGate allowedRoles={['owner', 'manager']}><AuditLogPage /></RoleGate> },

      // System
      { path: 'settings', element: <RoleGate allowedRoles={['owner', 'manager']}><SettingsPage /></RoleGate> },
    ],
  },
])
