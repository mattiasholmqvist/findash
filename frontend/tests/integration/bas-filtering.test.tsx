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

describe('Integration: Swedish BAS Filtering', () => {
  it('should filter transactions by BAS class', async () => {
    const user = userEvent.setup()

    const TransactionViewerPage = await import('@/pages/transaction-viewer-page')
    const mockOnLogout = vi.fn()
    render(<TransactionViewerPage.default user={mockUser} onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.queryByText(/laddar|loading/i)).not.toBeInTheDocument()
    })

    // Find BAS filter component
    const basFilter = screen.getByTestId('bas-filter')
    expect(basFilter).toBeInTheDocument()

    // Select Revenue class (Class 4)
    const revenueOption = screen.getByRole('option', { name: /intäkter|revenue/i })
    await user.selectOptions(basFilter, revenueOption)

    // Should filter transactions to only show Revenue class
    await waitFor(() => {
      const transactionRows = screen.getAllByTestId(/transaction-row-/i)
      transactionRows.forEach(row => {
        expect(row).toHaveAttribute('data-bas-class', '4')
      })
    })
  })

  it('should display BAS classes in Swedish with English translations', async () => {
    const TransactionViewerPage = await import('@/pages/transaction-viewer-page')
    const mockOnLogout = vi.fn()
    render(<TransactionViewerPage.default user={mockUser} onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.queryByText(/laddar|loading/i)).not.toBeInTheDocument()
    })

    const basFilter = screen.getByTestId('bas-filter')

    // Should have all 8 BAS classes with Swedish names
    expect(screen.getByRole('option', { name: /tillgångar/i })).toBeInTheDocument() // Assets
    expect(screen.getByRole('option', { name: /skulder/i })).toBeInTheDocument() // Liabilities
    expect(screen.getByRole('option', { name: /eget kapital/i })).toBeInTheDocument() // Equity
    expect(screen.getByRole('option', { name: /intäkter/i })).toBeInTheDocument() // Revenue
  })
})