import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WorkflowMetadata } from './registry/types'
import { useLocalWorkflowContent } from './local-content'

interface LocalWorkflowRegistry {
  workflows: Record<string, WorkflowMetadata>
  activeWorkflowId: string | null
  
  // Actions
  createWorkflow: (options?: { name?: string }) => Promise<string>
  updateWorkflow: (id: string, updates: Partial<WorkflowMetadata>) => void
  deleteWorkflow: (id: string) => void
  setActiveWorkflow: (id: string) => void
}

// Generate a unique ID for workflows
const generateId = () => `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Generate a color for the workflow
const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
const getNextColor = (existingWorkflows: Record<string, WorkflowMetadata>) => {
  const usedColors = Object.values(existingWorkflows).map(w => w.color)
  const availableColors = colors.filter(c => !usedColors.includes(c))
  return availableColors.length > 0 ? availableColors[0] : colors[Math.floor(Math.random() * colors.length)]
}

export const useLocalWorkflowRegistry = create<LocalWorkflowRegistry>()(
  persist(
    (set, get) => ({
      workflows: {},
      activeWorkflowId: null,

      createWorkflow: async (options) => {
        const id = generateId()
        const workflows = get().workflows
        const name = options?.name || `Workflow ${Object.keys(workflows).length + 1}`
        
        const newWorkflow: WorkflowMetadata = {
          id,
          name,
          description: '',
          lastModified: new Date(),
          color: getNextColor(workflows),
          marketplaceData: null,
          folderId: null,
        }
        
        set(state => ({
          workflows: {
            ...state.workflows,
            [id]: newWorkflow
          },
          activeWorkflowId: id
        }))
        
        return id
      },

      updateWorkflow: (id, updates) => {
        set(state => ({
          workflows: {
            ...state.workflows,
            [id]: {
              ...state.workflows[id],
              ...updates,
              lastModified: new Date()
            }
          }
        }))
      },

      deleteWorkflow: (id) => {
        // Also delete the workflow content
        useLocalWorkflowContent.getState().deleteWorkflowContent(id)
        
        set(state => {
          const { [id]: removed, ...remaining } = state.workflows
          return {
            workflows: remaining,
            activeWorkflowId: state.activeWorkflowId === id ? null : state.activeWorkflowId
          }
        })
      },

      setActiveWorkflow: (id) => {
        set({ activeWorkflowId: id })
      }
    }),
    {
      name: 'biokit-workflows',
      version: 1,
    }
  )
)