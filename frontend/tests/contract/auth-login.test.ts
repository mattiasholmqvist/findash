import { describe, it, expect } from 'vitest'

describe('Contract: POST /auth/login', () => {
  it('should accept LoginRequest with username and password', async () => {
    const loginRequest = {
      username: 'demo.user',
      password: 'demo123'
    }

    const { mockAuthService } = await import('@/services/mock-auth-service')
    const response = await mockAuthService.login(loginRequest)

    expect(response).toBeDefined()
    expect(response.success).toBe(true)
    expect(response.data).toBeDefined()
    expect(response.data?.token).toBeTypeOf('string')
    expect(response.data?.user).toBeDefined()
    expect(response.data?.user.username).toBe(loginRequest.username)
    expect(response.data?.expiresIn).toBeTypeOf('number')
  })

  it('should reject invalid credentials with 401 error', async () => {
    const invalidRequest = {
      username: 'wronguser',
      password: 'wrongpass'
    }

    const { mockAuthService } = await import('@/services/mock-auth-service')
    const response = await mockAuthService.login(invalidRequest)

    expect(response.success).toBe(false)
    expect(response.error).toBeDefined()
    expect(response.error?.message).toContain('Felaktigt användarnamn eller lösenord')
  })

  it('should validate request format and reject malformed requests', async () => {
    const malformedRequest = {
      username: '', // Invalid: empty username
      password: '12' // Invalid: too short password
    }

    const { mockAuthService } = await import('@/services/mock-auth-service')
    const response = await mockAuthService.login(malformedRequest)

    expect(response.success).toBe(false)
    expect(response.error).toBeDefined()
    expect(response.error?.message).toContain('Användarnamn krävs')
  })
})