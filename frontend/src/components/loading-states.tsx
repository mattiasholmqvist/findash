/**
 * Loading states and skeleton components
 * Constitutional compliance: React functional component, TypeScript strict typing, kebab-case filename
 */

import { ReactNode } from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
  'aria-label'?: string
}

interface LoadingSkeletonProps {
  width?: string | number
  height?: string | number
  variant?: 'text' | 'rectangular' | 'circular'
  className?: string
}

interface LoadingOverlayProps {
  isLoading: boolean
  children: ReactNode
  message?: string
  className?: string
}

interface FullPageLoadingProps {
  message?: string
  showLogo?: boolean
}

// Basic loading spinner component
export const LoadingSpinner = ({
  size = 'medium',
  className = '',
  'aria-label': ariaLabel = 'Laddar'
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    small: 'spinner--small',
    medium: 'spinner--medium',
    large: 'spinner--large'
  }

  return (
    <div
      className={`loading-spinner ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label={ariaLabel}
    >
      <svg className="spinner-svg" viewBox="0 0 24 24">
        <circle
          className="spinner-circle"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">{ariaLabel}</span>
    </div>
  )
}

// Skeleton loading placeholder
export const LoadingSkeleton = ({
  width = '100%',
  height = '1rem',
  variant = 'text',
  className = ''
}: LoadingSkeletonProps) => {
  const variantClasses = {
    text: 'skeleton--text',
    rectangular: 'skeleton--rectangular',
    circular: 'skeleton--circular'
  }

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  }

  return (
    <div
      className={`loading-skeleton ${variantClasses[variant]} ${className}`}
      style={style}
      aria-label="Innehåll laddas"
      role="status"
    />
  )
}

// Transaction list skeleton
export const TransactionListSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="transaction-list-skeleton" role="status" aria-label="Transaktioner laddas">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="transaction-skeleton">
          <div className="transaction-skeleton-main">
            <LoadingSkeleton width="80px" height="16px" className="date-skeleton" />
            <div className="description-skeleton">
              <LoadingSkeleton width="60%" height="18px" />
              <LoadingSkeleton width="40%" height="14px" />
            </div>
            <LoadingSkeleton width="100px" height="20px" className="amount-skeleton" />
          </div>
          <div className="transaction-skeleton-details">
            <LoadingSkeleton width="120px" height="14px" />
            <LoadingSkeleton width="90px" height="14px" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Login form skeleton
export const LoginFormSkeleton = () => {
  return (
    <div className="login-form-skeleton" role="status" aria-label="Inloggningsformulär laddas">
      <div className="form-header-skeleton">
        <LoadingSkeleton width="150px" height="32px" />
        <LoadingSkeleton width="80%" height="16px" />
      </div>

      <div className="form-fields-skeleton">
        <div className="form-field-skeleton">
          <LoadingSkeleton width="100px" height="16px" />
          <LoadingSkeleton width="100%" height="40px" variant="rectangular" />
        </div>
        <div className="form-field-skeleton">
          <LoadingSkeleton width="80px" height="16px" />
          <LoadingSkeleton width="100%" height="40px" variant="rectangular" />
        </div>
      </div>

      <LoadingSkeleton width="100%" height="48px" variant="rectangular" className="button-skeleton" />
    </div>
  )
}

// Loading overlay component
export const LoadingOverlay = ({
  isLoading,
  children,
  message = 'Laddar...',
  className = ''
}: LoadingOverlayProps) => {
  return (
    <div className={`loading-overlay-container ${className}`}>
      {children}
      {isLoading && (
        <div
          className="loading-overlay"
          role="status"
          aria-live="polite"
          aria-label={message}
        >
          <div className="loading-overlay-content">
            <LoadingSpinner size="large" />
            <div className="loading-message">{message}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Full page loading component
export const FullPageLoading = ({
  message = 'Laddar applikation...',
  showLogo = true
}: FullPageLoadingProps) => {
  return (
    <div className="full-page-loading" role="status" aria-live="polite">
      <div className="loading-content">
        {showLogo && (
          <div className="loading-logo">
            <svg viewBox="0 0 100 40" className="logo-svg">
              <text x="0" y="25" className="logo-text">FinDash</text>
            </svg>
          </div>
        )}

        <LoadingSpinner size="large" aria-label={message} />
        <div className="loading-message">{message}</div>
      </div>
    </div>
  )
}

// Error boundary loading fallback
export const ErrorBoundaryFallback = ({
  error,
  resetError
}: {
  error: Error
  resetError: () => void
}) => {
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

        <h2>Ett oväntat fel uppstod</h2>
        <p>Något gick fel när sidan laddades. Försök igen eller kontakta support om problemet kvarstår.</p>

        <div className="error-details">
          <details>
            <summary>Teknisk information</summary>
            <pre className="error-stack">{error.message}</pre>
          </details>
        </div>

        <div className="error-actions">
          <button onClick={resetError} className="retry-button">
            Försök igen
          </button>
          <button onClick={() => window.location.reload()} className="reload-button">
            Ladda om sidan
          </button>
        </div>
      </div>
    </div>
  )
}

// Generic loading button
export const LoadingButton = ({
  children,
  isLoading,
  loadingText = 'Laddar...',
  disabled,
  onClick,
  className = '',
  type = 'button',
  ...props
}: {
  children: ReactNode
  isLoading: boolean
  loadingText?: string
  disabled?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`loading-button ${isLoading ? 'loading-button--loading' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="small" className="button-spinner" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}

// Inline loading indicator
export const InlineLoading = ({
  message = 'Laddar...',
  className = ''
}: {
  message?: string
  className?: string
}) => {
  return (
    <div className={`inline-loading ${className}`} role="status" aria-live="polite">
      <LoadingSpinner size="small" />
      <span className="inline-loading-message">{message}</span>
    </div>
  )
}

// Page loading states
export const PageLoadingStates = {
  // Initial page load
  Initial: () => <FullPageLoading message="Startar FinDash..." showLogo={true} />,

  // Authentication loading
  Authentication: () => <FullPageLoading message="Verifierar inloggning..." showLogo={false} />,

  // Data loading
  LoadingData: () => <FullPageLoading message="Hämtar data..." showLogo={false} />,

  // Configuration loading
  LoadingConfig: () => <FullPageLoading message="Laddar konfiguration..." showLogo={false} />
}

// Export all components
export default {
  LoadingSpinner,
  LoadingSkeleton,
  TransactionListSkeleton,
  LoginFormSkeleton,
  LoadingOverlay,
  FullPageLoading,
  ErrorBoundaryFallback,
  LoadingButton,
  InlineLoading,
  PageLoadingStates
}