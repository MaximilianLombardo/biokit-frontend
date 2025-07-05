/**
 * Local authentication provider for development.
 * Always returns authenticated with a mock user.
 * 
 * TODO: [MOCK] This is a mock implementation
 * FUTURE: Integrate with NextAuth.js or similar auth provider
 */

import type { IAuthProvider, User } from '../interfaces'

const MOCK_USER: User = {
  id: 'local-user-123',
  email: 'developer@biokit.local',
  name: 'Local Developer',
  role: 'admin', // Admin in local mode for full access
}

export class LocalAuthProvider implements IAuthProvider {
  private currentUser: User | null = MOCK_USER
  private authStateCallbacks: Array<(user: User | null) => void> = []

  constructor() {
    if (process.env.NODE_ENV === 'development') {
      console.log('[LocalAuth] Initialized with mock user:', MOCK_USER)
    }
  }

  // ============================================================================
  // User State
  // ============================================================================

  getCurrentUser(): User | null {
    // TODO: [MOCK] Always return the mock user
    // FUTURE: Get from auth session
    return this.currentUser
  }

  isAuthenticated(): boolean {
    // TODO: [MOCK] Always authenticated in local mode
    // FUTURE: Check real auth session
    return true
  }

  // ============================================================================
  // Authentication Actions
  // ============================================================================

  async login(credentials: {
    email: string
    password: string
  }): Promise<User> {
    // TODO: [MOCK] Accept any credentials in local mode
    // FUTURE: Validate with auth provider
    if (process.env.NODE_ENV === 'development') {
      console.log('[LocalAuth] Mock login with:', credentials.email)
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Update mock user with provided email
    this.currentUser = {
      ...MOCK_USER,
      email: credentials.email,
    }
    
    // Notify listeners
    this.notifyAuthStateChange(this.currentUser)
    
    return this.currentUser
  }

  async logout(): Promise<void> {
    // TODO: [MOCK] Clear mock session
    // FUTURE: Clear real auth session
    if (process.env.NODE_ENV === 'development') {
      console.log('[LocalAuth] Mock logout')
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    this.currentUser = null
    this.notifyAuthStateChange(null)
  }

  // ============================================================================
  // OAuth Providers (Not implemented in local mode)
  // ============================================================================

  async loginWithProvider(provider: 'google' | 'github' | 'microsoft'): Promise<User> {
    // TODO: [MOCK] Simulate OAuth login
    // FUTURE: Implement real OAuth flow
    if (process.env.NODE_ENV === 'development') {
      console.log('[LocalAuth] Mock OAuth login with:', provider)
    }
    
    // Simulate OAuth redirect delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    this.currentUser = {
      ...MOCK_USER,
      email: `user@${provider}.local`,
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
    }
    
    this.notifyAuthStateChange(this.currentUser)
    return this.currentUser
  }

  // ============================================================================
  // Registration (Instant in local mode)
  // ============================================================================

  async register(data: {
    email: string
    password: string
    name?: string
  }): Promise<User> {
    // TODO: [MOCK] Create user instantly
    // FUTURE: Create real user account
    if (process.env.NODE_ENV === 'development') {
      console.log('[LocalAuth] Mock register:', data.email)
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    this.currentUser = {
      ...MOCK_USER,
      email: data.email,
      name: data.name || 'New User',
    }
    
    this.notifyAuthStateChange(this.currentUser)
    return this.currentUser
  }

  // ============================================================================
  // Password Reset (No-op in local mode)
  // ============================================================================

  async requestPasswordReset(email: string): Promise<void> {
    // TODO: [MOCK] Log request but don't send email
    // FUTURE: Send real password reset email
    if (process.env.NODE_ENV === 'development') {
      console.log('[LocalAuth] Mock password reset requested for:', email)
    }
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // TODO: [MOCK] Log reset but don't change anything
    // FUTURE: Validate token and update password
    if (process.env.NODE_ENV === 'development') {
      console.log('[LocalAuth] Mock password reset with token:', token)
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // ============================================================================
  // Authorization (All permissions granted in local mode)
  // ============================================================================

  hasPermission(resource: string, action: string): boolean {
    // TODO: [MOCK] Grant all permissions in local mode
    // FUTURE: Check real permissions from user roles
    if (process.env.NODE_ENV === 'development') {
      // Log permission checks occasionally
      const now = Date.now()
      if (!this.lastPermissionLog || now - this.lastPermissionLog > 5000) {
        console.log('[LocalAuth] Permission check (always granted):', { resource, action })
        this.lastPermissionLog = now
      }
    }
    
    return true
  }
  
  private lastPermissionLog?: number

  hasWorkspacePermission(workspaceId: string, permission: string): boolean {
    // TODO: [MOCK] Grant all workspace permissions
    // FUTURE: Check workspace membership and roles
    return true
  }

  // ============================================================================
  // Session Management
  // ============================================================================

  async refreshSession(): Promise<void> {
    // TODO: [MOCK] No-op in local mode
    // FUTURE: Refresh auth tokens
    if (process.env.NODE_ENV === 'development') {
      console.log('[LocalAuth] Mock session refresh')
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    // TODO: [MOCK] Add callback to list
    // FUTURE: Subscribe to auth provider events
    this.authStateCallbacks.push(callback)
    
    // Immediately call with current user
    callback(this.currentUser)
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateCallbacks.indexOf(callback)
      if (index > -1) {
        this.authStateCallbacks.splice(index, 1)
      }
    }
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private notifyAuthStateChange(user: User | null): void {
    this.authStateCallbacks.forEach(callback => {
      try {
        callback(user)
      } catch (error) {
        console.error('[LocalAuth] Error in auth state callback:', error)
      }
    })
  }
}