/**
 * Mock configuration service for development and testing
 * Constitutional compliance: TypeScript strict typing, kebab-case filename
 */

import { ApiResponse, MockConfigRequest, MockConfigResponse, validateMockConfigRequest, createApiError } from '@/types/api-types'
import { MockDataConfig } from './mock-data-generator'
import { mockTransactionApiService } from './mock-transaction-api-service'

export interface ApplicationConfig {
  theme: 'light' | 'dark' | 'auto'
  language: 'sv' | 'en'
  currency: 'SEK' | 'EUR' | 'USD'
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY'
  pagination: {
    defaultPageSize: number
    maxPageSize: number
  }
  features: {
    enableVAT: boolean
    enableAdvancedFiltering: boolean
    enableExport: boolean
    enableAccountHierarchy: boolean
  }
}

export class MockConfigService {
  private static readonly STORAGE_KEY = 'findash_app_config'
  private static readonly MOCK_DATA_STORAGE_KEY = 'findash_mock_data_config'

  private defaultAppConfig: ApplicationConfig = {
    theme: 'light',
    language: 'sv',
    currency: 'SEK',
    dateFormat: 'YYYY-MM-DD',
    pagination: {
      defaultPageSize: 50,
      maxPageSize: 100
    },
    features: {
      enableVAT: true,
      enableAdvancedFiltering: true,
      enableExport: false, // Not implemented in MVP
      enableAccountHierarchy: true
    }
  }

  private defaultMockDataConfig: MockConfigRequest = {
    datasetSize: 1000,
    dateRangeStart: '2024-01-01',
    dateRangeEnd: new Date().toISOString().split('T')[0],
    includeVAT: true,
    seed: 42
  }

  async getMockConfig(): Promise<ApiResponse<MockConfigResponse>> {
    // Simulate network delay
    await this.simulateNetworkDelay()

    const storedConfig = this.getStoredMockConfig()
    const lastGenerated = localStorage.getItem('findash_mock_data_last_generated') || new Date().toISOString()

    const response: MockConfigResponse = {
      datasetSize: storedConfig.datasetSize || this.defaultMockDataConfig.datasetSize!,
      dateRange: {
        startDate: storedConfig.dateRangeStart || this.defaultMockDataConfig.dateRangeStart!,
        endDate: storedConfig.dateRangeEnd || this.defaultMockDataConfig.dateRangeEnd!
      },
      includeVAT: storedConfig.includeVAT !== undefined ? storedConfig.includeVAT : this.defaultMockDataConfig.includeVAT!,
      lastGenerated
    }

    return {
      data: response,
      success: true,
      timestamp: new Date().toISOString()
    }
  }

  async updateMockConfig(request: MockConfigRequest): Promise<ApiResponse<MockConfigResponse>> {
    // Simulate network delay
    await this.simulateNetworkDelay()

    // Validate request
    const validationErrors = validateMockConfigRequest(request)
    if (validationErrors.length > 0) {
      return createApiError('VALIDATION_ERROR', validationErrors.join(', '))
    }

    try {
      // Store the configuration
      this.storeMockConfig(request)

      // Update the transaction service with new data
      const dataConfig: MockDataConfig = {
        datasetSize: request.datasetSize || this.defaultMockDataConfig.datasetSize!,
        dateRangeStart: request.dateRangeStart ? new Date(request.dateRangeStart) : new Date(this.defaultMockDataConfig.dateRangeStart!),
        dateRangeEnd: request.dateRangeEnd ? new Date(request.dateRangeEnd) : new Date(this.defaultMockDataConfig.dateRangeEnd!),
        includeVAT: request.includeVAT !== undefined ? request.includeVAT : this.defaultMockDataConfig.includeVAT!,
        seed: request.seed || Math.floor(Math.random() * 10000)
      }

      mockTransactionApiService.updateDataConfig(dataConfig)

      // Mark when data was last generated
      localStorage.setItem('findash_mock_data_last_generated', new Date().toISOString())

      const response: MockConfigResponse = {
        datasetSize: dataConfig.datasetSize,
        dateRange: {
          startDate: dataConfig.dateRangeStart.toISOString().split('T')[0],
          endDate: dataConfig.dateRangeEnd.toISOString().split('T')[0]
        },
        includeVAT: dataConfig.includeVAT,
        lastGenerated: new Date().toISOString()
      }

      return {
        data: response,
        success: true,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return createApiError('PROCESSING_ERROR', 'Fel vid uppdatering av konfiguration')
    }
  }

  // Application configuration management
  getApplicationConfig(): ApplicationConfig {
    const stored = localStorage.getItem(MockConfigService.STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        return { ...this.defaultAppConfig, ...parsed }
      } catch {
        // If parsing fails, return defaults
        return { ...this.defaultAppConfig }
      }
    }
    return { ...this.defaultAppConfig }
  }

  updateApplicationConfig(updates: Partial<ApplicationConfig>): ApplicationConfig {
    const current = this.getApplicationConfig()
    const updated = { ...current, ...updates }

    // Deep merge nested objects
    if (updates.pagination) {
      updated.pagination = { ...current.pagination, ...updates.pagination }
    }
    if (updates.features) {
      updated.features = { ...current.features, ...updates.features }
    }

    localStorage.setItem(MockConfigService.STORAGE_KEY, JSON.stringify(updated))
    return updated
  }

  resetApplicationConfig(): ApplicationConfig {
    localStorage.removeItem(MockConfigService.STORAGE_KEY)
    return { ...this.defaultAppConfig }
  }

  // Theme management
  async updateTheme(theme: ApplicationConfig['theme']): Promise<void> {
    this.updateApplicationConfig({ theme })

    // Apply theme to document
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // Auto theme - detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  // Language management
  async updateLanguage(language: ApplicationConfig['language']): Promise<void> {
    this.updateApplicationConfig({ language })

    // Update document language
    document.documentElement.lang = language
  }

  // Development utilities
  exportConfiguration(): {
    application: ApplicationConfig
    mockData: MockConfigRequest
  } {
    return {
      application: this.getApplicationConfig(),
      mockData: this.getStoredMockConfig()
    }
  }

  importConfiguration(config: {
    application?: Partial<ApplicationConfig>
    mockData?: MockConfigRequest
  }): void {
    if (config.application) {
      this.updateApplicationConfig(config.application)
    }
    if (config.mockData) {
      this.storeMockConfig(config.mockData)
      // Also update the transaction service
      const dataConfig: MockDataConfig = {
        datasetSize: config.mockData.datasetSize || this.defaultMockDataConfig.datasetSize!,
        dateRangeStart: config.mockData.dateRangeStart ? new Date(config.mockData.dateRangeStart) : new Date(this.defaultMockDataConfig.dateRangeStart!),
        dateRangeEnd: config.mockData.dateRangeEnd ? new Date(config.mockData.dateRangeEnd) : new Date(this.defaultMockDataConfig.dateRangeEnd!),
        includeVAT: config.mockData.includeVAT !== undefined ? config.mockData.includeVAT : this.defaultMockDataConfig.includeVAT!,
        seed: config.mockData.seed || Math.floor(Math.random() * 10000)
      }
      mockTransactionApiService.updateDataConfig(dataConfig)
    }
  }

  resetAllConfiguration(): void {
    localStorage.removeItem(MockConfigService.STORAGE_KEY)
    localStorage.removeItem(MockConfigService.MOCK_DATA_STORAGE_KEY)
    localStorage.removeItem('findash_mock_data_last_generated')

    // Reset to defaults
    mockTransactionApiService.updateDataConfig({
      datasetSize: this.defaultMockDataConfig.datasetSize!,
      dateRangeStart: new Date(this.defaultMockDataConfig.dateRangeStart!),
      dateRangeEnd: new Date(this.defaultMockDataConfig.dateRangeEnd!),
      includeVAT: this.defaultMockDataConfig.includeVAT!,
      seed: 42
    })
  }

  private getStoredMockConfig(): MockConfigRequest {
    const stored = localStorage.getItem(MockConfigService.MOCK_DATA_STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return { ...this.defaultMockDataConfig }
      }
    }
    return { ...this.defaultMockDataConfig }
  }

  private storeMockConfig(config: MockConfigRequest): void {
    localStorage.setItem(MockConfigService.MOCK_DATA_STORAGE_KEY, JSON.stringify(config))
  }

  private async simulateNetworkDelay(): Promise<void> {
    const delay = 100 + Math.random() * 50
    return new Promise(resolve => setTimeout(resolve, delay))
  }
}

// Singleton instance for application use
export const mockConfigService = new MockConfigService()

// Initialize theme and language on service creation
const initialConfig = mockConfigService.getApplicationConfig()
mockConfigService.updateTheme(initialConfig.theme)
mockConfigService.updateLanguage(initialConfig.language)

// Export types for external use
export type { ApplicationConfig }