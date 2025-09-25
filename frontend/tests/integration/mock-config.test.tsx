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

describe('Integration: Mock Data Configuration', () => {
  it('should allow changing dataset size and regenerate data', async () => {
    const user = userEvent.setup()

    // This assumes there's a configuration UI or API
    const { mockConfigService } = await import('@/services/mock-config-service')

    // Change dataset size to small
    await mockConfigService.updateMockConfig({ datasetSize: 50 })

    const TransactionViewerPage = await import('@/pages/transaction-viewer-page')
    const mockOnLogout = vi.fn()
    render(<TransactionViewerPage.default user={mockUser} onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.queryByText(/laddar|loading/i)).not.toBeInTheDocument()
    })

    // Should have limited number of transactions
    const initialRows = screen.getAllByTestId(/transaction-row-/i)
    expect(initialRows.length).toBeLessThanOrEqual(50)

    // Change to larger dataset
    await mockConfigService.updateMockConfig({ datasetSize: 200 })

    // Refresh component
    const { rerender } = render(<TransactionViewerPage.default />)

    await waitFor(() => {
      const moreRows = screen.getAllByTestId(/transaction-row-/i)
      expect(moreRows.length).toBeGreaterThan(initialRows.length)
    })
  })

  it('should support date range configuration', async () => {
    const mockConfigService = await import('@/services/mock-config-service')

    // Configure specific date range
    await mockConfigService.updateMockConfig({
      dateRangeStart: '2024-06-01',
      dateRangeEnd: '2024-06-30'
    })

    const TransactionViewerPage = await import('@/pages/transaction-viewer-page')
    const mockOnLogout = vi.fn()
    render(<TransactionViewerPage.default user={mockUser} onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.queryByText(/laddar|loading/i)).not.toBeInTheDocument()
    })

    // All transactions should be within the specified date range
    const dates = screen.getAllByTestId(/date-/i)
    dates.forEach(dateElement => {
      const dateText = dateElement.textContent || ''
      const transactionDate = new Date(dateText)
      expect(transactionDate.getTime()).toBeGreaterThanOrEqual(new Date('2024-06-01').getTime())
      expect(transactionDate.getTime()).toBeLessThanOrEqual(new Date('2024-06-30').getTime())
    })
  })

  it('should toggle VAT inclusion in generated data', async () => {
    const mockConfigService = await import('@/services/mock-config-service')

    // Enable VAT
    await mockConfigService.updateMockConfig({ includeVAT: true })

    const TransactionViewerPage = await import('@/pages/transaction-viewer-page')
    const mockOnLogout = vi.fn()
    render(<TransactionViewerPage.default user={mockUser} onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.queryByText(/laddar|loading/i)).not.toBeInTheDocument()
    })

    // Should have some transactions with VAT
    const vatIndicators = screen.queryAllByText(/moms|vat/i)
    expect(vatIndicators.length).toBeGreaterThan(0)
  })
})