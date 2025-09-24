/**
 * Error boundary component for React error handling
 * Constitutional compliance: React functional component, TypeScript strict typing, kebab-case filename
 */

import { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, resetError: () => void) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number | boolean | null | undefined>
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  resetCount: number
}

// Main Error Boundary class component
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      resetCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error)
    console.error('Error info:', errorInfo)

    this.setState({
      errorInfo
    })

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo)

    // Log to external service in production
    if (import.meta.env.PROD) {
      this.logErrorToService(error, errorInfo)
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    // Reset error boundary when resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some((key, index) => key !== prevProps.resetKeys![index])
      if (hasResetKeyChanged) {
        this.resetError()
      }
    }

    // Reset error boundary when any prop changes (if enabled)
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetError()
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  resetError = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      resetCount: prevState.resetCount + 1
    }))
  }

  resetErrorAfterDelay = (delayMs: number = 5000) => {
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetError()
    }, delayMs)
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // In a real application, you would send this to an error reporting service
    // like Sentry, LogRocket, or similar
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      resetCount: this.state.resetCount
    }

    console.warn('Would log error to service:', errorData)
  }

  render() {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.resetError)
      }

      // Default error UI
      return <DefaultErrorFallback error={error} resetError={this.resetError} />
    }

    return children
  }
}

// Default error fallback component
const DefaultErrorFallback = ({
  error,
  resetError
}: {
  error: Error
  resetError: () => void
}) => {
  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="error-boundary-fallback" role="alert">
      <div className="error-content">
        <div className="error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1>Ett oväntat fel uppstod</h1>
        <p>
          Något gick fel när sidan laddades. Försök igen eller kontakta support
          om problemet kvarstår.
        </p>

        <div className="error-actions">
          <button onClick={resetError} className="primary-button">
            Försök igen
          </button>
          <button onClick={handleReload} className="secondary-button">
            Ladda om sidan
          </button>
          <button onClick={handleGoHome} className="tertiary-button">
            Gå till startsidan
          </button>
        </div>

        <div className="error-details">
          <details>
            <summary>Teknisk information</summary>
            <div className="error-info">
              <div className="error-message">
                <strong>Felmeddelande:</strong>
                <pre>{error.message}</pre>
              </div>
              {error.stack && (
                <div className="error-stack">
                  <strong>Stack trace:</strong>
                  <pre>{error.stack}</pre>
                </div>
              )}
              <div className="error-meta">
                <p><strong>Tidpunkt:</strong> {new Date().toLocaleString('sv-SE')}</p>
                <p><strong>Sida:</strong> {window.location.pathname}</p>
                <p><strong>Webbläsare:</strong> {navigator.userAgent}</p>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}

// Specialized error boundaries for different parts of the app

// Authentication Error Boundary
export const AuthErrorBoundary = ({ children }: { children: ReactNode }) => {
  const handleAuthError = (error: Error) => {
    console.error('Authentication error:', error)

    // Clear any stored authentication data
    localStorage.removeItem('findash_auth_session')

    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
  }

  return (
    <ErrorBoundary
      onError={handleAuthError}
      fallback={(error, resetError) => (
        <div className="auth-error-fallback" role="alert">
          <div className="error-content">
            <h2>Inloggningsfel</h2>
            <p>
              Det uppstod ett fel med autentiseringen. Du kommer att omdirigeras
              till inloggningssidan om ett ögonblick.
            </p>
            <div className="error-actions">
              <button onClick={() => window.location.href = '/login'} className="primary-button">
                Gå till inloggning nu
              </button>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

// Transaction List Error Boundary
export const TransactionListErrorBoundary = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <div className="transaction-list-error" role="alert">
          <div className="error-content">
            <div className="error-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3>Kunde inte ladda transaktioner</h3>
            <p>
              Det uppstod ett fel när transaktionslistan skulle laddas.
              Kontrollera din internetanslutning och försök igen.
            </p>
            <div className="error-actions">
              <button onClick={resetError} className="primary-button">
                Försök igen
              </button>
            </div>
          </div>
        </div>
      )}
      resetOnPropsChange={true}
    >
      {children}
    </ErrorBoundary>
  )
}

// Form Error Boundary
export const FormErrorBoundary = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <div className="form-error" role="alert">
          <div className="error-content">
            <h3>Formulärfel</h3>
            <p>
              Det uppstod ett fel i formuläret. Kontrollera dina inmatningar
              och försök igen.
            </p>
            <div className="error-actions">
              <button onClick={resetError} className="primary-button">
                Försök igen
              </button>
            </div>
          </div>
        </div>
      )}
      resetOnPropsChange={true}
    >
      {children}
    </ErrorBoundary>
  )
}

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryConfig?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryConfig}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  )

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`

  return WithErrorBoundaryComponent
}

// Hook for manual error throwing (useful for async errors)
export const useErrorHandler = () => {
  const throwError = (error: Error) => {
    // Use setTimeout to break out of the current call stack
    // This ensures the error is caught by the nearest error boundary
    setTimeout(() => {
      throw error
    }, 0)
  }

  return throwError
}

// Utility function to create error boundaries programmatically
export const createErrorBoundary = (config: Omit<ErrorBoundaryProps, 'children'>) => {
  return ({ children }: { children: ReactNode }) => (
    <ErrorBoundary {...config}>
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary