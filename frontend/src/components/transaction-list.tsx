/**
 * Transaction list component with infinite scroll and Swedish formatting
 * Constitutional compliance: React functional component, TypeScript strict typing, kebab-case filename
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import { Transaction, formatSwedishCurrency, formatSwedishDate } from '@/types/transaction-types'
import { BASClass, getBASClassName } from '@/types/bas-types'

interface TransactionListProps {
  transactions: Transaction[]
  hasNextPage: boolean
  isNextPageLoading: boolean
  loadNextPage: () => Promise<void>
  onTransactionSelect?: (transaction: Transaction) => void
  selectedTransactionId?: string
  className?: string
  height?: number
}

interface TransactionRowProps {
  index: number
  style: React.CSSProperties
  data: {
    transactions: Transaction[]
    hasNextPage: boolean
    isNextPageLoading: boolean
    onTransactionSelect?: (transaction: Transaction) => void
    selectedTransactionId?: string
  }
}

const TransactionRow = ({ index, style, data }: TransactionRowProps) => {
  const { transactions, hasNextPage, isNextPageLoading, onTransactionSelect, selectedTransactionId } = data

  // Handle loading placeholder
  const isItemLoaded = index < transactions.length
  if (!isItemLoaded) {
    return (
      <div style={style} className="transaction-row transaction-row--loading">
        <div className="transaction-loading">
          <div className="loading-skeleton loading-skeleton--date"></div>
          <div className="loading-skeleton loading-skeleton--description"></div>
          <div className="loading-skeleton loading-skeleton--amount"></div>
          <div className="loading-skeleton loading-skeleton--account"></div>
        </div>
      </div>
    )
  }

  const transaction = transactions[index]
  const isSelected = selectedTransactionId === transaction.id
  const isDebit = transaction.debitCredit === 'DEBIT'

  const handleClick = () => {
    onTransactionSelect?.(transaction)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onTransactionSelect?.(transaction)
    }
  }

  return (
    <div
      style={style}
      className={`transaction-row ${isSelected ? 'transaction-row--selected' : ''} ${onTransactionSelect ? 'transaction-row--clickable' : ''}`}
      onClick={onTransactionSelect ? handleClick : undefined}
      onKeyDown={onTransactionSelect ? handleKeyDown : undefined}
      tabIndex={onTransactionSelect ? 0 : undefined}
      role={onTransactionSelect ? 'button' : undefined}
      aria-label={onTransactionSelect ? `Välj transaktion ${transaction.description}` : undefined}
    >
      <div className="transaction-content">
        <div className="transaction-main">
          <div className="transaction-date">
            {formatSwedishDate(transaction.date)}
          </div>

          <div className="transaction-description">
            <div className="transaction-description-primary">
              {transaction.description}
            </div>
            {transaction.reference && (
              <div className="transaction-reference">
                Ref: {transaction.reference}
              </div>
            )}
          </div>

          <div className={`transaction-amount ${isDebit ? 'transaction-amount--debit' : 'transaction-amount--credit'}`}>
            <span className="amount-value">
              {formatSwedishCurrency(transaction.amount)}
            </span>
            <span className="amount-type">
              {isDebit ? 'Debet' : 'Kredit'}
            </span>
          </div>
        </div>

        <div className="transaction-details">
          <div className="transaction-account">
            <span className="account-number">
              {transaction.accountNumber}
            </span>
            <span className="account-name">
              {transaction.account.name}
            </span>
          </div>

          <div className="transaction-bas-class">
            <span className="bas-class-number">
              Klass {transaction.basClass}
            </span>
            <span className="bas-class-name">
              {getBASClassName(transaction.basClass)}
            </span>
          </div>

          {transaction.vatAmount && transaction.vatRate && (
            <div className="transaction-vat">
              <span className="vat-label">Moms:</span>
              <span className="vat-amount">
                {formatSwedishCurrency(transaction.vatAmount)}
              </span>
              <span className="vat-rate">
                ({transaction.vatRate}%)
              </span>
            </div>
          )}
        </div>
      </div>

      {isSelected && (
        <div className="transaction-selection-indicator" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  )
}

export const TransactionList = ({
  transactions,
  hasNextPage,
  isNextPageLoading,
  loadNextPage,
  onTransactionSelect,
  selectedTransactionId,
  className = '',
  height = 600
}: TransactionListProps) => {
  const [listRef, setListRef] = useState<List | null>(null)

  // Calculate item count for infinite loader
  const itemCount = hasNextPage ? transactions.length + 1 : transactions.length

  // Memoized data for row renderer
  const itemData = useMemo(
    () => ({
      transactions,
      hasNextPage,
      isNextPageLoading,
      onTransactionSelect,
      selectedTransactionId
    }),
    [transactions, hasNextPage, isNextPageLoading, onTransactionSelect, selectedTransactionId]
  )

  // Check if item is loaded
  const isItemLoaded = useCallback(
    (index: number) => !hasNextPage || index < transactions.length,
    [hasNextPage, transactions.length]
  )

  // Load more items
  const loadMoreItems = useCallback(
    async (startIndex: number, stopIndex: number) => {
      if (!isNextPageLoading && hasNextPage) {
        await loadNextPage()
      }
    },
    [isNextPageLoading, hasNextPage, loadNextPage]
  )

  // Scroll to selected transaction when it changes
  useEffect(() => {
    if (listRef && selectedTransactionId) {
      const selectedIndex = transactions.findIndex(t => t.id === selectedTransactionId)
      if (selectedIndex >= 0) {
        listRef.scrollToItem(selectedIndex, 'smart')
      }
    }
  }, [listRef, selectedTransactionId, transactions])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!onTransactionSelect || transactions.length === 0) return

      let newIndex = -1
      const currentIndex = selectedTransactionId ? transactions.findIndex(t => t.id === selectedTransactionId) : -1

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          newIndex = currentIndex < transactions.length - 1 ? currentIndex + 1 : currentIndex
          break
        case 'ArrowUp':
          e.preventDefault()
          newIndex = currentIndex > 0 ? currentIndex - 1 : 0
          break
        case 'Home':
          e.preventDefault()
          newIndex = 0
          break
        case 'End':
          e.preventDefault()
          newIndex = transactions.length - 1
          break
      }

      if (newIndex >= 0 && newIndex < transactions.length) {
        onTransactionSelect(transactions[newIndex])
      }
    },
    [onTransactionSelect, transactions, selectedTransactionId]
  )

  if (transactions.length === 0 && !isNextPageLoading) {
    return (
      <div className={`transaction-list transaction-list--empty ${className}`}>
        <div className="empty-state">
          <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3>Inga transaktioner hittades</h3>
          <p>Det finns inga transaktioner som matchar dina sökkriterier.</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`transaction-list ${className}`}
      onKeyDown={handleKeyDown}
      role="grid"
      aria-label="Transaktionslista"
      aria-rowcount={itemCount}
    >
      <div className="transaction-list-header">
        <div className="transaction-count">
          {transactions.length} transaktion{transactions.length !== 1 ? 'er' : ''}
          {hasNextPage && ' (fler laddas...)'}
        </div>
      </div>

      <div className="transaction-list-content">
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={itemCount}
          loadMoreItems={loadMoreItems}
          threshold={10} // Start loading when 10 items from bottom
        >
          {({ onItemsRendered, ref }) => (
            <List
              ref={(list) => {
                setListRef(list)
                ref(list)
              }}
              height={height}
              itemCount={itemCount}
              itemSize={120} // Height of each transaction row
              itemData={itemData}
              onItemsRendered={onItemsRendered}
              overscanCount={5}
            >
              {TransactionRow}
            </List>
          )}
        </InfiniteLoader>
      </div>

      {isNextPageLoading && (
        <div className="transaction-list-loading" aria-live="polite">
          <svg className="loading-spinner" viewBox="0 0 24 24">
            <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
          Laddar fler transaktioner...
        </div>
      )}
    </div>
  )
}

export default TransactionList