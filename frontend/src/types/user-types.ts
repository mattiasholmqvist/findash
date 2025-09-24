/**
 * User entity and authentication types
 * Constitutional compliance: TypeScript strict typing, kebab-case filename
 */

export enum UserRole {
  VIEWER = 'VIEWER',         // Read-only access
  ACCOUNTANT = 'ACCOUNTANT', // Full accounting access
  CONTROLLER = 'CONTROLLER'  // Management oversight access
}

export interface User {
  readonly id: string // UUID format
  readonly username: string // Unique username for login
  readonly email: string // User email address
  readonly firstName: string // User first name
  readonly lastName: string // User last name
  readonly role: UserRole
  readonly isActive: boolean // Account status
  readonly lastLoginAt?: string // Last successful login timestamp (ISO 8601)
  readonly createdAt: string // Account creation timestamp (ISO 8601)
}

export interface LoginRequest {
  readonly username: string
  readonly password: string
}

export interface LoginResponse {
  readonly token: string // JWT authentication token
  readonly user: User
  readonly expiresIn: number // Token expiration time in seconds
}

export interface LogoutResponse {
  readonly message: string
}

export interface AuthError {
  readonly error: string
  readonly message: string
  readonly details?: Record<string, unknown>
  readonly timestamp: string
}

export interface UserSession {
  readonly token: string
  readonly user: User
  readonly expiresAt: Date
  readonly refreshToken?: string
}

export interface AuthState {
  readonly isAuthenticated: boolean
  readonly isLoading: boolean
  readonly user: User | null
  readonly session: UserSession | null
  readonly error: string | null
}

// Validation functions
export const validateLoginRequest = (request: Partial<LoginRequest>): string[] => {
  const errors: string[] = []

  if (!request.username) {
    errors.push('Användarnamn krävs') // Username required
  } else if (request.username.length < 3 || request.username.length > 30) {
    errors.push('Användarnamn måste vara 3-30 tecken') // Username must be 3-30 characters
  } else if (!/^[a-zA-Z0-9_.]+$/.test(request.username)) {
    errors.push('Användarnamn får endast innehålla bokstäver, siffror, punkt och underscore') // Username can only contain letters, numbers, dot and underscore
  }

  if (!request.password) {
    errors.push('Lösenord krävs') // Password required
  } else if (request.password.length < 6) {
    errors.push('Lösenordet måste vara minst 6 tecken') // Password must be at least 6 characters
  } else if (request.password.length > 100) {
    errors.push('Lösenordet får inte vara längre än 100 tecken') // Password cannot be longer than 100 characters
  }

  return errors
}

export const validateUser = (user: Partial<User>): string[] => {
  const errors: string[] = []

  if (!user.id || !isValidUUID(user.id)) {
    errors.push('ID must be a valid UUID')
  }

  if (!user.username || user.username.length < 3 || user.username.length > 30) {
    errors.push('Username must be 3-30 characters')
  }

  if (!user.email || !isValidEmail(user.email)) {
    errors.push('Valid email address is required')
  }

  if (!user.firstName || user.firstName.length < 1 || user.firstName.length > 50) {
    errors.push('First name must be 1-50 characters')
  }

  if (!user.lastName || user.lastName.length < 1 || user.lastName.length > 50) {
    errors.push('Last name must be 1-50 characters')
  }

  if (!user.role || !Object.values(UserRole).includes(user.role)) {
    errors.push('Valid user role is required')
  }

  if (typeof user.isActive !== 'boolean') {
    errors.push('Active status must be a boolean')
  }

  return errors
}

const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Session management utilities
export const isSessionValid = (session: UserSession): boolean => {
  return session.expiresAt > new Date()
}

export const getSessionTimeRemaining = (session: UserSession): number => {
  const now = new Date().getTime()
  const expires = session.expiresAt.getTime()
  return Math.max(0, expires - now)
}

export const createSessionFromLoginResponse = (loginResponse: LoginResponse): UserSession => {
  const expiresAt = new Date(Date.now() + (loginResponse.expiresIn * 1000))

  return {
    token: loginResponse.token,
    user: loginResponse.user,
    expiresAt
  }
}

// Default test users for mock authentication
export const getDefaultTestUsers = (): User[] => [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    username: 'demo.user',
    email: 'demo@findash.se',
    firstName: 'Demo',
    lastName: 'Användare',
    role: UserRole.ACCOUNTANT,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    username: 'test.controller',
    email: 'controller@findash.se',
    firstName: 'Test',
    lastName: 'Controller',
    role: UserRole.CONTROLLER,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    username: 'viewer.test',
    email: 'viewer@findash.se',
    firstName: 'View',
    lastName: 'User',
    role: UserRole.VIEWER,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
]

// Role-based permissions
export const getUserPermissions = (role: UserRole): string[] => {
  const basePermissions = ['view_transactions', 'view_accounts']

  switch (role) {
    case UserRole.VIEWER:
      return basePermissions

    case UserRole.ACCOUNTANT:
      return [
        ...basePermissions,
        'create_transactions',
        'edit_transactions',
        'view_reports',
        'configure_mock_data'
      ]

    case UserRole.CONTROLLER:
      return [
        ...basePermissions,
        'view_reports',
        'view_analytics',
        'manage_users',
        'configure_system'
      ]

    default:
      return basePermissions
  }
}