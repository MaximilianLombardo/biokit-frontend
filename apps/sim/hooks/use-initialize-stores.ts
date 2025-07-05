'use client'

import { useEffect, useRef } from 'react'
import { useAdapters } from '@/contexts/adapters-context'
import { useWorkflowStore } from '@/stores/workflows/workflow/store'
import { useUnifiedWorkflowRegistry } from '@/stores/workflows/unified-registry'

/**
 * Hook to initialize stores with adapters.
 * This should be called once at the app root level.
 */
export function useInitializeStores() {
  const { persistence, collaboration, auth } = useAdapters()
  const initialized = useRef(false)
  
  useEffect(() => {
    // Prevent double initialization in development
    if (initialized.current) return
    initialized.current = true
    
    console.log('[InitializeStores] Setting up adapters for stores')
    
    // Initialize workflow registry with persistence adapter
    useUnifiedWorkflowRegistry.getState().setPersistence(persistence)
    
    // Load workflows on initialization
    useUnifiedWorkflowRegistry.getState().loadWorkflows().catch(error => {
      console.error('[InitializeStores] Failed to load workflows:', error)
    })
    
    // Set up collaboration listeners if available
    if (collaboration) {
      // Listen for remote block updates
      collaboration.onBlockUpdate((update) => {
        console.log('[InitializeStores] Received remote block update:', update)
        
        // TODO: [FUTURE] Update the workflow store with remote changes
        // This requires modifying the workflow store to handle external updates
        // without triggering infinite loops
        
        // Example implementation:
        // useWorkflowStore.getState().applyRemoteBlockUpdate(
        //   update.blockId,
        //   update.changes,
        //   update.userId
        // )
      })
      
      // Listen for remote block deletions
      collaboration.onBlockDelete((data) => {
        console.log('[InitializeStores] Received remote block deletion:', data)
        
        // TODO: [FUTURE] Remove block from workflow store
        // useWorkflowStore.getState().applyRemoteBlockDelete(
        //   data.blockId,
        //   data.userId
        // )
      })
      
      // Listen for remote edge updates
      collaboration.onEdgeUpdate((update) => {
        console.log('[InitializeStores] Received remote edge update:', update)
        
        // TODO: [FUTURE] Update edges in workflow store
        // useWorkflowStore.getState().applyRemoteEdgeUpdate(
        //   update.edge,
        //   update.action,
        //   update.userId
        // )
      })
      
      // Listen for user presence updates
      collaboration.onUserPresence((users) => {
        console.log('[InitializeStores] User presence update:', users.length, 'users')
        
        // TODO: [FUTURE] Update presence store or UI
        // usePresenceStore.getState().setUsers(users)
      })
    }
    
    // Set up auth state listener
    if (auth.onAuthStateChange) {
      const unsubscribe = auth.onAuthStateChange((user) => {
        console.log('[InitializeStores] Auth state changed:', user?.email || 'logged out')
        
        // TODO: [FUTURE] Update user store or trigger navigation
        // if (!user && requiresAuth) {
        //   router.push('/login')
        // }
      })
      
      // Cleanup on unmount
      return () => {
        unsubscribe()
      }
    }
  }, [persistence, collaboration, auth])
  
  // TODO: [FUTURE] Return loading state while stores are initializing
  // For now, initialization is synchronous
  return { initialized: true }
}