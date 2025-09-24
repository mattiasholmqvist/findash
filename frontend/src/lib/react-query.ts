/**
 * React Query configuration and setup
 * Constitutional compliance: TypeScript strict typing, kebab-case filename
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode } from 'react'

// Query client configuration
const queryClientConfig = {
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh (5 minutes)
      staleTime: 5 * 60 * 1000,

      // Cache time - how long data stays in cache after being unused (10 minutes)
      gcTime: 10 * 60 * 1000,

      // Retry configuration
      retry: (failureCount: number, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },

      // Retry delay with exponential backoff
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus (useful for keeping data fresh)
      refetchOnWindowFocus: true,

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Background refetch interval (disabled by default)
      refetchInterval: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,

      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
}

// Create query client instance
export const queryClient = new QueryClient(queryClientConfig)

// Query keys factory for consistent key management
export const queryKeys = {
  // Transaction-related queries
  transactions: {
    all: ['transactions'] as const,
    lists: () => [...queryKeys.transactions.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.transactions.lists(), filters] as const,
    details: () => [...queryKeys.transactions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.transactions.details(), id] as const,
  },

  // Account-related queries
  accounts: {
    all: ['accounts'] as const,
    lists: () => [...queryKeys.accounts.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.accounts.lists(), filters] as const,
    details: () => [...queryKeys.accounts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.accounts.details(), id] as const,
    hierarchy: () => [...queryKeys.accounts.all, 'hierarchy'] as const,
  },

  // User/Auth related queries
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },

  // Configuration queries
  config: {
    all: ['config'] as const,
    app: () => [...queryKeys.config.all, 'app'] as const,
    mock: () => [...queryKeys.config.all, 'mock'] as const,
  },
} as const

// Query client provider component with error boundary
interface ReactQueryProviderProps {
  children: ReactNode
}

export const ReactQueryProvider = ({ children }: ReactQueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {import.meta.env.MODE === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}

// Utility functions for query invalidation and cache management

/**
 * Invalidate all transaction-related queries
 */
export const invalidateTransactions = () => {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.transactions.all
  })
}

/**
 * Invalidate all account-related queries
 */
export const invalidateAccounts = () => {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.accounts.all
  })
}

/**
 * Invalidate authentication queries
 */
export const invalidateAuth = () => {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.auth.all
  })
}

/**
 * Clear all cached data (useful on logout)
 */
export const clearAllCaches = () => {
  queryClient.clear()
}

/**
 * Prefetch transaction list with given filters
 */
export const prefetchTransactions = (filters?: Record<string, unknown>) => {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.transactions.list(filters),
    // We'd implement the actual query function here when integrating with real API
    queryFn: () => Promise.resolve([]),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Set transaction data in cache (useful after mutations)
 */
export const setTransactionData = (id: string, data: any) => {
  queryClient.setQueryData(queryKeys.transactions.detail(id), data)
}

/**
 * Get cached transaction data
 */
export const getCachedTransactionData = (id: string) => {
  return queryClient.getQueryData(queryKeys.transactions.detail(id))
}

/**
 * Remove specific transaction from cache
 */
export const removeTransactionFromCache = (id: string) => {
  queryClient.removeQueries({
    queryKey: queryKeys.transactions.detail(id)
  })
}

// Error handling utilities for React Query
export const isQueryError = (error: unknown): error is Error => {
  return error instanceof Error
}

export const getQueryErrorMessage = (error: unknown): string => {
  if (isQueryError(error)) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }

  return 'Ett okänt fel uppstod'
}

// Query status utilities
export const isLoadingState = (status: string) => status === 'pending'
export const isErrorState = (status: string) => status === 'error'
export const isSuccessState = (status: string) => status === 'success'

// Cache warming utilities (for better UX)
export const warmCache = async () => {
  // Pre-load commonly accessed data
  try {
    await Promise.all([
      // Prefetch accounts for filter dropdowns
      queryClient.prefetchQuery({
        queryKey: queryKeys.accounts.lists(),
        queryFn: () => Promise.resolve([]), // Mock implementation
        staleTime: 10 * 60 * 1000, // 10 minutes
      }),

      // Prefetch recent transactions
      queryClient.prefetchQuery({
        queryKey: queryKeys.transactions.list({ page: 0, size: 50 }),
        queryFn: () => Promise.resolve([]), // Mock implementation
        staleTime: 5 * 60 * 1000, // 5 minutes
      }),
    ])
  } catch (error) {
    console.warn('Cache warming failed:', error)
  }
}

// Network status monitoring
let isOnline = navigator.onLine

window.addEventListener('online', () => {
  isOnline = true
  // Refetch all queries when coming back online
  queryClient.refetchQueries()
})

window.addEventListener('offline', () => {
  isOnline = false
})

export const getNetworkStatus = () => isOnline

// Performance monitoring
if (import.meta.env.MODE === 'development') {
  // Log slow queries in development
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === 'updated' && event.query.state.fetchStatus === 'idle') {
      const fetchTime = event.query.state.dataUpdatedAt - (event.query.state.dataUpdatedAt - (event.query.state.fetchFailureReason as any)?.fetchTime || 0)

      if (fetchTime > 2000) { // Log queries taking more than 2 seconds
        console.warn('Slow query detected:', {
          queryKey: event.query.queryKey,
          fetchTime: `${fetchTime}ms`,
          dataUpdatedAt: event.query.state.dataUpdatedAt,
        })
      }
    }
  })
}

export default {
  queryClient,
  queryKeys,
  ReactQueryProvider,
  invalidateTransactions,
  invalidateAccounts,
  invalidateAuth,
  clearAllCaches,
  prefetchTransactions,
  setTransactionData,
  getCachedTransactionData,
  removeTransactionFromCache,
  isQueryError,
  getQueryErrorMessage,
  isLoadingState,
  isErrorState,
  isSuccessState,
  warmCache,
  getNetworkStatus,
}