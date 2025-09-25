import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

describe('Integration: Transaction List Loading', () => {
  it('should load and display transaction list with Swedish formatting', async () => {
    // This test will fail until components are implemented
    const TransactionViewerPage = await import('@/pages/transaction-viewer-page')
    const mockOnLogout = vi.fn()
    render(<TransactionViewerPage.default user={mockUser} onLogout={mockOnLogout} />)

    // Should display loading state initially
    expect(screen.getByText(/laddar|loading/i)).toBeInTheDocument()

    // Should load transactions and display them
    await waitFor(() => {
      expect(screen.queryByText(/laddar|loading/i)).not.toBeInTheDocument()
    }, { timeout: 5000 })

    // Should display transaction table headers in Swedish
    expect(screen.getByText('Datum')).toBeInTheDocument() // Date
    expect(screen.getByText('Beskrivning')).toBeInTheDocument() // Description
    expect(screen.getByText('Belopp')).toBeInTheDocument() // Amount
    expect(screen.getByText('Konto')).toBeInTheDocument() // Account
    expect(screen.getByText('BAS-klass')).toBeInTheDocument() // BAS Class

    // Should display at least 10 transactions
    const transactionRows = screen.getAllByTestId(/transaction-row-/i)
    expect(transactionRows.length).toBeGreaterThanOrEqual(10)
  })

  it('should format Swedish currency correctly', async () => {
    const TransactionViewerPage = await import('@/pages/transaction-viewer-page')
    const mockOnLogout = vi.fn()
    render(<TransactionViewerPage.default user={mockUser} onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.queryByText(/laddar|loading/i)).not.toBeInTheDocument()
    })

    // Find currency amounts - should use Swedish formatting
    const amounts = screen.getAllByTestId(/amount-/i)
    expect(amounts.length).toBeGreaterThan(0)

    amounts.forEach(amount => {
      const text = amount.textContent || ''
      // Swedish currency format: "1 000,00 kr" or "1000,00 kr"
      expect(text).toMatch(/^\d{1,3}(\s\d{3})*,\d{2}\s*kr$/i)
    })
  })

  it('should format dates in Swedish format (YYYY-MM-DD)', async () => {
    const TransactionViewerPage = await import('@/pages/transaction-viewer-page')
    const mockOnLogout = vi.fn()
    render(<TransactionViewerPage.default user={mockUser} onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.queryByText(/laddar|loading/i)).not.toBeInTheDocument()
    })

    // Find date fields - should use Swedish format
    const dates = screen.getAllByTestId(/date-/i)
    expect(dates.length).toBeGreaterThan(0)

    dates.forEach(dateElement => {
      const text = dateElement.textContent || ''
      // Swedish date format: YYYY-MM-DD
      expect(text).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  it('should display BAS class categories in Swedish', async () => {
    const TransactionViewerPage = await import('@/pages/transaction-viewer-page')
    const mockOnLogout = vi.fn()
    render(<TransactionViewerPage.default user={mockUser} onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.queryByText(/laddar|loading/i)).not.toBeInTheDocument()
    })

    // Should show Swedish BAS class names
    const swedishBASTerms = [
      'Tillgångar', // Assets
      'Skulder', // Liabilities
      'Eget kapital', // Equity
      'Intäkter', // Revenue
      'Kostnad för sålda varor', // Cost of Sales
      'Rörelsekostnader', // Operating Expenses
      'Finansiella poster', // Financial Items
      'Extraordinära poster' // Extraordinary Items
    ]

    // At least some Swedish BAS terms should be present
    let foundSwedishTerms = 0
    swedishBASTerms.forEach(term => {
      if (screen.queryByText(new RegExp(term, 'i'))) {
        foundSwedishTerms++
      }
    })

    expect(foundSwedishTerms).toBeGreaterThanOrEqual(3)
  })

  it('should handle empty state gracefully', async () => {
    // Mock empty data
    const { mockConfigService } = await import('@/services/mock-config-service')
    await mockConfigService.updateMockConfig({ datasetSize: 0 })

    const TransactionViewerPage = await import('@/pages/transaction-viewer-page')
    const mockOnLogout = vi.fn()
    render(<TransactionViewerPage.default user={mockUser} onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.getByText('Inga transaktioner att visa')).toBeInTheDocument()
    })
  })

  it('should complete initial load within 300ms performance target', async () => {
    const startTime = performance.now()

    const TransactionViewerPage = await import('@/pages/transaction-viewer-page')
    const mockOnLogout = vi.fn()
    render(<TransactionViewerPage.default user={mockUser} onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.queryByText(/laddar|loading/i)).not.toBeInTheDocument()
    })

    const endTime = performance.now()
    const loadTime = endTime - startTime

    expect(loadTime).toBeLessThan(300)
  })
})