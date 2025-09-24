import { describe, it, expect } from 'vitest'

describe('Contract: POST /auth/login', () => {
  it('should accept LoginRequest with username and password', async () => {
    const loginRequest = {
      username: 'demo.user',
      password: 'demo123'
    }

    // This test will fail until mock auth service is implemented
    const mockAuthService = await import('@/services/mock-auth-service')
    const response = await mockAuthService.login(loginRequest)

    expect(response).toBeDefined()
    expect(response.token).toBeTypeOf('string')
    expect(response.user).toBeDefined()
    expect(response.user.username).toBe(loginRequest.username)
    expect(response.expiresIn).toBeTypeOf('number')
  })

  it('should reject invalid credentials with 401 error', async () => {
    const invalidRequest = {
      username: 'wronguser',
      password: 'wrongpass'
    }

    const mockAuthService = await import('@/services/mock-auth-service')

    await expect(mockAuthService.login(invalidRequest)).rejects.toThrow('Invalid credentials')
  })

  it('should validate request format and reject malformed requests', async () => {
    const malformedRequest = {
      username: '', // Invalid: empty username
      password: '12' // Invalid: too short password
    }

    const mockAuthService = await import('@/services/mock-auth-service')

    await expect(mockAuthService.login(malformedRequest)).rejects.toThrow('Invalid request format')
  })
})