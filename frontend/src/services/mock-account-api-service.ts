/**
 * Mock account API service for development and testing
 * Constitutional compliance: TypeScript strict typing, kebab-case filename
 */

import { Account, AccountFilter, AccountListResponse, buildAccountHierarchy, AccountHierarchy } from '@/types/account-types'
import { BASClass } from '@/types/bas-types'
import { ApiResponse, GetAccountsParams, createApiError } from '@/types/api-types'
import { SwedishMockDataGenerator, MockDataConfig } from './mock-data-generator'

export interface MockAccountApiConfig {
  networkDelayMs: number
  errorRate: number // 0-1, probability of random errors
  includeInactive: boolean
}

export class MockAccountApiService {
  private config: MockAccountApiConfig
  private dataGenerator: SwedishMockDataGenerator
  private cachedAccounts: Account[] = []

  constructor(
    config: MockAccountApiConfig = {
      networkDelayMs: 150,
      errorRate: 0.01, // 1% error rate
      includeInactive: true
    }
  ) {
    this.config = config
    this.dataGenerator = new SwedishMockDataGenerator({
      datasetSize: 100,
      dateRangeStart: new Date('2024-01-01'),
      dateRangeEnd: new Date(),
      includeVAT: true,
      seed: 42
    })
    this.initializeData()
  }

  async getAccounts(params: GetAccountsParams = {}): Promise<ApiResponse<AccountListResponse>> {
    // Simulate network delay
    await this.simulateNetworkDelay()

    // Simulate random errors
    if (this.shouldSimulateError()) {
      return createApiError('SERVER_ERROR', 'Ett oväntat fel uppstod vid hämtning av konton')
    }

    try {
      const filteredAccounts = this.filterAccounts(params)

      const response: AccountListResponse = {
        accounts: filteredAccounts,
        totalCount: filteredAccounts.length
      }

      return {
        data: response,
        success: true,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return createApiError('PROCESSING_ERROR', 'Fel vid bearbetning av kontodata')
    }
  }

  async getAccountById(accountId: string): Promise<ApiResponse<Account>> {
    // Simulate network delay
    await this.simulateNetworkDelay()

    // Simulate random errors
    if (this.shouldSimulateError()) {
      return createApiError('SERVER_ERROR', 'Ett oväntat fel uppstod vid hämtning av konto')
    }

    const account = this.cachedAccounts.find(a => a.id === accountId)
    if (!account) {
      return createApiError('NOT_FOUND', `Konto med ID ${accountId} kunde inte hittas`)
    }

    return {
      data: account,
      success: true,
      timestamp: new Date().toISOString()
    }
  }

  async getAccountsByBASClass(basClass: BASClass): Promise<ApiResponse<Account[]>> {
    // Simulate network delay
    await this.simulateNetworkDelay()

    // Simulate random errors
    if (this.shouldSimulateError()) {
      return createApiError('SERVER_ERROR', 'Ett oväntat fel uppstod vid hämtning av konton')
    }

    const accounts = this.cachedAccounts.filter(a => a.basClass === basClass && a.isActive)

    return {
      data: accounts,
      success: true,
      timestamp: new Date().toISOString()
    }
  }

  async getAccountHierarchy(): Promise<ApiResponse<AccountHierarchy[]>> {
    // Simulate network delay
    await this.simulateNetworkDelay()

    // Simulate random errors
    if (this.shouldSimulateError()) {
      return createApiError('SERVER_ERROR', 'Ett oväntat fel uppstod vid hämtning av kontohierarki')
    }

    try {
      const activeAccounts = this.cachedAccounts.filter(a => a.isActive)
      const hierarchy = buildAccountHierarchy(activeAccounts)

      return {
        data: hierarchy,
        success: true,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return createApiError('PROCESSING_ERROR', 'Fel vid bearbetning av kontohierarki')
    }
  }

  // Configuration methods
  updateConfig(config: Partial<MockAccountApiConfig>): void {
    this.config = { ...this.config, ...config }
  }

  regenerateData(): void {
    this.initializeData()
  }

  // Development utilities
  getCachedAccounts(): Account[] {
    return [...this.cachedAccounts]
  }

  getAccountStats(): {
    totalAccounts: number
    activeAccounts: number
    accountsByBASClass: Record<BASClass, number>
    accountsByFirstDigit: Record<string, number>
  } {
    const basClassCounts = this.cachedAccounts.reduce((acc, a) => {
      acc[a.basClass] = (acc[a.basClass] || 0) + 1
      return acc
    }, {} as Record<BASClass, number>)

    const firstDigitCounts = this.cachedAccounts.reduce((acc, a) => {
      const firstDigit = a.accountNumber.charAt(0)
      acc[firstDigit] = (acc[firstDigit] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalAccounts: this.cachedAccounts.length,
      activeAccounts: this.cachedAccounts.filter(a => a.isActive).length,
      accountsByBASClass: basClassCounts,
      accountsByFirstDigit: firstDigitCounts
    }
  }

  addCustomAccount(accountData: Omit<Account, 'id' | 'createdAt'>): void {
    const newAccount: Account = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString(),
      ...accountData
    }
    this.cachedAccounts.push(newAccount)
  }

  private initializeData(): void {
    console.log('🔄 Initializing mock account data...')
    this.cachedAccounts = this.dataGenerator.generateAccounts()
    console.log(`✅ Initialized ${this.cachedAccounts.length} accounts`)
  }

  private filterAccounts(params: GetAccountsParams): Account[] {
    let filtered = [...this.cachedAccounts]

    // BAS class filtering
    if (params.basClass !== undefined) {
      filtered = filtered.filter(a => a.basClass === params.basClass)
    }

    // Active status filtering
    if (params.active !== undefined) {
      filtered = filtered.filter(a => a.isActive === params.active)
    } else if (!this.config.includeInactive) {
      // By default, only show active accounts unless configured otherwise
      filtered = filtered.filter(a => a.isActive)
    }

    // Search filtering
    if (params.search) {
      const searchLower = params.search.toLowerCase()
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(searchLower) ||
        a.nameEnglish.toLowerCase().includes(searchLower) ||
        a.accountNumber.includes(params.search!) ||
        a.basDescription.toLowerCase().includes(searchLower)
      )
    }

    // Sort by account number
    filtered.sort((a, b) => a.accountNumber.localeCompare(b.accountNumber))

    return filtered
  }

  private async simulateNetworkDelay(): Promise<void> {
    const delay = this.config.networkDelayMs + (Math.random() * 50)
    return new Promise(resolve => setTimeout(resolve, delay))
  }

  private shouldSimulateError(): boolean {
    return Math.random() < this.config.errorRate
  }
}

// Singleton instance for application use
export const mockAccountApiService = new MockAccountApiService({
  networkDelayMs: import.meta.env.MODE === 'development' ? 100 : 200,
  errorRate: import.meta.env.MODE === 'development' ? 0.005 : 0.01,
  includeInactive: false
})

// Export types for external use
export type { MockAccountApiConfig }