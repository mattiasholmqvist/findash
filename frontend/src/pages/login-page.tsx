/**
 * Login page component
 * Constitutional compliance: React functional component, TypeScript strict typing, kebab-case filename
 */

import { useState, useEffect } from 'react'
import { LoginRequest, LoginResponse } from '@/types/user-types'
import { ApiResponse } from '@/types/api-types'
import { LoginForm } from '@/components/login-form'
import { FullPageLoading } from '@/components/loading-states'
import { mockAuthService } from '@/services/mock-auth-service'

interface LoginPageProps {
  onLoginSuccess: (loginResponse: LoginResponse) => void
  className?: string
}

export const LoginPage = ({ onLoginSuccess, className = '' }: LoginPageProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  // Check for existing session or auto-login on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already logged in
        const existingSession = mockAuthService.getCurrentSession()
        if (existingSession) {
          onLoginSuccess({
            token: existingSession.token,
            user: existingSession.user,
            expiresIn: Math.floor((existingSession.expiresAt.getTime() - Date.now()) / 1000)
          })
          return
        }

        // Try auto-login if enabled (for development)
        const autoLoginResult = await mockAuthService.autoLogin()
        if (autoLoginResult?.success && autoLoginResult.data) {
          onLoginSuccess(autoLoginResult.data)
          return
        }
      } catch (error) {
        console.error('Auto-login failed:', error)
        setError('Automatisk inloggning misslyckades')
      } finally {
        setIsInitializing(false)
      }
    }

    initializeAuth()
  }, [onLoginSuccess])

  const handleLogin = async (loginRequest: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await mockAuthService.login(loginRequest)

      if (response.success && response.data) {
        onLoginSuccess(response.data)
      } else if (response.error) {
        setError(response.error.message)
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ett oväntat fel uppstod'
      setError(errorMessage)

      return {
        success: false,
        error: {
          error: 'LOGIN_ERROR',
          message: errorMessage,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  // Show loading screen during initialization
  if (isInitializing) {
    return <FullPageLoading message="Kontrollerar inloggningsstatus..." showLogo={true} />
  }

  return (
    <div className={`login-page ${className}`}>
      <div className="login-container">
        <div className="login-content">
          {/* Header section */}
          <div className="login-header">
            <div className="login-logo">
              <svg viewBox="0 0 100 40" className="logo-svg">
                <rect x="0" y="0" width="100" height="40" rx="8" fill="currentColor" />
                <text x="50" y="26" textAnchor="middle" className="logo-text" fill="white">
                  FinDash
                </text>
              </svg>
            </div>
            <h1 className="login-title">Välkommen till FinDash</h1>
            <p className="login-subtitle">
              Modernt bokföringssystem för svenska företag
            </p>
          </div>

          {/* Login form */}
          <div className="login-form-container">
            <LoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={error}
              className="login-form"
            />
          </div>

          {/* Additional information */}
          <div className="login-info">
            <div className="info-section">
              <h3>Demo-applikation</h3>
              <p>
                Detta är en demo-version av FinDash med simulerad data.
                Alla transaktioner och användaruppgifter är genererade för demonstration.
              </p>
            </div>

            <div className="info-section">
              <h3>Funktioner</h3>
              <ul className="feature-list">
                <li>✓ Svenska BAS-kontoplan</li>
                <li>✓ Transaktionsvy med filtrering</li>
                <li>✓ Oändlig rullning (infinite scroll)</li>
                <li>✓ Responsiv design</li>
                <li>✓ Moms-hantering</li>
              </ul>
            </div>

            <div className="info-section">
              <h3>Säkerhet</h3>
              <p className="security-note">
                <svg className="security-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Alla inloggningsuppgifter är simulerade och lagras endast lokalt i din webbläsare.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="login-footer">
            <p className="copyright">
              © 2024 FinDash Demo. Utvecklad för svenska redovisningsstandarder.
            </p>
            <div className="footer-links">
              <button onClick={() => window.open('/help', '_blank')} className="footer-link">
                Hjälp
              </button>
              <button onClick={() => window.open('/about', '_blank')} className="footer-link">
                Om FinDash
              </button>
              <button onClick={() => window.open('/contact', '_blank')} className="footer-link">
                Kontakt
              </button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="login-background">
          <div className="background-pattern">
            <div className="pattern-circle pattern-circle--1"></div>
            <div className="pattern-circle pattern-circle--2"></div>
            <div className="pattern-circle pattern-circle--3"></div>
          </div>
        </div>
      </div>

      {/* Error overlay for critical errors */}
      {error && (
        <div className="error-overlay" role="alert" aria-live="assertive">
          <div className="error-modal">
            <div className="error-header">
              <h2>Inloggningsfel</h2>
              <button
                onClick={clearError}
                className="error-close"
                aria-label="Stäng felmeddelande"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="error-content">
              <p>{error}</p>
              <div className="error-actions">
                <button onClick={clearError} className="primary-button">
                  Försök igen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginPage