import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BlockState } from './workflow/types'
import type { Edge } from 'reactflow'

interface WorkflowContent {
  blocks: Record<string, BlockState>
  edges: Edge[]
  loops: Record<string, any>
  parallels: Record<string, any>
}

interface LocalWorkflowContent {
  // Store workflow content indexed by workflow ID
  workflowContents: Record<string, WorkflowContent>
  
  // Actions
  saveWorkflowContent: (workflowId: string, content: WorkflowContent) => void
  loadWorkflowContent: (workflowId: string) => WorkflowContent | null
  deleteWorkflowContent: (workflowId: string) => void
}

// Default empty workflow content
const emptyWorkflowContent: WorkflowContent = {
  blocks: {},
  edges: [],
  loops: {},
  parallels: {},
}

export const useLocalWorkflowContent = create<LocalWorkflowContent>()(
  persist(
    (set, get) => ({
      workflowContents: {},

      saveWorkflowContent: (workflowId, content) => {
        set(state => ({
          workflowContents: {
            ...state.workflowContents,
            [workflowId]: content
          }
        }))
      },

      loadWorkflowContent: (workflowId) => {
        const content = get().workflowContents[workflowId]
        return content || null
      },

      deleteWorkflowContent: (workflowId) => {
        set(state => {
          const { [workflowId]: removed, ...remaining } = state.workflowContents
          return {
            workflowContents: remaining
          }
        })
      }
    }),
    {
      name: 'biokit-workflow-contents',
      version: 1,
    }
  )
)