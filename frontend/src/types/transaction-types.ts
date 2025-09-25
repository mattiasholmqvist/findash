/**
 * Transaction entity types with Swedish BAS compliance
 * Constitutional compliance: TypeScript strict typing, kebab-case filename
 */

import { BASClass, SwedishVATRate } from './bas-types'
import { Account } from './account-types'

export interface Transaction {
  readonly id: string // UUID format
  readonly date: string // YYYY-MM-DD format (Swedish standard)
  readonly description: string // Max 200 characters
  readonly amount: number // Amount in öre (Swedish currency subdivision)
  readonly currency: 'SEK' // Always SEK for Swedish Kronor
  readonly accountId: string // Reference to Account entity
  readonly account?: Account // Populated account details
  readonly basClass: BASClass // Swedish BAS account class (1-8)
  readonly accountNumber: string // 4-digit BAS account number
  readonly debitCredit: 'DEBIT' | 'CREDIT'
  readonly vatAmount?: number // VAT amount in öre (optional)
  readonly vatRate?: SwedishVATRate // VAT rate percentage (optional)
  readonly reference?: string // Transaction reference/invoice number (optional)
  readonly createdAt: string // ISO 8601 timestamp
  readonly updatedAt: string // ISO 8601 timestamp
}

export interface TransactionCreateRequest {
  readonly date: string
  readonly description: string
  readonly amount: number
  readonly accountId: string
  readonly debitCredit: 'DEBIT' | 'CREDIT'
  readonly vatAmount?: number
  readonly vatRate?: SwedishVATRate
  readonly reference?: string
}

export interface TransactionFilter {
  readonly dateFrom?: Date
  readonly dateTo?: Date
  readonly basClass?: BASClass
  readonly accountId?: string
  readonly minAmount?: number
  readonly maxAmount?: number
  readonly searchText?: string
  readonly debitCredit?: 'DEBIT' | 'CREDIT'
}

export interface TransactionListResponse {
  readonly transactions: Transaction[]
  readonly pagination: PaginationInfo
  readonly totalCount: number
  readonly summary: TransactionSummary
}

export interface PaginationInfo {
  readonly page: number // 0-based page number
  readonly size: number // Items per page
  readonly hasNext: boolean
  readonly hasPrevious: boolean
}

export interface TransactionSummary {
  readonly totalAmount: number // Sum of all amounts in öre
  readonly debitTotal: number // Sum of debit transactions in öre
  readonly creditTotal: number // Sum of credit transactions in öre
  readonly transactionCount: number
}

// Validation functions
export const validateTransaction = (transaction: Partial<Transaction>): string[] => {
  const errors: string[] = []

  if (!transaction.id || !isValidUUID(transaction.id)) {
    errors.push('ID must be a valid UUID')
  }

  if (!transaction.date || !isValidSwedishDate(transaction.date)) {
    errors.push('Date must be in YYYY-MM-DD format and not in the future')
  }

  if (!transaction.description || transaction.description.length < 1 || transaction.description.length > 200) {
    errors.push('Description must be 1-200 characters')
  }

  if (typeof transaction.amount !== 'number') {
    errors.push('Amount must be a number in öre')
  }

  if (transaction.currency !== 'SEK') {
    errors.push('Currency must be SEK')
  }

  if (!transaction.accountId || !isValidUUID(transaction.accountId)) {
    errors.push('Account ID must be a valid UUID')
  }

  if (!transaction.basClass || transaction.basClass < 1 || transaction.basClass > 8) {
    errors.push('BAS class must be between 1 and 8')
  }

  if (!transaction.accountNumber || !/^\d{4}$/.test(transaction.accountNumber)) {
    errors.push('Account number must be exactly 4 digits')
  }

  if (!transaction.debitCredit || !['DEBIT', 'CREDIT'].includes(transaction.debitCredit)) {
    errors.push('Debit/Credit must be either DEBIT or CREDIT')
  }

  if (transaction.vatAmount !== undefined) {
    if (typeof transaction.vatAmount !== 'number' || transaction.vatAmount < 0) {
      errors.push('VAT amount must be a non-negative number in öre')
    }
    if (transaction.vatRate === undefined) {
      errors.push('VAT rate is required when VAT amount is specified')
    }
  }

  if (transaction.vatRate !== undefined) {
    if (![0, 6, 12, 25].includes(transaction.vatRate)) {
      errors.push('VAT rate must be 0%, 6%, 12%, or 25%')
    }
  }

  if (transaction.reference && transaction.reference.length > 50) {
    errors.push('Reference must be maximum 50 characters')
  }

  return errors
}

const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

const isValidSwedishDate = (dateStr: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false
  }

  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(23, 59, 59, 999) // End of today

  return date <= today && date.getFullYear() > 1900
}

export const formatSwedishCurrency = (amountInOre: number, options?: {
  compact?: boolean
  accounting?: boolean
}): string => {
  const amount = amountInOre / 100 // Convert öre to kronor

  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }

  if (options?.compact) {
    formatOptions.notation = 'compact'
    formatOptions.compactDisplay = 'short'
  }

  if (options?.accounting) {
    formatOptions.currencySign = 'accounting'
  }

  return new Intl.NumberFormat('sv-SE', formatOptions).format(amount)
}

export const formatSwedishDate = (dateStr: string): string => {
  // Already in Swedish format YYYY-MM-DD, just validate
  if (!isValidSwedishDate(dateStr)) {
    throw new Error('Invalid date format')
  }
  return dateStr
}