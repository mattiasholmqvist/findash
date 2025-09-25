/**
 * Mock transaction API service for development and testing
 * Constitutional compliance: TypeScript strict typing, kebab-case filename
 */

import { Transaction, TransactionFilter, TransactionListResponse, PaginationInfo } from '@/types/transaction-types'
import { Account } from '@/types/account-types'
import { BASClass } from '@/types/bas-types'
import { ApiResponse, GetTransactionsParams, GetTransactionByIdParams, validateGetTransactionsParams, createApiError } from '@/types/api-types'
import { SwedishMockDataGenerator, MockDataConfig } from './mock-data-generator'

export interface MockTransactionApiConfig {
  networkDelayMs: number
  errorRate: number // 0-1, probability of random errors
  defaultPageSize: number
  maxPageSize: number
}

export class MockTransactionApiService {
  private config: MockTransactionApiConfig
  private dataGenerator: SwedishMockDataGenerator
  private cachedTransactions: Transaction[] = []
  private cachedAccounts: Account[] = []
  private dataConfig: MockDataConfig

  constructor(
    config: MockTransactionApiConfig = {
      networkDelayMs: 250,
      errorRate: 0.02, // 2% error rate
      defaultPageSize: 50,
      maxPageSize: 100
    },
    dataConfig: MockDataConfig = {
      datasetSize: 1000,
      dateRangeStart: new Date('2024-01-01'),
      dateRangeEnd: new Date(),
      includeVAT: true,
      seed: 42
    }
  ) {
    this.config = config
    this.dataConfig = dataConfig
    this.dataGenerator = new SwedishMockDataGenerator(dataConfig)
    this.initializeData()
  }

  async getTransactions(params: GetTransactionsParams = {}): Promise<ApiResponse<TransactionListResponse>> {
    // Simulate network delay
    await this.simulateNetworkDelay()

    // Simulate random errors
    if (this.shouldSimulateError()) {
      return createApiError('SERVER_ERROR', 'Ett oväntat fel uppstod vid hämtning av transaktioner')
    }

    // Validate parameters
    const validationErrors = validateGetTransactionsParams(params)
    if (validationErrors.length > 0) {
      return createApiError('VALIDATION_ERROR', validationErrors.join(', '))
    }

    try {
      const filteredTransactions = this.filterTransactions(params)
      const paginatedResult = this.paginateTransactions(filteredTransactions, params)

      return {
        data: paginatedResult,
        success: true,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return createApiError('PROCESSING_ERROR', 'Fel vid bearbetning av transaktionsdata')
    }
  }

  async getTransactionById(params: GetTransactionByIdParams): Promise<ApiResponse<Transaction>> {
    // Simulate network delay
    await this.simulateNetworkDelay()

    // Simulate random errors
    if (this.shouldSimulateError()) {
      return createApiError('SERVER_ERROR', 'Ett oväntat fel uppstod vid hämtning av transaktion')
    }

    const transaction = this.cachedTransactions.find(t => t.id === params.id)
    if (!transaction) {
      return createApiError('NOT_FOUND', `Transaktion med ID ${params.id} kunde inte hittas`)
    }

    return {
      data: transaction,
      success: true,
      timestamp: new Date().toISOString()
    }
  }

  // Configuration methods
  updateDataConfig(config: Partial<MockDataConfig>): void {
    this.dataConfig = { ...this.dataConfig, ...config }
    this.dataGenerator = new SwedishMockDataGenerator(this.dataConfig)
    this.initializeData()
  }

  updateApiConfig(config: Partial<MockTransactionApiConfig>): void {
    this.config = { ...this.config, ...config }
  }

  // Data refresh methods
  regenerateData(): void {
    this.initializeData()
  }

  getCurrentDataConfig(): MockDataConfig {
    return { ...this.dataConfig }
  }

  // Development utilities
  getCachedTransactions(): Transaction[] {
    return [...this.cachedTransactions]
  }

  getCachedAccounts(): Account[] {
    return [...this.cachedAccounts]
  }

  getDatasetStats(): {
    totalTransactions: number
    totalAccounts: number
    dateRange: { start: string; end: string }
    basClassDistribution: Record<BASClass, number>
  } {
    const basClassCounts = this.cachedTransactions.reduce((acc, t) => {
      acc[t.basClass] = (acc[t.basClass] || 0) + 1
      return acc
    }, {} as Record<BASClass, number>)

    return {
      totalTransactions: this.cachedTransactions.length,
      totalAccounts: this.cachedAccounts.length,
      dateRange: {
        start: this.dataConfig.dateRangeStart.toISOString().split('T')[0],
        end: this.dataConfig.dateRangeEnd.toISOString().split('T')[0]
      },
      basClassDistribution: basClassCounts
    }
  }

  private initializeData(): void {
    console.log('🔄 Regenerating mock transaction data...', this.dataConfig)

    // Generate accounts first
    this.cachedAccounts = this.dataGenerator.generateAccounts()

    // Generate transactions
    this.cachedTransactions = this.dataGenerator.generateTransactions(this.cachedAccounts)

    console.log(`✅ Generated ${this.cachedTransactions.length} transactions and ${this.cachedAccounts.length} accounts`)
  }

  private filterTransactions(params: GetTransactionsParams): Transaction[] {
    let filtered = [...this.cachedTransactions]

    // Date range filtering
    if (params.dateFrom) {
      const fromDate = new Date(params.dateFrom)
      filtered = filtered.filter(t => new Date(t.date) >= fromDate)
    }

    if (params.dateTo) {
      const toDate = new Date(params.dateTo)
      toDate.setHours(23, 59, 59, 999) // End of day
      filtered = filtered.filter(t => new Date(t.date) <= toDate)
    }

    // BAS class filtering
    if (params.basClass !== undefined) {
      filtered = filtered.filter(t => t.basClass === params.basClass)
    }

    // Account ID filtering
    if (params.accountId) {
      filtered = filtered.filter(t => t.accountId === params.accountId)
    }

    // Search in description
    if (params.search) {
      const searchLower = params.search.toLowerCase()
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchLower) ||
        t.reference.toLowerCase().includes(searchLower) ||
        t.account.name.toLowerCase().includes(searchLower)
      )
    }

    // Debit/Credit filtering
    if (params.debitCredit) {
      filtered = filtered.filter(t => t.debitCredit === params.debitCredit)
    }

    // Amount range filtering
    if (params.minAmount !== undefined) {
      filtered = filtered.filter(t => t.amount >= params.minAmount!)
    }

    if (params.maxAmount !== undefined) {
      filtered = filtered.filter(t => t.amount <= params.maxAmount!)
    }

    return filtered
  }

  private paginateTransactions(transactions: Transaction[], params: GetTransactionsParams): TransactionListResponse {
    const page = params.page || 0
    const size = Math.min(params.size || this.config.defaultPageSize, this.config.maxPageSize)

    const totalCount = transactions.length
    const totalPages = Math.ceil(totalCount / size)
    const startIndex = page * size
    const endIndex = Math.min(startIndex + size, totalCount)

    const paginatedTransactions = transactions.slice(startIndex, endIndex)

    const pagination: PaginationInfo = {
      currentPage: page,
      pageSize: size,
      totalCount,
      totalPages,
      hasNext: page < totalPages - 1,
      hasPrevious: page > 0
    }

    return {
      transactions: paginatedTransactions,
      pagination,
      filters: this.buildAppliedFilters(params),
      summary: this.calculateSummary(transactions)
    }
  }

  private buildAppliedFilters(params: GetTransactionsParams): Record<string, unknown> {
    const filters: Record<string, unknown> = {}

    if (params.dateFrom) filters.dateFrom = params.dateFrom
    if (params.dateTo) filters.dateTo = params.dateTo
    if (params.basClass !== undefined) filters.basClass = params.basClass
    if (params.accountId) filters.accountId = params.accountId
    if (params.search) filters.search = params.search
    if (params.debitCredit) filters.debitCredit = params.debitCredit
    if (params.minAmount !== undefined) filters.minAmount = params.minAmount
    if (params.maxAmount !== undefined) filters.maxAmount = params.maxAmount

    return filters
  }

  private calculateSummary(transactions: Transaction[]): {
    totalAmount: number
    debitTotal: number
    creditTotal: number
    transactionCount: number
    averageAmount: number
  } {
    const debitTransactions = transactions.filter(t => t.debitCredit === 'DEBIT')
    const creditTransactions = transactions.filter(t => t.debitCredit === 'CREDIT')

    const debitTotal = debitTransactions.reduce((sum, t) => sum + t.amount, 0)
    const creditTotal = creditTransactions.reduce((sum, t) => sum + t.amount, 0)
    const totalAmount = debitTotal - creditTotal // Net amount
    const averageAmount = transactions.length > 0 ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length : 0

    return {
      totalAmount,
      debitTotal,
      creditTotal,
      transactionCount: transactions.length,
      averageAmount: Math.round(averageAmount)
    }
  }

  private async simulateNetworkDelay(): Promise<void> {
    const delay = this.config.networkDelayMs + (Math.random() * 100)
    return new Promise(resolve => setTimeout(resolve, delay))
  }

  private shouldSimulateError(): boolean {
    return Math.random() < this.config.errorRate
  }
}

// Singleton instance for application use
export const mockTransactionApiService = new MockTransactionApiService(
  {
    networkDelayMs: import.meta.env.MODE === 'development' ? 200 : 400,
    errorRate: import.meta.env.MODE === 'development' ? 0.01 : 0.02,
    defaultPageSize: 50,
    maxPageSize: 100
  },
  {
    datasetSize: 2000,
    dateRangeStart: new Date('2024-01-01'),
    dateRangeEnd: new Date(),
    includeVAT: true,
    seed: 42
  }
)

// Export types for external use
export type { MockTransactionApiConfig }