/**
 * Transaction filter component with Swedish BAS compliance
 * Constitutional compliance: React functional component, TypeScript strict typing, kebab-case filename
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { BASClass, BAS_CLASS_INFO, getBASClassName } from '@/types/bas-types'
import { Account } from '@/types/account-types'
import { GetTransactionsParams } from '@/types/api-types'

interface TransactionFilterProps {
  onFilterChange: (filters: GetTransactionsParams) => void
  accounts: Account[]
  initialFilters?: GetTransactionsParams
  className?: string
  isLoading?: boolean
}

interface FilterState {
  dateFrom: string
  dateTo: string
  basClass: string
  accountId: string
  search: string
  debitCredit: string
  minAmount: string
  maxAmount: string
}

const DEBIT_CREDIT_OPTIONS = [
  { value: '', label: 'Alla' },
  { value: 'DEBIT', label: 'Debet' },
  { value: 'CREDIT', label: 'Kredit' }
]

export const TransactionFilter = ({
  onFilterChange,
  accounts,
  initialFilters = {},
  className = '',
  isLoading = false
}: TransactionFilterProps) => {
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: initialFilters.dateFrom || '',
    dateTo: initialFilters.dateTo || '',
    basClass: initialFilters.basClass?.toString() || '',
    accountId: initialFilters.accountId || '',
    search: initialFilters.search || '',
    debitCredit: initialFilters.debitCredit || '',
    minAmount: initialFilters.minAmount?.toString() || '',
    maxAmount: initialFilters.maxAmount?.toString() || ''
  })

  const [isExpanded, setIsExpanded] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // BAS class options
  const basClassOptions = useMemo(() => [
    { value: '', label: 'Alla klasser' },
    ...Object.entries(BAS_CLASS_INFO).map(([key, info]) => ({
      value: key,
      label: `${key}. ${info.swedishName}`
    }))
  ], [])

  // Account options grouped by BAS class
  const accountOptions = useMemo(() => {
    const grouped: Record<string, Account[]> = {}
    accounts.forEach(account => {
      const className = getBASClassName(account.basClass)
      if (!grouped[className]) {
        grouped[className] = []
      }
      grouped[className].push(account)
    })

    // Sort accounts within each group by account number
    Object.values(grouped).forEach(accountsGroup => {
      accountsGroup.sort((a, b) => a.accountNumber.localeCompare(b.accountNumber))
    })

    return grouped
  }, [accounts])

  // Validate filters and convert to API format
  const validateAndConvertFilters = useCallback((filterState: FilterState): GetTransactionsParams | null => {
    const newErrors: Record<string, string> = {}
    const apiFilters: GetTransactionsParams = {}

    // Date validation
    if (filterState.dateFrom) {
      const dateFrom = new Date(filterState.dateFrom)
      if (isNaN(dateFrom.getTime())) {
        newErrors.dateFrom = 'Ogiltigt datumformat'
      } else {
        apiFilters.dateFrom = filterState.dateFrom
      }
    }

    if (filterState.dateTo) {
      const dateTo = new Date(filterState.dateTo)
      if (isNaN(dateTo.getTime())) {
        newErrors.dateTo = 'Ogiltigt datumformat'
      } else {
        apiFilters.dateTo = filterState.dateTo
      }
    }

    // Date range validation
    if (apiFilters.dateFrom && apiFilters.dateTo) {
      const fromDate = new Date(apiFilters.dateFrom)
      const toDate = new Date(apiFilters.dateTo)
      if (fromDate > toDate) {
        newErrors.dateRange = 'Från-datum kan inte vara senare än till-datum'
      }
    }

    // BAS class validation
    if (filterState.basClass) {
      const basClass = parseInt(filterState.basClass)
      if (isNaN(basClass) || basClass < 1 || basClass > 8) {
        newErrors.basClass = 'Ogiltigt BAS-klass (1-8)'
      } else {
        apiFilters.basClass = basClass
      }
    }

    // Account ID validation
    if (filterState.accountId) {
      apiFilters.accountId = filterState.accountId
    }

    // Search validation
    if (filterState.search) {
      if (filterState.search.length > 100) {
        newErrors.search = 'Söktext kan inte vara längre än 100 tecken'
      } else {
        apiFilters.search = filterState.search.trim()
      }
    }

    // Debit/Credit validation
    if (filterState.debitCredit) {
      if (!['DEBIT', 'CREDIT'].includes(filterState.debitCredit)) {
        newErrors.debitCredit = 'Ogiltigt val för debet/kredit'
      } else {
        apiFilters.debitCredit = filterState.debitCredit as 'DEBIT' | 'CREDIT'
      }
    }

    // Amount validation
    if (filterState.minAmount) {
      const minAmount = parseFloat(filterState.minAmount) * 100 // Convert to öre
      if (isNaN(minAmount) || minAmount < 0) {
        newErrors.minAmount = 'Ogiltigt belopp'
      } else {
        apiFilters.minAmount = Math.round(minAmount)
      }
    }

    if (filterState.maxAmount) {
      const maxAmount = parseFloat(filterState.maxAmount) * 100 // Convert to öre
      if (isNaN(maxAmount) || maxAmount < 0) {
        newErrors.maxAmount = 'Ogiltigt belopp'
      } else {
        apiFilters.maxAmount = Math.round(maxAmount)
      }
    }

    // Amount range validation
    if (apiFilters.minAmount && apiFilters.maxAmount && apiFilters.minAmount > apiFilters.maxAmount) {
      newErrors.amountRange = 'Minbelopp kan inte vara större än maxbelopp'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return null
    }

    return apiFilters
  }, [])

  // Handle filter change
  const handleFilterChange = useCallback((field: keyof FilterState, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [field]: value }

      // Clear related errors
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors }
        delete newErrors[field]
        if (field === 'dateFrom' || field === 'dateTo') {
          delete newErrors.dateRange
        }
        if (field === 'minAmount' || field === 'maxAmount') {
          delete newErrors.amountRange
        }
        return newErrors
      })

      return newFilters
    })
  }, [])

  // Apply filters with validation
  const applyFilters = useCallback(() => {
    const apiFilters = validateAndConvertFilters(filters)
    if (apiFilters !== null) {
      onFilterChange(apiFilters)
    }
  }, [filters, validateAndConvertFilters, onFilterChange])

  // Reset filters
  const resetFilters = useCallback(() => {
    const emptyFilters: FilterState = {
      dateFrom: '',
      dateTo: '',
      basClass: '',
      accountId: '',
      search: '',
      debitCredit: '',
      minAmount: '',
      maxAmount: ''
    }
    setFilters(emptyFilters)
    setErrors({})
    onFilterChange({})
  }, [onFilterChange])

  // Auto-apply filters when search changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.search !== initialFilters.search) {
        applyFilters()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [filters.search, initialFilters.search, applyFilters])

  const hasActiveFilters = Object.values(filters).some(value => value !== '')
  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className={`transaction-filter ${className}`}>
      <div className="filter-header">
        <button
          type="button"
          className={`filter-toggle ${isExpanded ? 'filter-toggle--expanded' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="filter-panel"
        >
          <svg className="filter-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          Filtrera transaktioner
          {hasActiveFilters && (
            <span className="active-filter-count">
              ({Object.values(filters).filter(v => v !== '').length})
            </span>
          )}
          <svg className="expand-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            className="reset-filters"
            onClick={resetFilters}
            disabled={isLoading}
          >
            Rensa filter
          </button>
        )}
      </div>

      <div
        id="filter-panel"
        className={`filter-panel ${isExpanded ? 'filter-panel--expanded' : ''}`}
        role="region"
        aria-label="Filterinställningar"
      >
        {/* Quick search */}
        <div className="filter-section">
          <div className="filter-field">
            <label htmlFor="search" className="filter-label">
              Sök i beskrivning
            </label>
            <input
              id="search"
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className={`filter-input ${errors.search ? 'filter-input--error' : ''}`}
              placeholder="Sök efter text i transaktioner..."
              disabled={isLoading}
              aria-describedby={errors.search ? 'search-error' : undefined}
            />
            {errors.search && (
              <div id="search-error" className="filter-error">
                {errors.search}
              </div>
            )}
          </div>
        </div>

        {/* Date range */}
        <div className="filter-section">
          <h3 className="filter-section-title">Datumperiod</h3>
          <div className="filter-row">
            <div className="filter-field">
              <label htmlFor="dateFrom" className="filter-label">
                Från datum
              </label>
              <input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className={`filter-input ${errors.dateFrom || errors.dateRange ? 'filter-input--error' : ''}`}
                disabled={isLoading}
              />
              {errors.dateFrom && (
                <div className="filter-error">{errors.dateFrom}</div>
              )}
            </div>
            <div className="filter-field">
              <label htmlFor="dateTo" className="filter-label">
                Till datum
              </label>
              <input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className={`filter-input ${errors.dateTo || errors.dateRange ? 'filter-input--error' : ''}`}
                disabled={isLoading}
              />
              {errors.dateTo && (
                <div className="filter-error">{errors.dateTo}</div>
              )}
            </div>
          </div>
          {errors.dateRange && (
            <div className="filter-error">{errors.dateRange}</div>
          )}
        </div>

        {/* BAS class and account */}
        <div className="filter-section">
          <h3 className="filter-section-title">Konto och klassificering</h3>
          <div className="filter-row">
            <div className="filter-field">
              <label htmlFor="basClass" className="filter-label">
                BAS-klass
              </label>
              <select
                id="basClass"
                value={filters.basClass}
                onChange={(e) => handleFilterChange('basClass', e.target.value)}
                className={`filter-select ${errors.basClass ? 'filter-select--error' : ''}`}
                disabled={isLoading}
              >
                {basClassOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.basClass && (
                <div className="filter-error">{errors.basClass}</div>
              )}
            </div>
            <div className="filter-field">
              <label htmlFor="accountId" className="filter-label">
                Konto
              </label>
              <select
                id="accountId"
                value={filters.accountId}
                onChange={(e) => handleFilterChange('accountId', e.target.value)}
                className="filter-select"
                disabled={isLoading}
              >
                <option value="">Alla konton</option>
                {Object.entries(accountOptions).map(([className, groupAccounts]) => (
                  <optgroup key={className} label={className}>
                    {groupAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.accountNumber} - {account.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Amount range and debit/credit */}
        <div className="filter-section">
          <h3 className="filter-section-title">Belopp och typ</h3>
          <div className="filter-row">
            <div className="filter-field">
              <label htmlFor="debitCredit" className="filter-label">
                Typ
              </label>
              <select
                id="debitCredit"
                value={filters.debitCredit}
                onChange={(e) => handleFilterChange('debitCredit', e.target.value)}
                className={`filter-select ${errors.debitCredit ? 'filter-select--error' : ''}`}
                disabled={isLoading}
              >
                {DEBIT_CREDIT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.debitCredit && (
                <div className="filter-error">{errors.debitCredit}</div>
              )}
            </div>
          </div>
          <div className="filter-row">
            <div className="filter-field">
              <label htmlFor="minAmount" className="filter-label">
                Minbelopp (SEK)
              </label>
              <input
                id="minAmount"
                type="number"
                step="0.01"
                min="0"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                className={`filter-input ${errors.minAmount || errors.amountRange ? 'filter-input--error' : ''}`}
                placeholder="0,00"
                disabled={isLoading}
              />
              {errors.minAmount && (
                <div className="filter-error">{errors.minAmount}</div>
              )}
            </div>
            <div className="filter-field">
              <label htmlFor="maxAmount" className="filter-label">
                Maxbelopp (SEK)
              </label>
              <input
                id="maxAmount"
                type="number"
                step="0.01"
                min="0"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                className={`filter-input ${errors.maxAmount || errors.amountRange ? 'filter-input--error' : ''}`}
                placeholder="999999,99"
                disabled={isLoading}
              />
              {errors.maxAmount && (
                <div className="filter-error">{errors.maxAmount}</div>
              )}
            </div>
          </div>
          {errors.amountRange && (
            <div className="filter-error">{errors.amountRange}</div>
          )}
        </div>

        {/* Actions */}
        <div className="filter-actions">
          <button
            type="button"
            className={`apply-filters ${hasErrors ? 'apply-filters--disabled' : ''}`}
            onClick={applyFilters}
            disabled={hasErrors || isLoading}
          >
            {isLoading ? (
              <>
                <svg className="loading-spinner" viewBox="0 0 24 24">
                  <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
                Filtrerar...
              </>
            ) : (
              'Tillämpa filter'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TransactionFilter