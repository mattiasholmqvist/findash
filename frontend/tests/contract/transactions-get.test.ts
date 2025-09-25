import { describe, it, expect } from 'vitest'

describe('Contract: GET /transactions', () => {
  it('should return paginated transaction list with default parameters', async () => {
    const mockTransactionService = await import('@/services/mock-transaction-api-service')

    const response = await mockTransactionService.getTransactions({})

    expect(response).toBeDefined()
    expect(response.transactions).toBeInstanceOf(Array)
    expect(response.pagination).toBeDefined()
    expect(response.pagination.page).toBe(0)
    expect(response.pagination.size).toBe(20)
    expect(response.totalCount).toBeTypeOf('number')
    expect(response.summary).toBeDefined()
    expect(response.summary.totalAmount).toBeTypeOf('number')
  })

  it('should support pagination parameters', async () => {
    const mockTransactionService = await import('@/services/mock-transaction-api-service')

    const response = await mockTransactionService.getTransactions({
      page: 1,
      size: 10
    })

    expect(response.pagination.page).toBe(1)
    expect(response.pagination.size).toBe(10)
    expect(response.transactions.length).toBeLessThanOrEqual(10)
  })

  it('should support date filtering', async () => {
    const mockTransactionService = await import('@/services/mock-transaction-api-service')

    const dateFrom = new Date('2024-01-01')
    const dateTo = new Date('2024-12-31')

    const response = await mockTransactionService.getTransactions({
      dateFrom,
      dateTo
    })

    response.transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date)
      expect(transactionDate).toBeInstanceOf(Date)
      expect(transactionDate.getTime()).toBeGreaterThanOrEqual(dateFrom.getTime())
      expect(transactionDate.getTime()).toBeLessThanOrEqual(dateTo.getTime())
    })
  })

  it('should support BAS class filtering', async () => {
    const mockTransactionService = await import('@/services/mock-transaction-api-service')

    const response = await mockTransactionService.getTransactions({
      basClass: 4 // Revenue class
    })

    response.transactions.forEach(transaction => {
      expect(transaction.basClass).toBe(4)
    })
  })

  it('should support search filtering', async () => {
    const mockTransactionService = await import('@/services/mock-transaction-api-service')

    const response = await mockTransactionService.getTransactions({
      search: 'invoice'
    })

    response.transactions.forEach(transaction => {
      expect(transaction.description.toLowerCase()).toContain('invoice')
    })
  })
})