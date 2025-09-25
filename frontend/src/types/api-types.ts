/**
 * API contract types and response schemas
 * Constitutional compliance: TypeScript strict typing, kebab-case filename
 */

import { Transaction, TransactionFilter, TransactionListResponse, PaginationInfo, TransactionSummary } from './transaction-types'
import { Account, AccountFilter, AccountListResponse } from './account-types'
import { User, LoginRequest, LoginResponse, LogoutResponse, AuthError } from './user-types'

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  readonly data?: T
  readonly error?: ApiError
  readonly success: boolean
  readonly timestamp: string
}

export interface ApiError {
  readonly error: string
  readonly message: string
  readonly details?: Record<string, unknown>
  readonly timestamp: string
}

// Pagination parameters
export interface PaginationParams {
  readonly page?: number // 0-based page number
  readonly size?: number // Items per page (10-100)
}

// Transaction API types
export interface GetTransactionsParams extends PaginationParams {
  dateFrom?: string // YYYY-MM-DD format
  dateTo?: string // YYYY-MM-DD format
  basClass?: number // 1-8
  accountId?: string // UUID
  search?: string // Search in descriptions
  debitCredit?: 'DEBIT' | 'CREDIT'
  minAmount?: number // Amount in öre
  maxAmount?: number // Amount in öre
}

export interface GetTransactionByIdParams {
  readonly id: string // UUID
}

export type GetTransactionsResponse = TransactionListResponse
export type GetTransactionByIdResponse = Transaction

// Account API types
export interface GetAccountsParams {
  readonly basClass?: number // 1-8
  readonly active?: boolean
  readonly search?: string
}

export type GetAccountsResponse = AccountListResponse

// Authentication API types
export type LoginRequestBody = LoginRequest
export type LoginApiResponse = LoginResponse
export type LogoutApiResponse = LogoutResponse

// Mock configuration API types
export interface MockConfigRequest {
  readonly datasetSize?: number // 50-10000
  readonly dateRangeStart?: string // YYYY-MM-DD
  readonly dateRangeEnd?: string // YYYY-MM-DD
  readonly includeVAT?: boolean
  readonly seed?: number // Random seed for consistent data
}

export interface MockConfigResponse {
  readonly datasetSize: number
  readonly dateRange: {
    readonly startDate: string // YYYY-MM-DD
    readonly endDate: string // YYYY-MM-DD
  }
  readonly includeVAT: boolean
  readonly lastGenerated: string // ISO 8601 timestamp
}

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// API endpoint definitions
export interface ApiEndpoint {
  readonly path: string
  readonly method: HttpMethod
  readonly requiresAuth: boolean
}

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: { path: '/auth/login', method: 'POST' as const, requiresAuth: false },
  LOGOUT: { path: '/auth/logout', method: 'POST' as const, requiresAuth: true },

  // Transactions
  GET_TRANSACTIONS: { path: '/transactions', method: 'GET' as const, requiresAuth: true },
  GET_TRANSACTION_BY_ID: { path: '/transactions/:id', method: 'GET' as const, requiresAuth: true },

  // Accounts
  GET_ACCOUNTS: { path: '/accounts', method: 'GET' as const, requiresAuth: true },

  // Mock configuration
  GET_MOCK_CONFIG: { path: '/mock-config', method: 'GET' as const, requiresAuth: true },
  UPDATE_MOCK_CONFIG: { path: '/mock-config', method: 'PUT' as const, requiresAuth: true },
} as const

// Request/Response validation
export const validatePaginationParams = (params: PaginationParams): string[] => {
  const errors: string[] = []

  if (params.page !== undefined) {
    if (!Number.isInteger(params.page) || params.page < 0) {
      errors.push('Page must be a non-negative integer')
    }
  }

  if (params.size !== undefined) {
    if (!Number.isInteger(params.size) || params.size < 10 || params.size > 100) {
      errors.push('Page size must be between 10 and 100')
    }
  }

  return errors
}

export const validateGetTransactionsParams = (params: GetTransactionsParams): string[] => {
  const errors: string[] = []

  // Validate pagination
  errors.push(...validatePaginationParams(params))

  // Validate date range
  if (params.dateFrom && !isValidDateString(params.dateFrom)) {
    errors.push('dateFrom must be in YYYY-MM-DD format')
  }

  if (params.dateTo && !isValidDateString(params.dateTo)) {
    errors.push('dateTo must be in YYYY-MM-DD format')
  }

  if (params.dateFrom && params.dateTo) {
    const fromDate = new Date(params.dateFrom)
    const toDate = new Date(params.dateTo)
    if (fromDate > toDate) {
      errors.push('dateFrom cannot be after dateTo')
    }
  }

  // Validate BAS class
  if (params.basClass !== undefined) {
    if (!Number.isInteger(params.basClass) || params.basClass < 1 || params.basClass > 8) {
      errors.push('basClass must be between 1 and 8')
    }
  }

  // Validate account ID
  if (params.accountId && !isValidUUID(params.accountId)) {
    errors.push('accountId must be a valid UUID')
  }

  // Validate search text
  if (params.search && params.search.length > 100) {
    errors.push('Search text cannot exceed 100 characters')
  }

  // Validate debit/credit
  if (params.debitCredit && !['DEBIT', 'CREDIT'].includes(params.debitCredit)) {
    errors.push('debitCredit must be either DEBIT or CREDIT')
  }

  // Validate amounts
  if (params.minAmount !== undefined && !Number.isInteger(params.minAmount)) {
    errors.push('minAmount must be an integer (öre)')
  }

  if (params.maxAmount !== undefined && !Number.isInteger(params.maxAmount)) {
    errors.push('maxAmount must be an integer (öre)')
  }

  if (params.minAmount !== undefined && params.maxAmount !== undefined && params.minAmount > params.maxAmount) {
    errors.push('minAmount cannot be greater than maxAmount')
  }

  return errors
}

export const validateMockConfigRequest = (request: MockConfigRequest): string[] => {
  const errors: string[] = []

  if (request.datasetSize !== undefined) {
    if (!Number.isInteger(request.datasetSize) || request.datasetSize < 50 || request.datasetSize > 10000) {
      errors.push('Dataset size must be between 50 and 10000')
    }
  }

  if (request.dateRangeStart && !isValidDateString(request.dateRangeStart)) {
    errors.push('dateRangeStart must be in YYYY-MM-DD format')
  }

  if (request.dateRangeEnd && !isValidDateString(request.dateRangeEnd)) {
    errors.push('dateRangeEnd must be in YYYY-MM-DD format')
  }

  if (request.dateRangeStart && request.dateRangeEnd) {
    const startDate = new Date(request.dateRangeStart)
    const endDate = new Date(request.dateRangeEnd)
    if (startDate > endDate) {
      errors.push('dateRangeStart cannot be after dateRangeEnd')
    }
  }

  if (request.seed !== undefined && !Number.isInteger(request.seed)) {
    errors.push('Seed must be an integer')
  }

  return errors
}

// Utility functions
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

const isValidDateString = (dateStr: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false
  }

  const date = new Date(dateStr)
  return date.toISOString().substr(0, 10) === dateStr
}

// Response transformation utilities
export const transformApiResponse = <T>(response: unknown): ApiResponse<T> => {
  if (typeof response === 'object' && response !== null && 'data' in response) {
    return response as ApiResponse<T>
  }

  // If response doesn't follow ApiResponse format, wrap it
  return {
    data: response as T,
    success: true,
    timestamp: new Date().toISOString()
  }
}

export const createApiError = (error: string, message: string, details?: Record<string, unknown>): ApiResponse<never> => {
  return {
    error: {
      error,
      message,
      details,
      timestamp: new Date().toISOString()
    },
    success: false,
    timestamp: new Date().toISOString()
  }
}

// HTTP status code mappings
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
} as const

export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS]