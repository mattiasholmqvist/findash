import { describe, it, expect } from 'vitest'

describe('Contract: GET /mock-config', () => {
  it('should return current mock data configuration', async () => {
    const mockConfigService = await import('@/services/mock-config-service')

    const response = await mockConfigService.getMockConfig()

    expect(response).toBeDefined()
    expect(response.datasetSize).toBeTypeOf('number')
    expect(response.datasetSize).toBeGreaterThan(0)
    expect(response.dateRange).toBeDefined()
    expect(response.dateRange.startDate).toBeTypeOf('string')
    expect(response.dateRange.endDate).toBeTypeOf('string')
    expect(response.includeVAT).toBeTypeOf('boolean')
    expect(response.lastGenerated).toBeTypeOf('string')
  })
})

describe('Contract: PUT /mock-config', () => {
  it('should update mock data configuration with valid parameters', async () => {
    const mockConfigService = await import('@/services/mock-config-service')

    const configUpdate = {
      datasetSize: 500,
      dateRangeStart: '2024-01-01',
      dateRangeEnd: '2024-12-31',
      includeVAT: true,
      seed: 12345
    }

    const response = await mockConfigService.updateMockConfig(configUpdate)

    expect(response).toBeDefined()
    expect(response.datasetSize).toBe(configUpdate.datasetSize)
    expect(response.includeVAT).toBe(configUpdate.includeVAT)
    expect(response.dateRange.startDate).toBe(configUpdate.dateRangeStart)
    expect(response.dateRange.endDate).toBe(configUpdate.dateRangeEnd)
  })

  it('should validate configuration parameters', async () => {
    const mockConfigService = await import('@/services/mock-config-service')

    const invalidConfig = {
      datasetSize: -1, // Invalid: negative
      dateRangeStart: 'invalid-date',
      dateRangeEnd: '2024-01-01', // Invalid: before start date
      includeVAT: true
    }

    await expect(mockConfigService.updateMockConfig(invalidConfig))
      .rejects.toThrow('Invalid configuration parameters')
  })

  it('should enforce dataset size limits', async () => {
    const mockConfigService = await import('@/services/mock-config-service')

    const oversizedConfig = {
      datasetSize: 50000, // Above limit
      dateRangeStart: '2024-01-01',
      dateRangeEnd: '2024-12-31',
      includeVAT: true
    }

    await expect(mockConfigService.updateMockConfig(oversizedConfig))
      .rejects.toThrow('Dataset size exceeds maximum limit')
  })
})