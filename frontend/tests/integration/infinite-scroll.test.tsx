import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('Integration: Infinite Scroll Pagination', () => {
  it('should load more transactions when scrolling to bottom', async () => {
    const user = userEvent.setup()

    const TransactionViewerPage = await import('@/pages/transaction-viewer-page')
    const mockOnLogout = vi.fn()
    const { container } = render(<TransactionViewerPage.default user={mockUser} onLogout={mockOnLogout} />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText(/laddar|loading/i)).not.toBeInTheDocument()
    })

    // Get initial transaction count
    const initialRows = screen.getAllByTestId(/transaction-row-/i)
    const initialCount = initialRows.length

    // Find scrollable container
    const scrollContainer = container.querySelector('[data-testid="transaction-list-container"]')
    expect(scrollContainer).toBeInTheDocument()

    // Scroll to bottom
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }

    // Should trigger loading more data
    await waitFor(() => {
      const newRows = screen.getAllByTestId(/transaction-row-/i)
      expect(newRows.length).toBeGreaterThan(initialCount)
    }, { timeout: 1000 })
  })

  it('should maintain performance under 300ms for scroll-triggered loads', async () => {
    const TransactionViewerPage = await import('@/pages/transaction-viewer-page')
    const mockOnLogout = vi.fn()
    const { container } = render(<TransactionViewerPage.default user={mockUser} onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.queryByText(/laddar|loading/i)).not.toBeInTheDocument()
    })

    const scrollContainer = container.querySelector('[data-testid="transaction-list-container"]')

    const startTime = performance.now()

    // Trigger scroll load
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }

    // Wait for new data to load
    await waitFor(() => {
      const loadingIndicator = screen.queryByTestId('loading-more-indicator')
      return !loadingIndicator
    }, { timeout: 1000 })

    const endTime = performance.now()
    const scrollLoadTime = endTime - startTime

    expect(scrollLoadTime).toBeLessThan(300)
  })

  it('should handle large datasets efficiently with virtualization', async () => {
    // Configure large dataset
    const { mockConfigService } = await import('@/services/mock-config-service')
    await mockConfigService.updateMockConfig({ datasetSize: 2000 })

    const TransactionViewerPage = await import('@/pages/transaction-viewer-page')
    const mockOnLogout = vi.fn()
    render(<TransactionViewerPage.default user={mockUser} onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.queryByText(/laddar|loading/i)).not.toBeInTheDocument()
    })

    // Should only render visible items (virtualization)
    const renderedRows = screen.getAllByTestId(/transaction-row-/i)
    expect(renderedRows.length).toBeLessThan(100) // Should not render all 2000 items
    expect(renderedRows.length).toBeGreaterThan(10) // But should render visible ones
  })
})