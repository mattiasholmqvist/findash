/**
 * Main App component - Root application component with providers and error handling
 * Constitutional compliance: React functional component, TypeScript strict typing, kebab-case filename
 */

import { StrictMode, Suspense } from 'react'
import { ErrorBoundary } from '@/components/error-boundary'
import { AuthProvider } from '@/contexts/auth-context'
import { ReactQueryProvider } from '@/lib/react-query'
import { AppRouter } from '@/components/app-router'
import { FullPageLoading } from '@/components/loading-states'
import '@/styles/globals.css'

// Main App component
export const App = () => {
  return (
    <StrictMode>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('Global error boundary caught:', error, errorInfo)

          // In production, you would send this to an error reporting service
          if (import.meta.env.PROD) {
            // Example: reportError(error, errorInfo)
            console.warn('Error reporting would be triggered in production')
          }
        }}
        fallback={(error, resetError) => (
          <div className="error-boundary-fallback">
            <div className="error-content">
              <div className="error-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Applikationsfel
              </h1>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Ett oväntat fel uppstod i FinDash. Vår utvecklare har informerats
                och arbetar på en lösning.
              </p>

              <div className="space-y-3">
                <button
                  onClick={resetError}
                  className="btn btn-primary w-full"
                >
                  Försök igen
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-secondary w-full"
                >
                  Ladda om applikationen
                </button>
              </div>

              <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
                    Teknisk information
                  </summary>
                  <div className="mt-2 text-gray-600 dark:text-gray-400">
                    <div><strong>Fel:</strong> {error.message}</div>
                    <div><strong>Tidpunkt:</strong> {new Date().toLocaleString('sv-SE')}</div>
                    <div><strong>Webbläsare:</strong> {navigator.userAgent}</div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        )}
      >
        <ReactQueryProvider>
          <AuthProvider>
            <Suspense fallback={<AppLoadingFallback />}>
              <AppContent />
            </Suspense>
          </AuthProvider>
        </ReactQueryProvider>
      </ErrorBoundary>
    </StrictMode>
  )
}

// App content with router
const AppContent = () => {
  return (
    <div className="app">
      {/* Global app container */}
      <AppRouter />

      {/* Development tools */}
      {import.meta.env.MODE === 'development' && <DevelopmentTools />}

      {/* Accessibility announcements */}
      <div
        id="announcement-region"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Skip navigation link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 btn btn-primary"
      >
        Hoppa till huvudinnehåll
      </a>
    </div>
  )
}

// Loading fallback for Suspense
const AppLoadingFallback = () => {
  return (
    <FullPageLoading
      message="Startar FinDash..."
      showLogo={true}
    />
  )
}

// Development tools component
const DevelopmentTools = () => {
  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2 no-print">
      {/* Theme toggle */}
      <button
        onClick={() => {
          const isDark = document.documentElement.classList.contains('dark')
          if (isDark) {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
          } else {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
          }
        }}
        className="btn btn-ghost btn-sm bg-white/90 backdrop-blur-sm shadow-lg border dark:bg-gray-800/90"
        title="Växla tema"
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Version info */}
      <div className="text-xs bg-white/90 backdrop-blur-sm rounded px-2 py-1 shadow-lg border dark:bg-gray-800/90 dark:text-white">
        v{import.meta.env.VITE_APP_VERSION || '0.1.0'}
      </div>
    </div>
  )
}

// Initialize theme on app start
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Initialize theme immediately (before React renders)
initializeTheme()

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const savedTheme = localStorage.getItem('theme')
  if (!savedTheme) {
    if (e.matches) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
})

// Service worker registration (for future PWA features)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

// Global error handler for unhandled promises
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)

  // Prevent the default browser behavior
  event.preventDefault()

  // In production, you would report this error
  if (import.meta.env.PROD) {
    console.warn('Unhandled promise rejection would be reported in production')
  }
})

// Global error handler for uncaught exceptions
window.addEventListener('error', (event) => {
  console.error('Uncaught exception:', event.error)

  // In production, you would report this error
  if (import.meta.env.PROD) {
    console.warn('Uncaught exception would be reported in production')
  }
})

// Performance monitoring
if (import.meta.env.MODE === 'development') {
  // Log performance metrics
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      console.log('Performance metrics:', {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        totalTime: perfData.loadEventEnd - perfData.navigationStart,
      })
    }, 0)
  })
}

export default App