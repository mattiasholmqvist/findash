/**
 * App router component for handling navigation and route-based rendering
 * Constitutional compliance: React functional component, TypeScript strict typing, kebab-case filename
 */

import { useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { getUserPermissions } from '@/types/user-types'
import { LoginPage } from '@/pages/login-page'
import { TransactionViewerPage } from '@/pages/transaction-viewer-page'
import { ErrorPage, NotFoundPage, UnauthorizedPage } from '@/pages/error-page'
import { FullPageLoading } from '@/components/loading-states'

// Route definition interface
interface Route {
  path: string
  component: () => ReactNode
  requiresAuth: boolean
  permissions?: string[]
  exact?: boolean
}

// Router state management
interface RouterState {
  currentPath: string
  isNavigating: boolean
  error: string | null
}

export const AppRouter = () => {
  const { state: authState, user, isAuthenticated } = useAuth()
  const [routerState, setRouterState] = useState<RouterState>({
    currentPath: window.location.pathname,
    isNavigating: false,
    error: null
  })

  // Route definitions
  const routes: Route[] = [
    {
      path: '/',
      component: () => isAuthenticated ?
        <TransactionViewerPage user={user!} onLogout={() => navigate('/login')} /> :
        <LoginPage onLoginSuccess={() => navigate('/transactions')} />,
      requiresAuth: false,
      exact: true
    },
    {
      path: '/login',
      component: () => <LoginPage onLoginSuccess={() => navigate('/transactions')} />,
      requiresAuth: false,
      exact: true
    },
    {
      path: '/transactions',
      component: () => <TransactionViewerPage user={user!} onLogout={() => navigate('/login')} />,
      requiresAuth: true,
      permissions: ['view_transactions'],
      exact: true
    },
    {
      path: '/settings',
      component: () => (
        <div className="settings-page">
          <h1>Inställningar</h1>
          <p>Inställningar kommer snart...</p>
        </div>
      ),
      requiresAuth: true,
      permissions: ['configure_mock_data'],
      exact: true
    },
    {
      path: '/reports',
      component: () => (
        <div className="reports-page">
          <h1>Rapporter</h1>
          <p>Rapporter kommer snart...</p>
        </div>
      ),
      requiresAuth: true,
      permissions: ['view_reports'],
      exact: true
    }
  ]

  // Navigation function
  const navigate = (path: string, replace = false) => {
    setRouterState(prev => ({ ...prev, isNavigating: true, error: null }))

    try {
      if (replace) {
        window.history.replaceState(null, '', path)
      } else {
        window.history.pushState(null, '', path)
      }

      setRouterState(prev => ({
        ...prev,
        currentPath: path,
        isNavigating: false
      }))
    } catch (error) {
      setRouterState(prev => ({
        ...prev,
        isNavigating: false,
        error: 'Navigation misslyckades'
      }))
      console.error('Navigation error:', error)
    }
  }

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setRouterState(prev => ({
        ...prev,
        currentPath: window.location.pathname
      }))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Auto-redirect logic
  useEffect(() => {
    const currentPath = routerState.currentPath

    // Redirect authenticated users from login page
    if (isAuthenticated && currentPath === '/login') {
      navigate('/transactions', true)
      return
    }

    // Redirect unauthenticated users to login (except for login page)
    if (!isAuthenticated && !authState.isLoading && currentPath !== '/login' && currentPath !== '/') {
      navigate('/login', true)
      return
    }

    // Redirect root to appropriate page based on auth status
    if (currentPath === '/') {
      if (isAuthenticated) {
        navigate('/transactions', true)
      } else if (!authState.isLoading) {
        navigate('/login', true)
      }
      return
    }
  }, [isAuthenticated, routerState.currentPath, authState.isLoading])

  // Route matching function
  const findMatchingRoute = (path: string): Route | null => {
    return routes.find(route => {
      if (route.exact) {
        return route.path === path
      }
      return path.startsWith(route.path)
    }) || null
  }

  // Permission checking function
  const hasRequiredPermissions = (permissions?: string[]): boolean => {
    if (!permissions || permissions.length === 0) {
      return true
    }

    if (!user) {
      return false
    }

    const userPermissions = getUserPermissions(user.role)

    return permissions.every(permission => userPermissions.includes(permission))
  }

  // Route rendering logic
  const renderRoute = (): ReactNode => {
    const { currentPath, error } = routerState

    // Show error if navigation failed
    if (error) {
      return <ErrorPage
        title="Navigationsfel"
        message={error}
        onRetry={() => setRouterState(prev => ({ ...prev, error: null }))}
        showRetryButton={true}
      />
    }

    // Show loading during auth initialization
    if (authState.isLoading) {
      return <FullPageLoading message="Kontrollerar behörighet..." showLogo={true} />
    }

    // Find matching route
    const route = findMatchingRoute(currentPath)

    // Show 404 for unknown routes
    if (!route) {
      return <NotFoundPage
        showHomeButton={true}
        showBackButton={true}
      />
    }

    // Check authentication requirement
    if (route.requiresAuth && !isAuthenticated) {
      return <UnauthorizedPage
        showBackButton={false}
        showHomeButton={true}
      />
    }

    // Check permissions
    if (route.requiresAuth && isAuthenticated && !hasRequiredPermissions(route.permissions)) {
      return <ErrorPage
        errorType="forbidden"
        title="Åtkomst nekad"
        message="Du har inte behörighet att komma åt denna sida."
        showBackButton={true}
        showHomeButton={true}
      />
    }

    // Render the route component
    try {
      return route.component()
    } catch (error) {
      console.error('Route rendering error:', error)
      return <ErrorPage
        title="Renderingsfel"
        message="Ett fel uppstod när sidan skulle laddas."
        onRetry={() => window.location.reload()}
        showRetryButton={true}
      />
    }
  }

  // Loading state during navigation
  if (routerState.isNavigating) {
    return <FullPageLoading message="Navigerar..." showLogo={false} />
  }

  return (
    <div className="app-router">
      {renderRoute()}
    </div>
  )
}

// Hook for accessing router functionality in components
export const useRouter = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
  }, [])

  const navigate = (path: string, replace = false) => {
    if (replace) {
      window.history.replaceState(null, '', path)
    } else {
      window.history.pushState(null, '', path)
    }
    setCurrentPath(path)
  }

  const goBack = () => {
    window.history.back()
  }

  const goForward = () => {
    window.history.forward()
  }

  return {
    currentPath,
    navigate,
    goBack,
    goForward,
    isCurrentPath: (path: string) => currentPath === path,
    matchesPath: (pattern: string) => currentPath.startsWith(pattern)
  }
}

// Link component for navigation
interface LinkProps {
  to: string
  replace?: boolean
  className?: string
  children: ReactNode
  onClick?: () => void
}

export const Link = ({ to, replace = false, className = '', children, onClick }: LinkProps) => {
  const { navigate } = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    onClick?.()
    navigate(to, replace)
  }

  return (
    <a
      href={to}
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}

export default AppRouter