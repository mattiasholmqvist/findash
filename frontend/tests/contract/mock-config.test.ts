import { describe, it, expect } from 'vitest'

describe('Contract: GET /mock-config', () => {
  it('should return current mock data configuration', async () => {
    const { mockConfigService } = await import('@/services/mock-config-service')

    const response = await mockConfigService.getMockConfig()

    expect(response).toBeDefined()
    expect(response.success).toBe(true)
    expect(response.data).toBeDefined()
    expect(response.data?.datasetSize).toBeTypeOf('number')
    expect(response.data?.datasetSize).toBeGreaterThan(0)
    expect(response.data?.dateRange).toBeDefined()
    expect(response.data?.dateRange.startDate).toBeTypeOf('string')
    expect(response.data?.dateRange.endDate).toBeTypeOf('string')
    expect(response.data?.includeVAT).toBeTypeOf('boolean')
    expect(response.data?.lastGenerated).toBeTypeOf('string')
  })
})

describe('Contract: PUT /mock-config', () => {
  it('should update mock data configuration with valid parameters', async () => {
    const { mockConfigService } = await import('@/services/mock-config-service')

    const configUpdate = {
      datasetSize: 500,
      dateRangeStart: '2024-01-01',
      dateRangeEnd: '2024-12-31',
      includeVAT: true,
      seed: 12345
    }

    const response = await mockConfigService.updateMockConfig(configUpdate)

    expect(response).toBeDefined()
    expect(response.success).toBe(true)
    expect(response.data).toBeDefined()
    expect(response.data?.datasetSize).toBe(configUpdate.datasetSize)
    expect(response.data?.includeVAT).toBe(configUpdate.includeVAT)
  })

  it('should validate configuration parameters', async () => {
    const { mockConfigService } = await import('@/services/mock-config-service')

    const invalidConfig = {
      datasetSize: -1, // Invalid: negative
      dateRangeStart: 'invalid-date',
      dateRangeEnd: '2024-01-01', // Invalid: before start date
      includeVAT: true
    }

    const response = await mockConfigService.updateMockConfig(invalidConfig)
    expect(response.success).toBe(false)
    expect(response.error).toBeDefined()
  })

  it('should enforce dataset size limits', async () => {
    const { mockConfigService } = await import('@/services/mock-config-service')

    const oversizedConfig = {
      datasetSize: 50000, // Above limit
      dateRangeStart: '2024-01-01',
      dateRangeEnd: '2024-12-31',
      includeVAT: true
    }

    const response = await mockConfigService.updateMockConfig(oversizedConfig)
    expect(response.success).toBe(false)
    expect(response.error).toBeDefined()
  })
})