/**
 * Transaction viewer page component
 * Constitutional compliance: React functional component, TypeScript strict typing, kebab-case filename
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Transaction } from '@/types/transaction-types'
import { Account } from '@/types/account-types'
import { User } from '@/types/user-types'
import { GetTransactionsParams } from '@/types/api-types'
import { TransactionList } from '@/components/transaction-list'
import { TransactionFilter } from '@/components/transaction-filter'
import { HeaderNavigation } from '@/components/header-navigation'
import { LoadingOverlay, TransactionListSkeleton, InlineLoading } from '@/components/loading-states'
import { TransactionListErrorBoundary } from '@/components/error-boundary'
import { TransactionSummaryFormatter } from '@/components/formatters'
import { mockTransactionApiService } from '@/services/mock-transaction-api-service'
import { mockAccountApiService } from '@/services/mock-account-api-service'

interface TransactionViewerPageProps {
  user: User
  onLogout: () => void
  className?: string
}

interface PageState {
  transactions: Transaction[]
  accounts: Account[]
  selectedTransaction: Transaction | null
  filters: GetTransactionsParams
  pagination: {
    currentPage: number
    hasNextPage: boolean
    isLoading: boolean
    totalCount: number
  }
  summary: {
    totalAmount: number
    debitTotal: number
    creditTotal: number
    transactionCount: number
  }
  isInitialLoading: boolean
  error: string | null
}

export const TransactionViewerPage = ({ user, onLogout, className = '' }: TransactionViewerPageProps) => {
  const [state, setState] = useState<PageState>({
    transactions: [],
    accounts: [],
    selectedTransaction: null,
    filters: {},
    pagination: {
      currentPage: 0,
      hasNextPage: false,
      isLoading: false,
      totalCount: 0
    },
    summary: {
      totalAmount: 0,
      debitTotal: 0,
      creditTotal: 0,
      transactionCount: 0
    },
    isInitialLoading: true,
    error: null
  })

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setState(prev => ({ ...prev, isInitialLoading: true, error: null }))

        // Load accounts first
        const accountsResponse = await mockAccountApiService.getAccounts()
        if (!accountsResponse.success) {
          throw new Error(accountsResponse.error?.message || 'Failed to load accounts')
        }

        // Load initial transactions
        const transactionsResponse = await mockTransactionApiService.getTransactions({
          page: 0,
          size: 50
        })

        if (!transactionsResponse.success) {
          throw new Error(transactionsResponse.error?.message || 'Failed to load transactions')
        }

        const { transactions, pagination, summary } = transactionsResponse.data!

        setState(prev => ({
          ...prev,
          accounts: accountsResponse.data!.accounts,
          transactions,
          pagination: {
            currentPage: pagination.currentPage,
            hasNextPage: pagination.hasNext,
            isLoading: false,
            totalCount: pagination.totalCount
          },
          summary,
          isInitialLoading: false
        }))
      } catch (error) {
        console.error('Failed to load initial data:', error)
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Ett oväntat fel uppstod vid laddning av data',
          isInitialLoading: false
        }))
      }
    }

    loadInitialData()
  }, [])

  // Load more transactions (infinite scroll)
  const loadMoreTransactions = useCallback(async () => {
    if (state.pagination.isLoading || !state.pagination.hasNextPage) {
      return
    }

    try {
      setState(prev => ({
        ...prev,
        pagination: { ...prev.pagination, isLoading: true }
      }))

      const response = await mockTransactionApiService.getTransactions({
        ...state.filters,
        page: state.pagination.currentPage + 1,
        size: 50
      })

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to load more transactions')
      }

      const { transactions: newTransactions, pagination } = response.data!

      setState(prev => ({
        ...prev,
        transactions: [...prev.transactions, ...newTransactions],
        pagination: {
          currentPage: pagination.currentPage,
          hasNextPage: pagination.hasNext,
          isLoading: false,
          totalCount: pagination.totalCount
        }
      }))
    } catch (error) {
      console.error('Failed to load more transactions:', error)
      setState(prev => ({
        ...prev,
        pagination: { ...prev.pagination, isLoading: false },
        error: error instanceof Error ? error.message : 'Kunde inte ladda fler transaktioner'
      }))
    }
  }, [state.filters, state.pagination.currentPage, state.pagination.isLoading, state.pagination.hasNextPage])

  // Apply filters
  const handleFilterChange = useCallback(async (newFilters: GetTransactionsParams) => {
    try {
      setState(prev => ({
        ...prev,
        filters: newFilters,
        pagination: { ...prev.pagination, isLoading: true },
        error: null
      }))

      const response = await mockTransactionApiService.getTransactions({
        ...newFilters,
        page: 0,
        size: 50
      })

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to filter transactions')
      }

      const { transactions, pagination, summary } = response.data!

      setState(prev => ({
        ...prev,
        transactions,
        pagination: {
          currentPage: pagination.currentPage,
          hasNextPage: pagination.hasNext,
          isLoading: false,
          totalCount: pagination.totalCount
        },
        summary,
        selectedTransaction: null // Clear selection when filters change
      }))
    } catch (error) {
      console.error('Failed to apply filters:', error)
      setState(prev => ({
        ...prev,
        pagination: { ...prev.pagination, isLoading: false },
        error: error instanceof Error ? error.message : 'Kunde inte tillämpa filter'
      }))
    }
  }, [])

  // Select transaction
  const handleTransactionSelect = useCallback((transaction: Transaction) => {
    setState(prev => ({
      ...prev,
      selectedTransaction: prev.selectedTransaction?.id === transaction.id ? null : transaction
    }))
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Memoized values
  const hasActiveFilters = useMemo(() => {
    return Object.values(state.filters).some(value => value !== undefined && value !== '')
  }, [state.filters])

  const pageTitle = useMemo(() => {
    if (hasActiveFilters) {
      return `Transaktioner (${state.pagination.totalCount} filtrerade)`
    }
    return `Transaktioner (${state.pagination.totalCount} totalt)`
  }, [hasActiveFilters, state.pagination.totalCount])

  if (state.isInitialLoading) {
    return (
      <div className="transaction-viewer-page transaction-viewer-page--loading">
        <HeaderNavigation user={user} onLogout={onLogout} />
        <div className="page-content">
          <div className="page-header">
            <h1>Laddar transaktioner...</h1>
          </div>
          <TransactionListSkeleton count={10} />
        </div>
      </div>
    )
  }

  return (
    <div className={`transaction-viewer-page ${className}`}>
      <HeaderNavigation user={user} onLogout={onLogout} />

      <main className="page-content" role="main">
        {/* Page header */}
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">{pageTitle}</h1>
            <p className="page-subtitle">
              Visa och filtrera bokföringstransaktioner enligt svensk BAS-standard
            </p>
          </div>

          {state.summary.transactionCount > 0 && (
            <div className="page-summary">
              <TransactionSummaryFormatter
                totalAmount={state.summary.totalAmount}
                debitTotal={state.summary.debitTotal}
                creditTotal={state.summary.creditTotal}
                transactionCount={state.summary.transactionCount}
                className="summary-card"
              />
            </div>
          )}
        </div>

        {/* Error display */}
        {state.error && (
          <div className="page-error" role="alert">
            <div className="error-content">
              <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="error-message">
                <h3>Fel vid laddning av data</h3>
                <p>{state.error}</p>
                <button onClick={clearError} className="error-dismiss">
                  Stäng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter section */}
        <div className="page-filters">
          <TransactionFilter
            onFilterChange={handleFilterChange}
            accounts={state.accounts}
            initialFilters={state.filters}
            isLoading={state.pagination.isLoading}
            className="filters-card"
          />
        </div>

        {/* Transaction list section */}
        <div className="page-transactions">
          <TransactionListErrorBoundary>
            <LoadingOverlay
              isLoading={state.pagination.isLoading && state.transactions.length === 0}
              message="Laddar transaktioner..."
            >
              {state.transactions.length > 0 ? (
                <TransactionList
                  transactions={state.transactions}
                  hasNextPage={state.pagination.hasNextPage}
                  isNextPageLoading={state.pagination.isLoading}
                  loadNextPage={loadMoreTransactions}
                  onTransactionSelect={handleTransactionSelect}
                  selectedTransactionId={state.selectedTransaction?.id}
                  className="transaction-list-card"
                  height={600}
                />
              ) : !state.pagination.isLoading ? (
                <div className="empty-transactions">
                  <div className="empty-state">
                    <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3>Inga transaktioner hittades</h3>
                    <p>
                      {hasActiveFilters
                        ? 'Inga transaktioner matchar dina sökkriterier. Prova att ändra filtren.'
                        : 'Inga transaktioner finns tillgängliga för tillfället.'
                      }
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={() => handleFilterChange({})}
                        className="clear-filters-button"
                      >
                        Rensa alla filter
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </LoadingOverlay>
          </TransactionListErrorBoundary>

          {/* Loading indicator for infinite scroll */}
          {state.pagination.isLoading && state.transactions.length > 0 && (
            <div className="load-more-indicator">
              <InlineLoading message="Laddar fler transaktioner..." />
            </div>
          )}
        </div>

        {/* Selected transaction details */}
        {state.selectedTransaction && (
          <div className="transaction-details-panel">
            <div className="details-header">
              <h3>Transaktionsdetaljer</h3>
              <button
                onClick={() => setState(prev => ({ ...prev, selectedTransaction: null }))}
                className="close-details"
                aria-label="Stäng detaljer"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="details-content">
              <div className="detail-row">
                <span className="detail-label">ID:</span>
                <span className="detail-value">{state.selectedTransaction.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Datum:</span>
                <span className="detail-value">{state.selectedTransaction.date}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Beskrivning:</span>
                <span className="detail-value">{state.selectedTransaction.description}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Konto:</span>
                <span className="detail-value">
                  {state.selectedTransaction.accountNumber} - {state.selectedTransaction.account?.name}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Referens:</span>
                <span className="detail-value">{state.selectedTransaction.reference || 'Ingen'}</span>
              </div>
              {state.selectedTransaction.vatAmount && (
                <div className="detail-row">
                  <span className="detail-label">Moms:</span>
                  <span className="detail-value">
                    {(state.selectedTransaction.vatAmount / 100).toFixed(2)} SEK ({state.selectedTransaction.vatRate}%)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default TransactionViewerPage