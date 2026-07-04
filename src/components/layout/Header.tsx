import { useState } from 'react'
import { useNavigate } from 'react-router'
import { cn } from '@/utils/cn'
import { Search, Bell, Sun, Moon, LogOut, ChevronDown, Settings, User } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { Avatar } from '@/components/ui/Avatar'
import { useTheme } from '@/hooks/useTheme'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { profile, signOut } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header
      className={cn(
        'h-16 flex items-center justify-between px-6',
        'bg-(--surface-primary) border-b border-(--border-primary)',
        className
      )}
    >
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-tertiary)" />
          <input
            type="text"
            placeholder="Search products, customers, orders... (Ctrl+K)"
            className={cn(
              'w-full h-9 pl-10 pr-4 text-sm rounded-lg',
              'bg-(--surface-secondary) text-(--text-primary)',
              'border border-transparent',
              'placeholder:text-(--text-tertiary)',
              'focus:outline-none focus:bg-(--surface-primary) focus:border-(--border-primary)',
              'focus:ring-2 focus:ring-brand-500/20',
              'transition-all duration-200'
            )}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-(--text-tertiary) bg-(--surface-tertiary) rounded">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-(--text-tertiary) hover:text-(--text-primary) hover:bg-(--interactive-hover) transition-colors cursor-pointer"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-(--text-tertiary) hover:text-(--text-primary) hover:bg-(--interactive-hover) transition-colors cursor-pointer">
          <Bell className="h-4 w-4" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-danger-500 rounded-full ring-2 ring-(--surface-primary)" />
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-(--border-primary) mx-1" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-(--interactive-hover) transition-colors cursor-pointer"
          >
            <Avatar
              name={profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'User'}
              size="sm"
            />
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-(--text-primary) leading-tight">
                {profile?.first_name} {profile?.last_name}
              </p>
              <p className="text-[10px] text-(--text-tertiary) leading-tight capitalize">
                {profile?.role || 'Staff'}
              </p>
            </div>
            <ChevronDown className="h-3 w-3 text-(--text-tertiary) hidden md:block" />
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 z-50 bg-(--surface-elevated) rounded-xl border border-(--border-primary) shadow-lg animate-scale-in py-1">
                <button 
                  onClick={() => {
                    setUserMenuOpen(false)
                    navigate('/settings')
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-(--text-secondary) hover:bg-(--interactive-hover) transition-colors cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button 
                  onClick={() => {
                    setUserMenuOpen(false)
                    navigate('/settings')
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-(--text-secondary) hover:bg-(--interactive-hover) transition-colors cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <div className="my-1 border-t border-(--border-secondary)" />
                <button 
                  onClick={() => {
                    setUserMenuOpen(false)
                    signOut()
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-danger-600 hover:bg-(--interactive-hover) transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
