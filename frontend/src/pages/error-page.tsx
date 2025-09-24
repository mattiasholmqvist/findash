/**
 * Error page component for various error states
 * Constitutional compliance: React functional component, TypeScript strict typing, kebab-case filename
 */

interface ErrorPageProps {
  errorType?: 'not-found' | 'server-error' | 'network-error' | 'unauthorized' | 'forbidden' | 'generic'
  title?: string
  message?: string
  statusCode?: number
  showHomeButton?: boolean
  showBackButton?: boolean
  showRetryButton?: boolean
  onRetry?: () => void
  className?: string
}

export const ErrorPage = ({
  errorType = 'generic',
  title,
  message,
  statusCode,
  showHomeButton = true,
  showBackButton = true,
  showRetryButton = false,
  onRetry,
  className = ''
}: ErrorPageProps) => {
  const getErrorConfig = () => {
    switch (errorType) {
      case 'not-found':
        return {
          title: title || '404 - Sidan hittades inte',
          message: message || 'Den sida du letar efter finns inte eller har flyttats.',
          statusCode: statusCode || 404,
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          ),
          suggestions: [
            'Kontrollera att webbadressen är korrekt stavad',
            'Använd navigationsmenyn för att hitta rätt sida',
            'Gå tillbaka till startsidan och försök igen'
          ]
        }

      case 'server-error':
        return {
          title: title || '500 - Serverfel',
          message: message || 'Ett oväntat fel uppstod på servern. Vårt team har informerats.',
          statusCode: statusCode || 500,
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
          suggestions: [
            'Vänta en stund och försök igen',
            'Kontrollera din internetanslutning',
            'Kontakta support om problemet kvarstår'
          ]
        }

      case 'network-error':
        return {
          title: title || 'Nätverksfel',
          message: message || 'Kunde inte ansluta till servern. Kontrollera din internetanslutning.',
          statusCode: statusCode || 0,
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M1 12s4-8 11-8 11 8 11 8" />
              <path d="M5 12s4-6 7-6 7 6 7 6" />
              <circle cx="12" cy="12" r="1" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ),
          suggestions: [
            'Kontrollera din internetanslutning',
            'Starta om din router om det behövs',
            'Försök igen om en stund'
          ]
        }

      case 'unauthorized':
        return {
          title: title || '401 - Ej auktoriserad',
          message: message || 'Du måste logga in för att komma åt denna sida.',
          statusCode: statusCode || 401,
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <circle cx="12" cy="16" r="1" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          ),
          suggestions: [
            'Logga in med dina användaruppgifter',
            'Kontrollera att ditt konto är aktivt',
            'Kontakta administratören om du behöver hjälp'
          ]
        }

      case 'forbidden':
        return {
          title: title || '403 - Åtkomst nekad',
          message: message || 'Du har inte behörighet att komma åt denna resurs.',
          statusCode: statusCode || 403,
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          ),
          suggestions: [
            'Kontakta administratören för att få åtkomst',
            'Kontrollera att du är inloggad med rätt konto',
            'Gå tillbaka till en sida du har behörighet för'
          ]
        }

      default:
        return {
          title: title || 'Ett fel uppstod',
          message: message || 'Något gick fel. Försök igen eller kontakta support.',
          statusCode: statusCode || 0,
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ),
          suggestions: [
            'Ladda om sidan och försök igen',
            'Kontrollera din internetanslutning',
            'Kontakta support om problemet kvarstår'
          ]
        }
    }
  }

  const config = getErrorConfig()

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  const handleReportError = () => {
    const errorData = {
      type: errorType,
      statusCode: config.statusCode,
      title: config.title,
      message: config.message,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }

    console.log('Error report data:', errorData)
    alert('Felrapport förberedd. I en riktig applikation skulle detta skickas till support.')
  }

  return (
    <div className={`error-page error-page--${errorType} ${className}`}>
      <div className="error-container">
        {/* Error icon and status */}
        <div className="error-visual">
          <div className="error-icon">
            {config.icon}
          </div>
          {config.statusCode > 0 && (
            <div className="error-status-code">
              {config.statusCode}
            </div>
          )}
        </div>

        {/* Error content */}
        <div className="error-content">
          <h1 className="error-title">{config.title}</h1>
          <p className="error-message">{config.message}</p>

          {/* Suggestions */}
          <div className="error-suggestions">
            <h2>Vad kan du göra?</h2>
            <ul className="suggestions-list">
              {config.suggestions.map((suggestion, index) => (
                <li key={index} className="suggestion-item">
                  <svg className="suggestion-icon" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 6.586 7.707 5.293a1 1 0 00-1.414 1.414L7.586 8l-1.293 1.293a1 1 0 101.414 1.414L9 9.414l1.293 1.293a1 1 0 001.414-1.414L10.414 8l1.293-1.293z" clipRule="evenodd" />
                  </svg>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          {/* Action buttons */}
          <div className="error-actions">
            {showRetryButton && (
              <button onClick={handleRetry} className="error-button error-button--primary">
                <svg className="button-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Försök igen
              </button>
            )}

            {showHomeButton && (
              <button onClick={handleGoHome} className="error-button error-button--secondary">
                <svg className="button-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Gå till startsidan
              </button>
            )}

            {showBackButton && (
              <button onClick={handleGoBack} className="error-button error-button--tertiary">
                <svg className="button-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Gå tillbaka
              </button>
            )}
          </div>

          {/* Additional help */}
          <div className="error-help">
            <h3>Behöver du hjälp?</h3>
            <p>Om problemet kvarstår kan du:</p>
            <div className="help-actions">
              <button onClick={handleReportError} className="help-link">
                <svg className="help-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Rapportera felet
              </button>

              <a href="mailto:support@findash.se" className="help-link">
                <svg className="help-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Kontakta support
              </a>

              <a href="/help" className="help-link">
                <svg className="help-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Besök hjälpsektionen
              </a>
            </div>
          </div>

          {/* Technical details */}
          <div className="error-technical">
            <details className="technical-details">
              <summary>Teknisk information</summary>
              <div className="technical-info">
                <div className="tech-row">
                  <span className="tech-label">Feltyp:</span>
                  <span className="tech-value">{errorType}</span>
                </div>
                <div className="tech-row">
                  <span className="tech-label">Statuskod:</span>
                  <span className="tech-value">{config.statusCode}</span>
                </div>
                <div className="tech-row">
                  <span className="tech-label">URL:</span>
                  <span className="tech-value">{window.location.href}</span>
                </div>
                <div className="tech-row">
                  <span className="tech-label">Tidpunkt:</span>
                  <span className="tech-value">{new Date().toLocaleString('sv-SE')}</span>
                </div>
                <div className="tech-row">
                  <span className="tech-label">Webbläsare:</span>
                  <span className="tech-value">{navigator.userAgent}</span>
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Footer */}
        <div className="error-footer">
          <p className="footer-text">
            © 2024 FinDash. Ett modernt bokföringssystem för svenska företag.
          </p>
        </div>
      </div>
    </div>
  )
}

// Specific error page components for common scenarios
export const NotFoundPage = (props: Omit<ErrorPageProps, 'errorType'>) => (
  <ErrorPage {...props} errorType="not-found" />
)

export const ServerErrorPage = (props: Omit<ErrorPageProps, 'errorType'>) => (
  <ErrorPage {...props} errorType="server-error" showRetryButton={true} />
)

export const NetworkErrorPage = (props: Omit<ErrorPageProps, 'errorType'>) => (
  <ErrorPage {...props} errorType="network-error" showRetryButton={true} />
)

export const UnauthorizedPage = (props: Omit<ErrorPageProps, 'errorType'>) => (
  <ErrorPage {...props} errorType="unauthorized" showBackButton={false} />
)

export const ForbiddenPage = (props: Omit<ErrorPageProps, 'errorType'>) => (
  <ErrorPage {...props} errorType="forbidden" />
)

export default ErrorPage