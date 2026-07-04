import { useState } from 'react'
import { useNavigate } from 'react-router'
import { cn } from '@/utils/cn'
import { Search, Bell, Sun, Moon, LogOut, ChevronDown, Settings, User, Menu } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { Avatar } from '@/components/ui/Avatar'
import { useTheme } from '@/hooks/useTheme'

interface HeaderProps {
  className?: string
  onMobileMenuClick?: () => void
}

export function Header({ className, onMobileMenuClick }: HeaderProps) {
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
      {/* Mobile Menu Button */}
      <button
        onClick={onMobileMenuClick}
        className="md:hidden mr-4 p-2 -ml-2 text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-secondary) rounded-lg transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md hidden md:block">
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
      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        <button
          onClick={toggleTheme}
          className="relative p-2 text-(--text-tertiary) hover:text-(--text-secondary) hover:bg-(--surface-tertiary) rounded-full transition-colors group cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 group-hover:scale-110 transition-transform" />
          ) : (
            <Moon className="h-5 w-5 group-hover:scale-110 transition-transform" />
          )}
        </button>

        <button className="hidden sm:block relative p-2 text-(--text-tertiary) hover:text-(--text-secondary) hover:bg-(--surface-tertiary) rounded-full transition-colors group cursor-pointer">
          <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-(--surface-primary)" />
        </button>

        <div className="hidden sm:block w-px h-6 bg-(--border-secondary) mx-2" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 sm:pl-3 sm:pr-2 sm:py-1.5 rounded-full hover:bg-(--surface-tertiary) transition-colors cursor-pointer group"
          >
            <Avatar
              name={profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'User'}
              size="sm"
            />
            <div className="hidden sm:block text-left">
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
