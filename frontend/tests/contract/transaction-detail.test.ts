import { describe, it, expect } from 'vitest'

describe('Contract: GET /transactions/{id}', () => {
  it('should return transaction details for valid ID', async () => {
    const { mockTransactionApiService } = await import('@/services/mock-transaction-api-service')

    // First get a list to find a valid ID
    const listResponse = await mockTransactionApiService.getTransactions({})
    const firstTransaction = listResponse.data?.transactions[0]

    const response = await mockTransactionApiService.getTransactionById({ id: firstTransaction!.id })

    expect(response).toBeDefined()
    expect(response.success).toBe(true)
    expect(response.data).toBeDefined()
    expect(response.data?.id).toBe(firstTransaction!.id)
    expect(response.data?.date).toBeTypeOf('string')
    expect(response.data?.description).toBeTypeOf('string')
    expect(response.data?.amount).toBeTypeOf('number')
    expect(response.data?.currency).toBe('SEK')
    expect(response.data?.accountId).toBeTypeOf('string')
    expect(response.data?.account).toBeDefined()
    expect(response.data?.basClass).toBeGreaterThanOrEqual(1)
    expect(response.data?.basClass).toBeLessThanOrEqual(8)
    expect(response.data?.accountNumber).toMatch(/^\d{4}$/)
    expect(['DEBIT', 'CREDIT']).toContain(response.data?.debitCredit)
    expect(response.data?.createdAt).toBeTypeOf('string')
    expect(response.data?.updatedAt).toBeTypeOf('string')
  })

  it('should throw 404 error for non-existent transaction ID', async () => {
    const { mockTransactionApiService } = await import('@/services/mock-transaction-api-service')

    const nonExistentId = '00000000-0000-0000-0000-000000000000'

    const response = await mockTransactionApiService.getTransactionById({ id: nonExistentId })
    expect(response.success).toBe(false)
    expect(response.error).toBeDefined()
  })

  it('should validate UUID format for transaction ID', async () => {
    const { mockTransactionApiService } = await import('@/services/mock-transaction-api-service')

    const invalidId = 'not-a-uuid'

    const response = await mockTransactionApiService.getTransactionById({ id: invalidId })
    expect(response.success).toBe(false)
    expect(response.error).toBeDefined()
  })
})