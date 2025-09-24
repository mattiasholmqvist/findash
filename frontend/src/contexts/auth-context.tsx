/**
 * Authentication context for managing user session state
 * Constitutional compliance: React functional component, TypeScript strict typing, kebab-case filename
 */

import { createContext, useContext, useReducer, useEffect, ReactNode, Dispatch } from 'react'
import { User, LoginRequest, LoginResponse, LogoutResponse, UserSession, AuthState, isSessionValid, getSessionTimeRemaining } from '@/types/user-types'
import { ApiResponse } from '@/types/api-types'
import { mockAuthService } from '@/services/mock-auth-service'

// Auth Context Types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; session: UserSession } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT_START' }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'LOGOUT_ERROR'; payload: string }
  | { type: 'SESSION_REFRESH'; payload: { user: User; session: UserSession } }
  | { type: 'SESSION_EXPIRED' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'INITIALIZE' }

interface AuthContextType {
  state: AuthState
  login: (request: LoginRequest) => Promise<ApiResponse<LoginResponse>>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  clearError: () => void
  isAuthenticated: boolean
  user: User | null
}

// Initial state
const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check existing session
  user: null,
  session: null,
  error: null
}

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        isLoading: false
      }

    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      }

    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        session: action.payload.session,
        error: null
      }

    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        session: null,
        error: action.payload
      }

    case 'LOGOUT_START':
      return {
        ...state,
        isLoading: true,
        error: null
      }

    case 'LOGOUT_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        session: null,
        error: null
      }

    case 'LOGOUT_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      }

    case 'SESSION_REFRESH':
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session,
        error: null
      }

    case 'SESSION_EXPIRED':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        session: null,
        error: 'Din session har gått ut. Vänligen logga in igen.'
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }

    default:
      return state
  }
}

// Create contexts
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Provider component
interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState)

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const existingSession = mockAuthService.getCurrentSession()

        if (existingSession && isSessionValid(existingSession)) {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: existingSession.user,
              session: existingSession
            }
          })
        } else {
          // Try auto-login if configured
          const autoLoginResult = await mockAuthService.autoLogin()
          if (autoLoginResult?.success && autoLoginResult.data) {
            const session: UserSession = {
              token: autoLoginResult.data.token,
              user: autoLoginResult.data.user,
              expiresAt: new Date(Date.now() + autoLoginResult.data.expiresIn * 1000)
            }

            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: autoLoginResult.data.user,
                session
              }
            })
          } else {
            dispatch({ type: 'INITIALIZE' })
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
        dispatch({ type: 'INITIALIZE' })
      }
    }

    initializeAuth()
  }, [])

  // Set up session monitoring
  useEffect(() => {
    if (!state.session || !state.isAuthenticated) {
      return
    }

    const checkSession = () => {
      if (!isSessionValid(state.session!)) {
        dispatch({ type: 'SESSION_EXPIRED' })
        return
      }

      // Check if session expires soon (within 5 minutes)
      const timeRemaining = getSessionTimeRemaining(state.session!)
      if (timeRemaining < 5 * 60 * 1000 && timeRemaining > 0) {
        // Attempt to refresh session
        refreshSession().catch(error => {
          console.error('Session refresh failed:', error)
        })
      }
    }

    // Check session immediately
    checkSession()

    // Set up interval to check session every minute
    const sessionCheckInterval = setInterval(checkSession, 60 * 1000)

    return () => clearInterval(sessionCheckInterval)
  }, [state.session, state.isAuthenticated])

  // Set up automatic logout warning
  useEffect(() => {
    if (!state.session || !state.isAuthenticated) {
      return
    }

    const showLogoutWarning = () => {
      const timeRemaining = getSessionTimeRemaining(state.session!)
      if (timeRemaining < 2 * 60 * 1000 && timeRemaining > 0) {
        const shouldExtend = confirm(
          'Din session går ut om mindre än 2 minuter. Vill du förlänga sessionen?'
        )

        if (shouldExtend) {
          refreshSession().catch(error => {
            console.error('Session extension failed:', error)
          })
        }
      }
    }

    const warningInterval = setInterval(showLogoutWarning, 30 * 1000) // Check every 30 seconds

    return () => clearInterval(warningInterval)
  }, [state.session, state.isAuthenticated])

  // Login function
  const login = async (request: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    dispatch({ type: 'AUTH_START' })

    try {
      const response = await mockAuthService.login(request)

      if (response.success && response.data) {
        const session: UserSession = {
          token: response.data.token,
          user: response.data.user,
          expiresAt: new Date(Date.now() + response.data.expiresIn * 1000)
        }

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            session
          }
        })
      } else {
        const errorMessage = response.error?.message || 'Inloggning misslyckades'
        dispatch({ type: 'AUTH_ERROR', payload: errorMessage })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ett oväntat fel uppstod vid inloggning'
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage })

      return {
        success: false,
        error: {
          error: 'LOGIN_ERROR',
          message: errorMessage,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    dispatch({ type: 'LOGOUT_START' })

    try {
      const response = await mockAuthService.logout()

      if (response.success) {
        dispatch({ type: 'LOGOUT_SUCCESS' })
      } else {
        // Even if logout fails on server, clear local session
        dispatch({ type: 'LOGOUT_SUCCESS' })
        console.warn('Server logout failed, but local session cleared:', response.error)
      }
    } catch (error) {
      // Even if logout fails, clear local session
      dispatch({ type: 'LOGOUT_SUCCESS' })
      console.error('Logout error:', error)
    }
  }

  // Refresh session function
  const refreshSession = async (): Promise<void> => {
    try {
      const response = await mockAuthService.refreshSession()

      if (response.success && response.data) {
        const session: UserSession = {
          token: response.data.token,
          user: response.data.user,
          expiresAt: new Date(Date.now() + response.data.expiresIn * 1000)
        }

        dispatch({
          type: 'SESSION_REFRESH',
          payload: {
            user: response.data.user,
            session
          }
        })
      } else {
        throw new Error(response.error?.message || 'Session refresh failed')
      }
    } catch (error) {
      console.error('Session refresh error:', error)
      dispatch({ type: 'SESSION_EXPIRED' })
    }
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Context value
  const contextValue: AuthContextType = {
    state,
    login,
    logout,
    refreshSession,
    clearError,
    isAuthenticated: state.isAuthenticated,
    user: state.user
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

// HOC for protecting routes that require authentication
interface RequireAuthProps {
  children: ReactNode
  fallback?: ReactNode
  redirectTo?: string
}

export const RequireAuth = ({ children, fallback, redirectTo = '/login' }: RequireAuthProps) => {
  const { isAuthenticated, state } = useAuth()

  // Show loading during initial auth check
  if (state.isLoading) {
    return (
      fallback || (
        <div className="auth-loading">
          <div className="loading-spinner">Kontrollerar behörighet...</div>
        </div>
      )
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    if (redirectTo && typeof window !== 'undefined') {
      window.location.href = redirectTo
      return null
    }

    return (
      fallback || (
        <div className="auth-required">
          <h2>Inloggning krävs</h2>
          <p>Du måste logga in för att komma åt denna sida.</p>
          <button onClick={() => window.location.href = '/login'}>
            Gå till inloggning
          </button>
        </div>
      )
    )
  }

  return <>{children}</>
}

// Hook for getting user permissions
export const useUserPermissions = () => {
  const { user } = useAuth()

  const hasPermission = (permission: string): boolean => {
    if (!user) return false

    // Import getUserPermissions here to avoid circular dependency
    const { getUserPermissions } = require('@/types/user-types')
    const permissions = getUserPermissions(user.role)
    return permissions.includes(permission)
  }

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => hasPermission(permission))
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  }
}

export default AuthContext