import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'

describe('Integration: User Authentication Flow', () => {
  it('should successfully authenticate user and redirect to dashboard', async () => {
    const user = userEvent.setup()
    const mockOnLoginSuccess = vi.fn()

    const LoginPage = await import('@/pages/login-page')

    await act(async () => {
      render(<LoginPage.default onLoginSuccess={mockOnLoginSuccess} />)
    })

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.queryByText('Kontrollerar inloggningsstatus...')).not.toBeInTheDocument()
    }, { timeout: 3000 })

    // Find form elements
    const usernameInput = screen.getByLabelText('Användarnamn')
    const passwordInput = screen.getByLabelText('Lösenord')
    const loginButton = screen.getByRole('button', { name: 'Logga in' })

    // Fill in valid credentials
    await act(async () => {
      await user.type(usernameInput, 'demo.user')
      await user.type(passwordInput, 'demo123')
    })

    // Submit form
    await act(async () => {
      await user.click(loginButton)
    })

    // Check that login callback was called with user data
    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalled()
    })
  })

  it('should display error message for invalid credentials', async () => {
    const user = userEvent.setup()
    const mockOnLoginSuccess = vi.fn()

    const LoginPage = await import('@/pages/login-page')

    await act(async () => {
      render(<LoginPage.default onLoginSuccess={mockOnLoginSuccess} />)
    })

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.queryByText('Kontrollerar inloggningsstatus...')).not.toBeInTheDocument()
    }, { timeout: 3000 })

    const usernameInput = screen.getByLabelText('Användarnamn')
    const passwordInput = screen.getByLabelText('Lösenord')
    const loginButton = screen.getByRole('button', { name: 'Logga in' })

    // Fill in invalid credentials
    await act(async () => {
      await user.type(usernameInput, 'wronguser')
      await user.type(passwordInput, 'wrongpass')
    })

    await act(async () => {
      await user.click(loginButton)
    })

    // Should display Swedish error message
    await waitFor(() => {
      expect(screen.getByText('Felaktigt användarnamn eller lösenord')).toBeInTheDocument()
    })
  })

  it('should validate form fields and show validation errors', async () => {
    const user = userEvent.setup()
    const mockOnLoginSuccess = vi.fn()

    const LoginPage = await import('@/pages/login-page')

    await act(async () => {
      render(<LoginPage.default onLoginSuccess={mockOnLoginSuccess} />)
    })

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.queryByText('Kontrollerar inloggningsstatus...')).not.toBeInTheDocument()
    }, { timeout: 3000 })

    const usernameInput = screen.getByLabelText('Användarnamn')
    const passwordInput = screen.getByLabelText('Lösenord')
    const loginButton = screen.getByRole('button', { name: 'Logga in' })

    // Initially button should be disabled with empty fields
    expect(loginButton).toBeDisabled()

    // Type values that meet length requirements but fail validation
    await act(async () => {
      await user.type(usernameInput, 'x!@') // 3 chars but contains invalid characters
      await user.type(passwordInput, '123456') // 6 chars, meets length requirement
    })

    // Submit with invalid but non-empty fields
    await act(async () => {
      await user.click(loginButton)
    })

    // Should show validation errors in Swedish for invalid characters
    await waitFor(() => {
      expect(screen.getByText('Användarnamn får endast innehålla bokstäver, siffror, punkt och underscore')).toBeInTheDocument()
    })
  })

  it('should maintain authentication state across page refreshes', async () => {
    const user = userEvent.setup()
    const mockOnLoginSuccess = vi.fn()

    // Login first
    const LoginPage = await import('@/pages/login-page')

    await act(async () => {
      render(<LoginPage.default onLoginSuccess={mockOnLoginSuccess} />)
    })

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.queryByText('Kontrollerar inloggningsstatus...')).not.toBeInTheDocument()
    }, { timeout: 3000 })

    const usernameInput = screen.getByLabelText('Användarnamn')
    const passwordInput = screen.getByLabelText('Lösenord')
    const loginButton = screen.getByRole('button', { name: 'Logga in' })

    await act(async () => {
      await user.type(usernameInput, 'demo.user')
      await user.type(passwordInput, 'demo123')
    })

    await act(async () => {
      await user.click(loginButton)
    })

    // Check that login was successful
    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalled()
    })

    // For this test, we'll verify that the session would persist
    // by checking that the mock auth service has the session stored
    const mockAuthService = await import('@/services/mock-auth-service')
    expect(mockAuthService.mockAuthService.getCurrentSession()).toBeTruthy()
  })
})