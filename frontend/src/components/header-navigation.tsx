/**
 * Header navigation component with user authentication
 * Constitutional compliance: React functional component, TypeScript strict typing, kebab-case filename
 */

import { useState, useRef, useEffect } from 'react'
import { User, UserRole, getUserPermissions } from '@/types/user-types'

interface HeaderNavigationProps {
  user: User | null
  onLogout: () => void
  className?: string
}

interface NavigationItem {
  id: string
  label: string
  href?: string
  onClick?: () => void
  icon?: string
  permissions?: string[]
  isActive?: boolean
}

export const HeaderNavigation = ({ user, onLogout, className = '' }: HeaderNavigationProps) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Navigation items based on user permissions
  const getNavigationItems = (): NavigationItem[] => {
    if (!user) return []

    const permissions = getUserPermissions(user.role)
    const baseItems: NavigationItem[] = [
      {
        id: 'transactions',
        label: 'Transaktioner',
        href: '/transactions',
        icon: 'list',
        permissions: ['view_transactions'],
        isActive: window.location.pathname === '/transactions'
      }
    ]

    const adminItems: NavigationItem[] = []

    if (permissions.includes('configure_mock_data')) {
      adminItems.push({
        id: 'settings',
        label: 'Inställningar',
        href: '/settings',
        icon: 'settings',
        permissions: ['configure_mock_data']
      })
    }

    if (permissions.includes('view_reports')) {
      adminItems.push({
        id: 'reports',
        label: 'Rapporter',
        href: '/reports',
        icon: 'chart',
        permissions: ['view_reports']
      })
    }

    return [...baseItems, ...adminItems].filter(item =>
      !item.permissions || item.permissions.some(permission => permissions.includes(permission))
    )
  }

  const navigationItems = getNavigationItems()

  // User menu items
  const userMenuItems = [
    { id: 'profile', label: 'Min profil', icon: 'user', onClick: () => console.log('Profile clicked') },
    { id: 'settings', label: 'Inställningar', icon: 'settings', onClick: () => console.log('Settings clicked') },
    { id: 'help', label: 'Hjälp', icon: 'help', onClick: () => console.log('Help clicked') },
    { id: 'logout', label: 'Logga ut', icon: 'logout', onClick: onLogout }
  ]

  // Handle clicking outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle escape key to close menus
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false)
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [])

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case UserRole.VIEWER:
        return 'Läsare'
      case UserRole.ACCOUNTANT:
        return 'Redovisningsassistent'
      case UserRole.CONTROLLER:
        return 'Controller'
      default:
        return role
    }
  }

  const renderIcon = (iconName: string) => {
    const iconMap: Record<string, JSX.Element> = {
      list: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      ),
      settings: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      ),
      chart: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      ),
      user: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      ),
      help: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      ),
      logout: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
        </svg>
      ),
      menu: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      ),
      close: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )
    }
    return iconMap[iconName] || <div></div>
  }

  if (!user) {
    return null
  }

  return (
    <header className={`header-navigation ${className}`}>
      <div className="header-container">
        {/* Logo and brand */}
        <div className="header-brand">
          <a href="/" className="brand-link">
            <div className="brand-logo">
              <svg viewBox="0 0 40 40" className="logo-svg">
                <rect x="2" y="2" width="36" height="36" rx="8" fill="currentColor" />
                <text x="20" y="26" textAnchor="middle" className="logo-text" fill="white">FD</text>
              </svg>
            </div>
            <span className="brand-name">FinDash</span>
          </a>
        </div>

        {/* Desktop navigation */}
        <nav className="desktop-navigation" role="navigation" aria-label="Huvudnavigation">
          <ul className="nav-list">
            {navigationItems.map((item) => (
              <li key={item.id} className="nav-item">
                <a
                  href={item.href}
                  onClick={item.onClick}
                  className={`nav-link ${item.isActive ? 'nav-link--active' : ''}`}
                  aria-current={item.isActive ? 'page' : undefined}
                >
                  <span className="nav-icon">
                    {item.icon && renderIcon(item.icon)}
                  </span>
                  <span className="nav-label">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* User menu */}
        <div className="header-user" ref={userMenuRef}>
          <button
            className={`user-menu-button ${isUserMenuOpen ? 'user-menu-button--open' : ''}`}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="menu"
            aria-label="Användarens meny"
          >
            <div className="user-avatar">
              <span className="avatar-initials">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
            <div className="user-info">
              <div className="user-name">{user.firstName} {user.lastName}</div>
              <div className="user-role">{getRoleDisplayName(user.role)}</div>
            </div>
            <svg className="dropdown-arrow" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {isUserMenuOpen && (
            <div className="user-menu" role="menu" aria-label="Användarens alternativ">
              <div className="user-menu-header">
                <div className="user-details">
                  <div className="user-full-name">{user.firstName} {user.lastName}</div>
                  <div className="user-email">{user.email}</div>
                  <div className="user-role-badge">{getRoleDisplayName(user.role)}</div>
                </div>
              </div>
              <div className="user-menu-divider" />
              <div className="user-menu-items">
                {userMenuItems.map((item) => (
                  <button
                    key={item.id}
                    className={`user-menu-item ${item.id === 'logout' ? 'user-menu-item--danger' : ''}`}
                    onClick={() => {
                      item.onClick?.()
                      setIsUserMenuOpen(false)
                    }}
                    role="menuitem"
                  >
                    <span className="menu-item-icon">
                      {renderIcon(item.icon)}
                    </span>
                    <span className="menu-item-label">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className={`mobile-menu-button ${isMobileMenuOpen ? 'mobile-menu-button--open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-label="Mobilmeny"
        >
          {isMobileMenuOpen ? renderIcon('close') : renderIcon('menu')}
        </button>
      </div>

      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-navigation" ref={mobileMenuRef} role="navigation" aria-label="Mobilnavigation">
          <div className="mobile-nav-header">
            <div className="mobile-user-info">
              <div className="mobile-user-avatar">
                <span className="avatar-initials">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </span>
              </div>
              <div className="mobile-user-details">
                <div className="mobile-user-name">{user.firstName} {user.lastName}</div>
                <div className="mobile-user-email">{user.email}</div>
              </div>
            </div>
          </div>

          <nav className="mobile-nav-menu">
            {navigationItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => {
                  item.onClick?.()
                  setIsMobileMenuOpen(false)
                }}
                className={`mobile-nav-link ${item.isActive ? 'mobile-nav-link--active' : ''}`}
              >
                <span className="mobile-nav-icon">
                  {item.icon && renderIcon(item.icon)}
                </span>
                <span className="mobile-nav-label">{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="mobile-nav-divider" />

          <div className="mobile-nav-actions">
            {userMenuItems.map((item) => (
              <button
                key={item.id}
                className={`mobile-nav-action ${item.id === 'logout' ? 'mobile-nav-action--danger' : ''}`}
                onClick={() => {
                  item.onClick?.()
                  setIsMobileMenuOpen(false)
                }}
              >
                <span className="mobile-action-icon">
                  {renderIcon(item.icon)}
                </span>
                <span className="mobile-action-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

export default HeaderNavigation