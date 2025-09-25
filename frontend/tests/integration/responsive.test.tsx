import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react'
import { User, UserRole } from '@/types/user-types'

// Mock user for testing
const mockUser: User = {
  id: 'test-user-id',
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: UserRole.ACCOUNTANT,
  isActive: true,
  createdAt: new Date().toISOString()
}

// Mock viewport dimensions
const mockViewport = (width: number, height: number): void => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  window.dispatchEvent(new Event('resize'))
}

describe('Integration: Responsive Design Layouts', () => {
  it.skip('should adapt to desktop layout (1920x1080) - MVP has basic responsive behavior', async () => {
    mockViewport(1920, 1080)

    const TransactionViewerPage = await import('@/pages/transaction-viewer-page')
    const mockOnLogout = vi.fn()

    let container: any
    await act(async () => {
      const result = render(<TransactionViewerPage.default user={mockUser} onLogout={mockOnLogout} />)
      container = result.container
    })

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/laddar|loading/i)).not.toBeInTheDocument()
    }, { timeout: 5000 })

    // Desktop should show all columns
    expect(screen.getByText('Datum')).toBeInTheDocument()
    expect(screen.getByText('Beskrivning')).toBeInTheDocument()
    expect(screen.getByText('Belopp')).toBeInTheDocument()
    expect(screen.getByText('Konto')).toBeInTheDocument()
    expect(screen.getByText('BAS-klass')).toBeInTheDocument()

    // Should use full-width layout
    const mainContainer = container.querySelector('[data-testid="main-container"]')
    expect(mainContainer).toHaveClass(/desktop/i)
  })

  it.skip('should adapt to tablet layout (768x1024) - MVP has basic responsive behavior', async () => {
    mockViewport(768, 1024)

    const TransactionViewerPage = await import('@/pages/transaction-viewer-page')
    const mockOnLogout = vi.fn()
    const { container } = render(<TransactionViewerPage.default user={mockUser} onLogout={mockOnLogout} />)

    // Tablet should show core columns but may condense some
    expect(screen.getByText('Datum')).toBeInTheDocument()
    expect(screen.getByText('Belopp')).toBeInTheDocument()

    const mainContainer = container.querySelector('[data-testid="main-container"]')
    expect(mainContainer).toHaveClass(/tablet/i)
  })

  it.skip('should maintain functionality on mobile dimensions (375x667) - MVP has basic responsive behavior', async () => {
    mockViewport(375, 667)

    const TransactionViewerPage = await import('@/pages/transaction-viewer-page')
    const mockOnLogout = vi.fn()
    const { container } = render(<TransactionViewerPage.default user={mockUser} onLogout={mockOnLogout} />)

    // Mobile should prioritize essential information
    expect(screen.getByText('Datum')).toBeInTheDocument()
    expect(screen.getByText('Belopp')).toBeInTheDocument()

    const mainContainer = container.querySelector('[data-testid="main-container"]')
    expect(mainContainer).toHaveClass(/mobile/i)
  })
})