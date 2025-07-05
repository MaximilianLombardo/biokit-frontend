/**
 * Unified workflow registry that uses persistence adapters.
 * This replaces the complex registry store with a simpler implementation
 * that works with both local and enterprise modes.
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { IWorkflowPersistence, Workflow, WorkflowContent } from '@/lib/adapters/interfaces'
import { useWorkflowStore } from './workflow/store'
import { useSubBlockStore } from './subblock/store'

interface UnifiedWorkflowRegistry {
  // State
  workflows: Workflow[]
  activeWorkflowId: string | null
  isLoading: boolean
  error: string | null
  
  // Adapter reference
  persistence: IWorkflowPersistence | null
  
  // Actions
  setPersistence: (persistence: IWorkflowPersistence) => void
  loadWorkflows: () => Promise<void>
  createWorkflow: (data?: { name?: string; description?: string }) => Promise<string>
  updateWorkflow: (id: string, data: Partial<Workflow>) => Promise<void>
  deleteWorkflow: (id: string) => Promise<void>
  setActiveWorkflow: (id: string | null) => void
  
  // Content operations
  loadWorkflowContent: (id: string) => Promise<void>
  saveWorkflowContent: (id: string) => Promise<void>
}

export const useUnifiedWorkflowRegistry = create<UnifiedWorkflowRegistry>()(
  devtools(
    (set, get) => ({
      // Initial state
      workflows: [],
      activeWorkflowId: null,
      isLoading: false,
      error: null,
      persistence: null,
      
      // Set persistence adapter
      setPersistence: (persistence) => {
        set({ persistence })
        console.log('[UnifiedRegistry] Persistence adapter set')
      },
      
      // Load all workflows
      loadWorkflows: async () => {
        const { persistence } = get()
        if (!persistence) {
          console.error('[UnifiedRegistry] No persistence adapter set')
          return
        }
        
        set({ isLoading: true, error: null })
        
        try {
          const workflows = await persistence.listWorkflows()
          set({ workflows, isLoading: false })
          console.log(`[UnifiedRegistry] Loaded ${workflows.length} workflows`)
        } catch (error) {
          console.error('[UnifiedRegistry] Failed to load workflows:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load workflows',
            isLoading: false 
          })
        }
      },
      
      // Create new workflow
      createWorkflow: async (data) => {
        const { persistence } = get()
        if (!persistence) {
          throw new Error('No persistence adapter set')
        }
        
        try {
          const { id, workflow } = await persistence.createWorkflow({
            name: data?.name || 'New Workflow',
            description: data?.description,
          })
          
          // Add to local state
          set(state => ({
            workflows: [...state.workflows, workflow]
          }))
          
          // Create initial content with starter block
          const starterId = crypto.randomUUID()
          const starterBlock = {
            id: starterId,
            type: 'starter',
            name: 'Start',
            position: { x: 100, y: 100 },
            subBlocks: {
              startWorkflow: {
                id: 'startWorkflow',
                type: 'dropdown' as const,
                value: 'manual',
              },
            },
            outputs: {
              response: {
                type: { input: 'any' },
              },
            },
            enabled: true,
            horizontalHandles: true,
            isWide: false,
            height: 0,
          }
          
          const initialContent: WorkflowContent = {
            blocks: { [starterId]: starterBlock as any },
            edges: [],
            loops: {},
            parallels: {},
          }
          
          // Save initial content
          await persistence.saveWorkflowContent(id, initialContent)
          
          console.log('[UnifiedRegistry] Created workflow:', id)
          return id
        } catch (error) {
          console.error('[UnifiedRegistry] Failed to create workflow:', error)
          throw error
        }
      },
      
      // Update workflow metadata
      updateWorkflow: async (id, data) => {
        const { persistence } = get()
        if (!persistence) {
          throw new Error('No persistence adapter set')
        }
        
        try {
          await persistence.updateWorkflow(id, data)
          
          // Update local state
          set(state => ({
            workflows: state.workflows.map(w => 
              w.id === id ? { ...w, ...data, id } : w
            )
          }))
          
          console.log('[UnifiedRegistry] Updated workflow:', id)
        } catch (error) {
          console.error('[UnifiedRegistry] Failed to update workflow:', error)
          throw error
        }
      },
      
      // Delete workflow
      deleteWorkflow: async (id) => {
        const { persistence, activeWorkflowId } = get()
        if (!persistence) {
          throw new Error('No persistence adapter set')
        }
        
        try {
          await persistence.deleteWorkflow(id)
          
          // Update local state
          set(state => ({
            workflows: state.workflows.filter(w => w.id !== id),
            activeWorkflowId: activeWorkflowId === id ? null : activeWorkflowId,
          }))
          
          // Clear workflow store if this was the active workflow
          if (activeWorkflowId === id) {
            useWorkflowStore.getState().clear()
            useSubBlockStore.setState({ workflowValues: {} })
          }
          
          console.log('[UnifiedRegistry] Deleted workflow:', id)
        } catch (error) {
          console.error('[UnifiedRegistry] Failed to delete workflow:', error)
          throw error
        }
      },
      
      // Set active workflow
      setActiveWorkflow: (id) => {
        const current = get().activeWorkflowId
        if (current === id) return
        
        // Save current workflow content before switching
        if (current) {
          get().saveWorkflowContent(current).catch(error => {
            console.error('[UnifiedRegistry] Failed to save workflow before switching:', error)
          })
        }
        
        set({ activeWorkflowId: id })
        
        // Load new workflow content
        if (id) {
          get().loadWorkflowContent(id).catch(error => {
            console.error('[UnifiedRegistry] Failed to load workflow content:', error)
          })
        } else {
          // Clear workflow store
          useWorkflowStore.getState().clear()
          useSubBlockStore.setState({ workflowValues: {} })
        }
        
        console.log('[UnifiedRegistry] Active workflow changed to:', id)
      },
      
      // Load workflow content into the workflow store
      loadWorkflowContent: async (id) => {
        const { persistence } = get()
        if (!persistence) {
          throw new Error('No persistence adapter set')
        }
        
        try {
          const content = await persistence.getWorkflowContent(id)
          if (!content) {
            console.warn('[UnifiedRegistry] No content found for workflow:', id)
            return
          }
          
          // Update workflow store with loaded content
          useWorkflowStore.setState({
            blocks: content.blocks || {},
            edges: content.edges || [],
            loops: content.loops || {},
            parallels: content.parallels || {},
          })
          
          // TODO: [FUTURE] Load subblock values
          // This requires extracting values from blocks
          
          console.log('[UnifiedRegistry] Loaded workflow content:', id)
        } catch (error) {
          console.error('[UnifiedRegistry] Failed to load workflow content:', error)
          throw error
        }
      },
      
      // Save current workflow store content
      saveWorkflowContent: async (id) => {
        const { persistence } = get()
        if (!persistence) {
          throw new Error('No persistence adapter set')
        }
        
        try {
          const state = useWorkflowStore.getState()
          const content: WorkflowContent = {
            blocks: state.blocks,
            edges: state.edges,
            loops: state.loops || {},
            parallels: state.parallels || {},
          }
          
          await persistence.saveWorkflowContent(id, content)
          console.log('[UnifiedRegistry] Saved workflow content:', id)
        } catch (error) {
          console.error('[UnifiedRegistry] Failed to save workflow content:', error)
          throw error
        }
      },
    }),
    { name: 'unified-workflow-registry' }
  )
)