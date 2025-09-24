import { describe, it, expect } from 'vitest'

describe('Contract: GET /transactions/{id}', () => {
  it('should return transaction details for valid ID', async () => {
    const mockTransactionService = await import('@/services/mock-transaction-service')

    // First get a list to find a valid ID
    const listResponse = await mockTransactionService.getTransactions({})
    const firstTransaction = listResponse.transactions[0]

    const response = await mockTransactionService.getTransactionById(firstTransaction.id)

    expect(response).toBeDefined()
    expect(response.id).toBe(firstTransaction.id)
    expect(response.date).toBeTypeOf('string')
    expect(response.description).toBeTypeOf('string')
    expect(response.amount).toBeTypeOf('number')
    expect(response.currency).toBe('SEK')
    expect(response.accountId).toBeTypeOf('string')
    expect(response.account).toBeDefined()
    expect(response.basClass).toBeGreaterThanOrEqual(1)
    expect(response.basClass).toBeLessThanOrEqual(8)
    expect(response.accountNumber).toMatch(/^\d{4}$/)
    expect(['DEBIT', 'CREDIT']).toContain(response.debitCredit)
    expect(response.createdAt).toBeTypeOf('string')
    expect(response.updatedAt).toBeTypeOf('string')
  })

  it('should throw 404 error for non-existent transaction ID', async () => {
    const mockTransactionService = await import('@/services/mock-transaction-service')

    const nonExistentId = '00000000-0000-0000-0000-000000000000'

    await expect(mockTransactionService.getTransactionById(nonExistentId))
      .rejects.toThrow('Transaction not found')
  })

  it('should validate UUID format for transaction ID', async () => {
    const mockTransactionService = await import('@/services/mock-transaction-service')

    const invalidId = 'not-a-uuid'

    await expect(mockTransactionService.getTransactionById(invalidId))
      .rejects.toThrow('Invalid transaction ID format')
  })
})