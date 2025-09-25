/**
 * Mock authentication service for development and testing
 * Constitutional compliance: TypeScript strict typing, kebab-case filename
 */

import { User, LoginRequest, LoginResponse, LogoutResponse, AuthError, UserSession, createSessionFromLoginResponse, getDefaultTestUsers, validateLoginRequest } from '@/types/user-types'
import { ApiResponse, createApiError } from '@/types/api-types'

export interface MockAuthConfig {
  sessionDurationHours: number
  autoLoginEnabled: boolean
  defaultUsername?: string
}

export class MockAuthService {
  private static readonly STORAGE_KEY = 'findash_auth_session'
  private config: MockAuthConfig
  private testUsers: User[]

  constructor(config: MockAuthConfig = { sessionDurationHours: 8, autoLoginEnabled: false }) {
    this.config = config
    this.testUsers = getDefaultTestUsers()
  }

  async login(request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    // Simulate network delay
    await this.simulateNetworkDelay()

    // Validate request
    const validationErrors = validateLoginRequest(request)
    if (validationErrors.length > 0) {
      return createApiError('VALIDATION_ERROR', validationErrors.join(', '))
    }

    // Find user
    const user = this.testUsers.find(u => u.username === request.username)
    if (!user) {
      return createApiError('INVALID_CREDENTIALS', 'Felaktigt användarnamn eller lösenord')
    }

    // Validate password (mock validation - in real app would hash/compare)
    if (!this.validatePassword(request.password, user)) {
      return createApiError('INVALID_CREDENTIALS', 'Felaktigt användarnamn eller lösenord')
    }

    // Check if account is active
    if (!user.isActive) {
      return createApiError('ACCOUNT_DISABLED', 'Kontot är inaktiverat')
    }

    // Generate mock JWT token
    const token = this.generateMockJWTToken(user)
    const expiresIn = this.config.sessionDurationHours * 3600

    // Update last login
    const updatedUser: User = {
      ...user,
      lastLoginAt: new Date().toISOString()
    }

    const loginResponse: LoginResponse = {
      token,
      user: updatedUser,
      expiresIn
    }

    // Store session in localStorage
    const session = createSessionFromLoginResponse(loginResponse)
    this.storeSession(session)

    return {
      data: loginResponse,
      success: true,
      timestamp: new Date().toISOString()
    }
  }

  async logout(): Promise<ApiResponse<LogoutResponse>> {
    // Simulate network delay
    await this.simulateNetworkDelay()

    // Clear stored session
    this.clearSession()

    const logoutResponse: LogoutResponse = {
      message: 'Utloggning genomförd'
    }

    return {
      data: logoutResponse,
      success: true,
      timestamp: new Date().toISOString()
    }
  }

  getCurrentSession(): UserSession | null {
    const storedSession = localStorage.getItem(MockAuthService.STORAGE_KEY)
    if (!storedSession) {
      return null
    }

    try {
      const parsed = JSON.parse(storedSession)
      const session: UserSession = {
        ...parsed,
        expiresAt: new Date(parsed.expiresAt)
      }

      // Check if session is still valid
      if (session.expiresAt <= new Date()) {
        this.clearSession()
        return null
      }

      return session
    } catch {
      this.clearSession()
      return null
    }
  }

  isAuthenticated(): boolean {
    const session = this.getCurrentSession()
    return session !== null
  }

  getCurrentUser(): User | null {
    const session = this.getCurrentSession()
    return session?.user || null
  }

  async refreshSession(): Promise<ApiResponse<LoginResponse>> {
    const currentSession = this.getCurrentSession()
    if (!currentSession) {
      return createApiError('NO_SESSION', 'Ingen aktiv session')
    }

    // Simulate network delay
    await this.simulateNetworkDelay()

    // Generate new token with extended expiry
    const token = this.generateMockJWTToken(currentSession.user)
    const expiresIn = this.config.sessionDurationHours * 3600

    const refreshResponse: LoginResponse = {
      token,
      user: currentSession.user,
      expiresIn
    }

    const newSession = createSessionFromLoginResponse(refreshResponse)
    this.storeSession(newSession)

    return {
      data: refreshResponse,
      success: true,
      timestamp: new Date().toISOString()
    }
  }

  // Auto-login for development convenience
  async autoLogin(): Promise<ApiResponse<LoginResponse> | null> {
    if (!this.config.autoLoginEnabled) {
      return null
    }

    const defaultUser = this.config.defaultUsername
      ? this.testUsers.find(u => u.username === this.config.defaultUsername)
      : this.testUsers[0] // Use first test user

    if (!defaultUser) {
      return null
    }

    return this.login({
      username: defaultUser.username,
      password: 'demo123' // Default password for all test users
    })
  }

  // Development utilities
  getTestUsers(): User[] {
    return this.testUsers
  }

  setTestUsers(users: User[]): void {
    this.testUsers = users
  }

  updateConfig(config: Partial<MockAuthConfig>): void {
    this.config = { ...this.config, ...config }
  }

  private validatePassword(password: string, user: User): boolean {
    // In a real app, this would hash the password and compare
    // For mock service, we accept a simple password based on username
    const validPasswords = [
      'demo123',
      'password',
      user.username
    ]
    return validPasswords.includes(password)
  }

  private generateMockJWTToken(user: User): string {
    // Generate a mock JWT-like token for development
    const header = { alg: 'HS256', typ: 'JWT' }
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (this.config.sessionDurationHours * 3600)
    }

    // Base64 encode (not secure, just for development)
    const encodedHeader = btoa(JSON.stringify(header))
    const encodedPayload = btoa(JSON.stringify(payload))
    const signature = btoa(`mock_signature_${user.id}_${Date.now()}`)

    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  private storeSession(session: UserSession): void {
    const sessionData = {
      ...session,
      expiresAt: session.expiresAt.toISOString()
    }
    localStorage.setItem(MockAuthService.STORAGE_KEY, JSON.stringify(sessionData))
  }

  private clearSession(): void {
    localStorage.removeItem(MockAuthService.STORAGE_KEY)
  }

  private async simulateNetworkDelay(): Promise<void> {
    const delay = 200 + Math.random() * 300 // 200-500ms delay
    return new Promise(resolve => setTimeout(resolve, delay))
  }
}

// Singleton instance for application use
export const mockAuthService = new MockAuthService({
  sessionDurationHours: 8,
  autoLoginEnabled: import.meta.env.MODE === 'development',
  defaultUsername: 'demo.user'
})

// Export types for external use
export type { MockAuthConfig }