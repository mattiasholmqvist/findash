import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Integration: User Authentication Flow', () => {
  it('should successfully authenticate user and redirect to dashboard', async () => {
    const user = userEvent.setup()

    // This test will fail until components are implemented
    const LoginPage = await import('@/pages/login-page')
    const { container } = render(<LoginPage.default />)

    // Find form elements
    const usernameInput = screen.getByLabelText(/användarnamn|username/i)
    const passwordInput = screen.getByLabelText(/lösenord|password/i)
    const loginButton = screen.getByRole('button', { name: /logga in|login/i })

    // Fill in valid credentials
    await user.type(usernameInput, 'demo.user')
    await user.type(passwordInput, 'demo123')

    // Submit form
    await user.click(loginButton)

    // Should redirect to transaction viewer
    await waitFor(() => {
      expect(window.location.pathname).toBe('/transactions')
    })
  })

  it('should display error message for invalid credentials', async () => {
    const user = userEvent.setup()

    const LoginPage = await import('@/pages/login-page')
    render(<LoginPage.default />)

    const usernameInput = screen.getByLabelText(/användarnamn|username/i)
    const passwordInput = screen.getByLabelText(/lösenord|password/i)
    const loginButton = screen.getByRole('button', { name: /logga in|login/i })

    // Fill in invalid credentials
    await user.type(usernameInput, 'wronguser')
    await user.type(passwordInput, 'wrongpass')
    await user.click(loginButton)

    // Should display Swedish error message
    await waitFor(() => {
      expect(screen.getByText('Ogiltiga inloggningsuppgifter')).toBeInTheDocument()
    })
  })

  it('should validate form fields and show validation errors', async () => {
    const user = userEvent.setup()

    const LoginPage = await import('@/pages/login-page')
    render(<LoginPage.default />)

    const loginButton = screen.getByRole('button', { name: /logga in|login/i })

    // Submit without filling fields
    await user.click(loginButton)

    // Should show validation errors in Swedish
    await waitFor(() => {
      expect(screen.getByText(/användarnamn krävs|username required/i)).toBeInTheDocument()
      expect(screen.getByText(/lösenord krävs|password required/i)).toBeInTheDocument()
    })
  })

  it('should maintain authentication state across page refreshes', async () => {
    const user = userEvent.setup()

    // Login first
    const LoginPage = await import('@/pages/login-page')
    render(<LoginPage.default />)

    const usernameInput = screen.getByLabelText(/användarnamn|username/i)
    const passwordInput = screen.getByLabelText(/lösenord|password/i)
    const loginButton = screen.getByRole('button', { name: /logga in|login/i })

    await user.type(usernameInput, 'demo.user')
    await user.type(passwordInput, 'demo123')
    await user.click(loginButton)

    // Wait for login to complete
    await waitFor(() => {
      expect(window.location.pathname).toBe('/transactions')
    })

    // Simulate page refresh by re-rendering the app
    const AppRouter = await import('@/components/routing/app-router')
    render(<AppRouter.default />)

    // Should still be authenticated and show transaction page
    await waitFor(() => {
      expect(screen.queryByLabelText(/användarnamn|username/i)).not.toBeInTheDocument()
    })
  })
})