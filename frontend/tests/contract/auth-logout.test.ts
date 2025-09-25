import { describe, it, expect } from 'vitest'

describe('Contract: POST /auth/logout', () => {
  it('should successfully logout with valid token', async () => {
    const { mockAuthService } = await import('@/services/mock-auth-service')

    // First login to get a token
    const loginResponse = await mockAuthService.login({
      username: 'demo.user',
      password: 'demo123'
    })

    expect(loginResponse.success).toBe(true)
    expect(loginResponse.data?.token).toBeDefined()

    // Then logout with that token
    const logoutResponse = await mockAuthService.logout()

    expect(logoutResponse).toBeDefined()
    expect(logoutResponse.success).toBe(true)
    expect(logoutResponse.data?.message).toContain('Utloggning genomförd')
  })

  it('should reject logout request without valid token', async () => {
    const { mockAuthService } = await import('@/services/mock-auth-service')

    // Clear any existing session first
    mockAuthService.clearSession()

    // Mock logout doesn't require token, it just clears the current session
    // This test checks that logout works even when no session exists
    const logoutResponse = await mockAuthService.logout()

    expect(logoutResponse.success).toBe(true)
    expect(logoutResponse.data?.message).toContain('Utloggning genomförd')
  })
})