/**
 * Login form component with Swedish localization
 * Constitutional compliance: React functional component, TypeScript strict typing, kebab-case filename
 */

import { useState, FormEvent } from 'react'
import { LoginRequest, validateLoginRequest } from '@/types/user-types'
import { ApiResponse, LoginApiResponse } from '@/types/api-types'

interface LoginFormProps {
  onSubmit: (request: LoginRequest) => Promise<ApiResponse<LoginApiResponse>>
  isLoading?: boolean
  error?: string | null
  className?: string
}

interface LoginFormState {
  username: string
  password: string
  errors: Record<string, string>
  showPassword: boolean
}

export const LoginForm = ({ onSubmit, isLoading = false, error, className = '' }: LoginFormProps) => {
  const [state, setState] = useState<LoginFormState>({
    username: '',
    password: '',
    errors: {},
    showPassword: false
  })

  const updateField = (field: keyof Omit<LoginFormState, 'errors' | 'showPassword'>, value: string) => {
    setState(prev => ({
      ...prev,
      [field]: value,
      errors: { ...prev.errors, [field]: '' } // Clear field error when user types
    }))
  }

  const togglePasswordVisibility = () => {
    setState(prev => ({ ...prev, showPassword: !prev.showPassword }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const request: LoginRequest = {
      username: state.username.trim(),
      password: state.password
    }

    // Client-side validation
    const validationErrors = validateLoginRequest(request)
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {}
      validationErrors.forEach(error => {
        if (error.includes('Användarnamn')) {
          errorMap.username = error
        } else if (error.includes('Lösenord')) {
          errorMap.password = error
        }
      })

      setState(prev => ({ ...prev, errors: errorMap }))
      return
    }

    // Clear any existing errors
    setState(prev => ({ ...prev, errors: {} }))

    try {
      await onSubmit(request)
    } catch (submitError) {
      // Error handling is done by parent component
      console.error('Login submission error:', submitError)
    }
  }

  const hasErrors = Object.keys(state.errors).length > 0
  const isFormValid = state.username.length >= 3 && state.password.length >= 6

  return (
    <form onSubmit={handleSubmit} className={`login-form ${className}`} noValidate>
      <div className="form-header">
        <h1>Logga in</h1>
        <p className="form-description">
          Använd dina inloggningsuppgifter för att komma åt FinDash
        </p>
      </div>

      {error && (
        <div className="error-banner" role="alert" aria-live="polite">
          <svg className="error-icon" aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <div className="form-fields">
        <div className="form-field">
          <label htmlFor="username" className="form-label">
            Användarnamn
          </label>
          <input
            id="username"
            type="text"
            value={state.username}
            onChange={(e) => updateField('username', e.target.value)}
            className={`form-input ${state.errors.username ? 'form-input--error' : ''}`}
            placeholder="Ange användarnamn"
            autoComplete="username"
            disabled={isLoading}
            aria-invalid={!!state.errors.username}
            aria-describedby={state.errors.username ? 'username-error' : undefined}
          />
          {state.errors.username && (
            <div id="username-error" className="form-error" role="alert">
              {state.errors.username}
            </div>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="password" className="form-label">
            Lösenord
          </label>
          <div className="password-input-container">
            <input
              id="password"
              type={state.showPassword ? 'text' : 'password'}
              value={state.password}
              onChange={(e) => updateField('password', e.target.value)}
              className={`form-input ${state.errors.password ? 'form-input--error' : ''}`}
              placeholder="Ange lösenord"
              autoComplete="current-password"
              disabled={isLoading}
              aria-invalid={!!state.errors.password}
              aria-describedby={state.errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              disabled={isLoading}
              aria-label={state.showPassword ? 'Dölj lösenord' : 'Visa lösenord'}
            >
              <svg className="password-toggle-icon" viewBox="0 0 20 20" fill="currentColor">
                {state.showPassword ? (
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                ) : (
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                )}
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          {state.errors.password && (
            <div id="password-error" className="form-error" role="alert">
              {state.errors.password}
            </div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className={`login-button ${!isFormValid || isLoading ? 'login-button--disabled' : ''}`}
          disabled={!isFormValid || isLoading}
          aria-describedby="login-button-status"
        >
          {isLoading ? (
            <>
              <svg className="loading-spinner" viewBox="0 0 24 24">
                <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
              Loggar in...
            </>
          ) : (
            'Logga in'
          )}
        </button>
      </div>

      <div className="form-footer">
        <div className="test-credentials">
          <details>
            <summary>Testinloggningar</summary>
            <div className="test-accounts">
              <div className="test-account">
                <strong>Redovisningsassistent:</strong>
                <br />
                Användarnamn: <code>demo.user</code>
                <br />
                Lösenord: <code>demo123</code>
              </div>
              <div className="test-account">
                <strong>Controller:</strong>
                <br />
                Användarnamn: <code>test.controller</code>
                <br />
                Lösenord: <code>demo123</code>
              </div>
              <div className="test-account">
                <strong>Läsare:</strong>
                <br />
                Användarnamn: <code>viewer.test</code>
                <br />
                Lösenord: <code>demo123</code>
              </div>
            </div>
          </details>
        </div>
      </div>

      <div id="login-button-status" className="sr-only" aria-live="polite">
        {isLoading ? 'Inloggning pågår' : hasErrors ? 'Formuläret innehåller fel' : 'Redo att logga in'}
      </div>
    </form>
  )
}

export default LoginForm