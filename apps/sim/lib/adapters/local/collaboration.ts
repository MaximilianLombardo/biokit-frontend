/**
 * No-op collaboration provider for local development.
 * This implementation satisfies the interface but doesn't provide real-time features.
 * 
 * TODO: [MOCK] This is a mock implementation with no real functionality
 * FUTURE: Implement with YJS for real-time collaboration
 */

import type { 
  ICollaborationProvider, 
  PresenceUser 
} from '../interfaces'
import type { Edge } from 'reactflow'
import type { BlockState } from '@/stores/workflows/workflow/types'

export class NoOpCollaborationProvider implements ICollaborationProvider {
  private isConnectedFlag = false
  private workflowId: string | null = null
  
  // Store callbacks for potential future use
  private callbacks = {
    blockUpdate: [] as Array<(update: any) => void>,
    blockDelete: [] as Array<(data: any) => void>,
    edgeUpdate: [] as Array<(update: any) => void>,
    userPresence: [] as Array<(users: PresenceUser[]) => void>,
  }

  async connect(workflowId: string): Promise<void> {
    // TODO: [MOCK] Simulating connection
    // FUTURE: Establish WebSocket or YJS connection
    this.workflowId = workflowId
    this.isConnectedFlag = true
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[NoOpCollaboration] Mock connect to workflow:', workflowId)
    }
  }

  async disconnect(): Promise<void> {
    // TODO: [MOCK] Simulating disconnection
    // FUTURE: Close WebSocket or YJS connection
    this.isConnectedFlag = false
    this.workflowId = null
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[NoOpCollaboration] Mock disconnect')
    }
  }

  isConnected(): boolean {
    return this.isConnectedFlag
  }

  // ============================================================================
  // Block Updates (No-op in local mode)
  // ============================================================================

  onBlockUpdate(callback: (update: {
    blockId: string
    changes: Partial<BlockState>
    userId: string
  }) => void): void {
    // TODO: [MOCK] Store callback but never call it
    // FUTURE: Register YJS observer for block changes
    this.callbacks.blockUpdate.push(callback)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[NoOpCollaboration] Registered block update callback (no-op)')
    }
  }

  onBlockDelete(callback: (data: {
    blockId: string
    userId: string
  }) => void): void {
    // TODO: [MOCK] Store callback but never call it
    // FUTURE: Register YJS observer for block deletion
    this.callbacks.blockDelete.push(callback)
  }

  sendBlockUpdate(blockId: string, changes: Partial<BlockState>): void {
    // TODO: [MOCK] Log the update but don't send anywhere
    // FUTURE: Update YJS document with changes
    if (process.env.NODE_ENV === 'development') {
      console.log('[NoOpCollaboration] Mock send block update:', { blockId, changes })
    }
  }

  sendBlockDelete(blockId: string): void {
    // TODO: [MOCK] Log the deletion but don't send anywhere
    // FUTURE: Remove from YJS document
    if (process.env.NODE_ENV === 'development') {
      console.log('[NoOpCollaboration] Mock send block delete:', blockId)
    }
  }

  // ============================================================================
  // Edge Updates (No-op in local mode)
  // ============================================================================

  onEdgeUpdate(callback: (update: {
    edge: Edge
    action: 'add' | 'update' | 'delete'
    userId: string
  }) => void): void {
    // TODO: [MOCK] Store callback but never call it
    // FUTURE: Register YJS observer for edge changes
    this.callbacks.edgeUpdate.push(callback)
  }

  sendEdgeUpdate(edge: Edge, action: 'add' | 'update' | 'delete'): void {
    // TODO: [MOCK] Log the update but don't send anywhere
    // FUTURE: Update YJS document with edge changes
    if (process.env.NODE_ENV === 'development') {
      console.log('[NoOpCollaboration] Mock send edge update:', { edge: edge.id, action })
    }
  }

  // ============================================================================
  // User Presence (No-op in local mode)
  // ============================================================================

  onUserPresence(callback: (users: PresenceUser[]) => void): void {
    // TODO: [MOCK] Immediately call with empty array (no other users in local mode)
    // FUTURE: Register YJS awareness observer
    this.callbacks.userPresence.push(callback)
    
    // In local mode, there are no other users
    setTimeout(() => callback([]), 0)
  }

  updateCursor(position: { x: number; y: number } | null): void {
    // TODO: [MOCK] Log cursor update but don't broadcast
    // FUTURE: Update YJS awareness with cursor position
    if (process.env.NODE_ENV === 'development' && position) {
      // Only log occasionally to avoid spam
      const now = Date.now()
      if (!this.lastCursorLog || now - this.lastCursorLog > 1000) {
        console.log('[NoOpCollaboration] Mock cursor update:', position)
        this.lastCursorLog = now
      }
    }
  }
  
  private lastCursorLog?: number

  updateSelection(blockIds: string[]): void {
    // TODO: [MOCK] Log selection but don't broadcast
    // FUTURE: Update YJS awareness with selection
    if (process.env.NODE_ENV === 'development' && blockIds.length > 0) {
      console.log('[NoOpCollaboration] Mock selection update:', blockIds)
    }
  }

  // ============================================================================
  // Optional Methods (Not implemented in no-op version)
  // ============================================================================

  resolveConflict(localState: any, remoteState: any): any {
    // TODO: [MOCK] In local mode, always prefer local state
    // FUTURE: Implement CRDT-based conflict resolution with YJS
    return localState
  }

  queueUpdate(update: any): void {
    // TODO: [MOCK] Log queued update (no offline support in local mode)
    // FUTURE: Queue updates for offline sync
    if (process.env.NODE_ENV === 'development') {
      console.warn('[NoOpCollaboration] Offline queue not supported in local mode:', update)
    }
  }

  async flushQueue(): Promise<void> {
    // TODO: [MOCK] No queue to flush in local mode
    // FUTURE: Flush queued updates when coming back online
    if (process.env.NODE_ENV === 'development') {
      console.log('[NoOpCollaboration] No queue to flush in local mode')
    }
  }
}