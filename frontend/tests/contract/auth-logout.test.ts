import { describe, it, expect } from 'vitest'

describe('Contract: POST /auth/logout', () => {
  it('should successfully logout with valid token', async () => {
    const mockAuthService = await import('@/services/mock-auth-service')

    // First login to get a token
    const loginResponse = await mockAuthService.login({
      username: 'demo.user',
      password: 'demo123'
    })

    // Then logout with that token
    const logoutResponse = await mockAuthService.logout(loginResponse.token)

    expect(logoutResponse).toBeDefined()
    expect(logoutResponse.message).toBe('Successfully logged out')
  })

  it('should reject logout request without valid token', async () => {
    const mockAuthService = await import('@/services/mock-auth-service')

    await expect(mockAuthService.logout('')).rejects.toThrow('Unauthorized')
    await expect(mockAuthService.logout('invalid-token')).rejects.toThrow('Unauthorized')
  })
})