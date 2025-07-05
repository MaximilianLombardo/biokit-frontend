/**
 * Adapter interfaces for the unified store architecture.
 * These interfaces define contracts for external dependencies,
 * allowing us to swap implementations for local vs enterprise modes.
 */

import type { Edge } from 'reactflow'
import type { BlockState, WorkflowState } from '@/stores/workflows/workflow/types'

// ============================================================================
// Data Types
// ============================================================================

export interface Workflow {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  folderId?: string
  isPublic?: boolean
  tags?: string[]
}

export interface WorkflowContent {
  blocks: Record<string, BlockState>
  edges: Edge[]
  loops?: Record<string, any>
  parallels?: Record<string, any>
}

export interface DeploymentConfig {
  schedule?: string
  webhookUrl?: string
  apiKey?: string
  environment?: Record<string, string>
}

export interface ExecutionLog {
  id: string
  workflowId: string
  status: 'running' | 'completed' | 'failed'
  startedAt: Date
  completedAt?: Date
  logs: string[]
  error?: string
}

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  role?: 'user' | 'admin'
}

export interface PresenceUser extends User {
  cursor?: { x: number; y: number }
  selection?: string[]
  color: string
}

// ============================================================================
// Persistence Interface
// ============================================================================

/**
 * Interface for workflow persistence operations.
 * Implementations can use localStorage, IndexedDB, PostgreSQL, etc.
 */
export interface IWorkflowPersistence {
  // Workflow CRUD operations
  createWorkflow(data: {
    name: string
    description?: string
    folderId?: string
  }): Promise<{ id: string; workflow: Workflow }>
  
  getWorkflow(id: string): Promise<Workflow | null>
  
  updateWorkflow(id: string, data: Partial<Workflow>): Promise<void>
  
  deleteWorkflow(id: string): Promise<void>
  
  listWorkflows(options?: {
    folderId?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<Workflow[]>
  
  // Workflow content operations
  getWorkflowContent(workflowId: string): Promise<WorkflowContent | null>
  
  saveWorkflowContent(workflowId: string, content: WorkflowContent): Promise<void>
  
  // Optional: Deployment and execution (can be null for local mode)
  deployWorkflow?(workflowId: string, config: DeploymentConfig): Promise<void>
  
  getDeploymentStatus?(workflowId: string): Promise<{
    isDeployed: boolean
    deployedAt?: Date
    config?: DeploymentConfig
  }>
  
  getExecutionLogs?(workflowId: string, limit?: number): Promise<ExecutionLog[]>
  
  // Optional: Import/Export
  exportWorkflow?(workflowId: string): Promise<string> // JSON string
  
  importWorkflow?(jsonData: string): Promise<{ id: string; workflow: Workflow }>
}

// ============================================================================
// Collaboration Interface
// ============================================================================

/**
 * Interface for real-time collaboration features.
 * Implementations can use WebSocket, WebRTC, YJS, etc.
 */
export interface ICollaborationProvider {
  // Connection management
  connect(workflowId: string): Promise<void>
  
  disconnect(): Promise<void>
  
  isConnected(): boolean
  
  // Real-time updates for blocks
  onBlockUpdate(callback: (update: {
    blockId: string
    changes: Partial<BlockState>
    userId: string
  }) => void): void
  
  onBlockDelete(callback: (data: {
    blockId: string
    userId: string
  }) => void): void
  
  sendBlockUpdate(blockId: string, changes: Partial<BlockState>): void
  
  sendBlockDelete(blockId: string): void
  
  // Real-time updates for edges
  onEdgeUpdate(callback: (update: {
    edge: Edge
    action: 'add' | 'update' | 'delete'
    userId: string
  }) => void): void
  
  sendEdgeUpdate(edge: Edge, action: 'add' | 'update' | 'delete'): void
  
  // User presence
  onUserPresence(callback: (users: PresenceUser[]) => void): void
  
  updateCursor(position: { x: number; y: number } | null): void
  
  updateSelection(blockIds: string[]): void
  
  // Optional: Conflict resolution (for YJS-based implementations)
  resolveConflict?(localState: any, remoteState: any): any
  
  // Optional: Offline support
  queueUpdate?(update: any): void
  
  flushQueue?(): Promise<void>
}

// ============================================================================
// Authentication Interface
// ============================================================================

/**
 * Interface for authentication and authorization.
 * Implementations can use NextAuth, Auth0, Supabase Auth, etc.
 */
export interface IAuthProvider {
  // Current user state
  getCurrentUser(): User | null
  
  isAuthenticated(): boolean
  
  // Authentication actions
  login(credentials: {
    email: string
    password: string
  }): Promise<User>
  
  logout(): Promise<void>
  
  // Optional: OAuth providers
  loginWithProvider?(provider: 'google' | 'github' | 'microsoft'): Promise<User>
  
  // Optional: Registration
  register?(data: {
    email: string
    password: string
    name?: string
  }): Promise<User>
  
  // Optional: Password reset
  requestPasswordReset?(email: string): Promise<void>
  
  resetPassword?(token: string, newPassword: string): Promise<void>
  
  // Authorization
  hasPermission(resource: string, action: string): boolean
  
  // Optional: For workspace-based permissions
  hasWorkspacePermission?(workspaceId: string, permission: string): boolean
  
  // Session management
  refreshSession?(): Promise<void>
  
  onAuthStateChange?(callback: (user: User | null) => void): () => void
}

// ============================================================================
// Feature Detection
// ============================================================================

/**
 * Feature flags based on current mode (local vs enterprise)
 */
export interface Features {
  // Core features
  workflows: boolean
  collaboration: boolean
  deployment: boolean
  
  // Enterprise features
  workspaces: boolean
  billing: boolean
  teams: boolean
  audit: boolean
  
  // Advanced features
  webhooks: boolean
  scheduling: boolean
  apiAccess: boolean
  customDomains: boolean
}

// ============================================================================
// Adapter Factory Types
// ============================================================================

/**
 * Configuration for creating adapters
 */
export interface AdapterConfig {
  mode: 'local' | 'enterprise'
  apiUrl?: string
  wsUrl?: string
  authProvider?: 'nextauth' | 'auth0' | 'supabase'
  features?: Partial<Features>
}

/**
 * Collection of all adapters
 */
export interface Adapters {
  persistence: IWorkflowPersistence
  collaboration: ICollaborationProvider
  auth: IAuthProvider
  features: Features
}