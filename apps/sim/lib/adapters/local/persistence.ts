/**
 * Local persistence adapter using browser localStorage.
 * This implementation provides full workflow CRUD operations for local development.
 * 
 * TODO: [MOCK] Deployment and execution features are mocked
 * FUTURE: In enterprise mode, these will use real API endpoints
 */

import type { 
  IWorkflowPersistence, 
  Workflow, 
  WorkflowContent,
  DeploymentConfig,
  ExecutionLog 
} from '../interfaces'

const STORAGE_KEYS = {
  WORKFLOWS: 'biokit-workflows',
  WORKFLOW_CONTENT: 'biokit-workflow-content-',
} as const

export class LocalWorkflowPersistence implements IWorkflowPersistence {
  constructor() {
    // Ensure we're in a browser environment
    if (typeof window === 'undefined') {
      console.warn('[LocalPersistence] Running in non-browser environment')
    }
  }

  // ============================================================================
  // Workflow CRUD Operations
  // ============================================================================

  async createWorkflow(data: {
    name: string
    description?: string
    folderId?: string
  }): Promise<{ id: string; workflow: Workflow }> {
    const workflows = this.getStoredWorkflows()
    const id = crypto.randomUUID()
    
    const workflow: Workflow = {
      id,
      name: data.name,
      description: data.description,
      folderId: data.folderId,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    }
    
    workflows.push(workflow)
    this.saveWorkflows(workflows)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[LocalPersistence] Created workflow:', workflow)
    }
    
    return { id, workflow }
  }

  async getWorkflow(id: string): Promise<Workflow | null> {
    const workflows = this.getStoredWorkflows()
    const workflow = workflows.find(w => w.id === id)
    
    if (!workflow) {
      return null
    }
    
    // Ensure dates are Date objects (localStorage serializes to strings)
    return {
      ...workflow,
      createdAt: new Date(workflow.createdAt),
      updatedAt: new Date(workflow.updatedAt),
    }
  }

  async updateWorkflow(id: string, data: Partial<Workflow>): Promise<void> {
    const workflows = this.getStoredWorkflows()
    const index = workflows.findIndex(w => w.id === id)
    
    if (index === -1) {
      throw new Error(`Workflow ${id} not found`)
    }
    
    workflows[index] = {
      ...workflows[index],
      ...data,
      id, // Ensure ID can't be changed
      updatedAt: new Date(),
    }
    
    this.saveWorkflows(workflows)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[LocalPersistence] Updated workflow:', id, data)
    }
  }

  async deleteWorkflow(id: string): Promise<void> {
    const workflows = this.getStoredWorkflows()
    const filtered = workflows.filter(w => w.id !== id)
    
    if (filtered.length === workflows.length) {
      throw new Error(`Workflow ${id} not found`)
    }
    
    this.saveWorkflows(filtered)
    
    // Also delete the workflow content
    this.deleteWorkflowContent(id)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[LocalPersistence] Deleted workflow:', id)
    }
  }

  async listWorkflows(options?: {
    folderId?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<Workflow[]> {
    let workflows = this.getStoredWorkflows()
    
    // Apply filters
    if (options?.folderId !== undefined) {
      workflows = workflows.filter(w => w.folderId === options.folderId)
    }
    
    if (options?.search) {
      const searchLower = options.search.toLowerCase()
      workflows = workflows.filter(w => 
        w.name.toLowerCase().includes(searchLower) ||
        w.description?.toLowerCase().includes(searchLower)
      )
    }
    
    // Sort by updatedAt descending (newest first)
    workflows.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    
    // Apply pagination
    if (options?.offset !== undefined || options?.limit !== undefined) {
      const start = options.offset || 0
      const end = options.limit ? start + options.limit : undefined
      workflows = workflows.slice(start, end)
    }
    
    // Ensure dates are Date objects
    return workflows.map(w => ({
      ...w,
      createdAt: new Date(w.createdAt),
      updatedAt: new Date(w.updatedAt),
    }))
  }

  // ============================================================================
  // Workflow Content Operations
  // ============================================================================

  async getWorkflowContent(workflowId: string): Promise<WorkflowContent | null> {
    const key = `${STORAGE_KEYS.WORKFLOW_CONTENT}${workflowId}`
    const stored = localStorage.getItem(key)
    
    if (!stored) {
      return null
    }
    
    try {
      return JSON.parse(stored)
    } catch (error) {
      console.error('[LocalPersistence] Failed to parse workflow content:', error)
      return null
    }
  }

  async saveWorkflowContent(workflowId: string, content: WorkflowContent): Promise<void> {
    const key = `${STORAGE_KEYS.WORKFLOW_CONTENT}${workflowId}`
    localStorage.setItem(key, JSON.stringify(content))
    
    // Update the workflow's updatedAt timestamp
    await this.updateWorkflow(workflowId, {})
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[LocalPersistence] Saved workflow content:', workflowId, {
        blocks: Object.keys(content.blocks).length,
        edges: content.edges.length,
      })
    }
  }

  // ============================================================================
  // Mock Implementations for Enterprise Features
  // ============================================================================

  async deployWorkflow(workflowId: string, config: DeploymentConfig): Promise<void> {
    // TODO: [MOCK] This is a mock implementation
    // FUTURE: In enterprise mode, this will deploy to cloud functions
    console.warn('[LocalPersistence] Deployment is not available in local mode')
    throw new Error('Deployment is not available in local mode. Switch to enterprise mode.')
  }

  async getDeploymentStatus(workflowId: string): Promise<{
    isDeployed: boolean
    deployedAt?: Date
    config?: DeploymentConfig
  }> {
    // TODO: [MOCK] Always return not deployed in local mode
    // FUTURE: In enterprise mode, this will check real deployment status
    return {
      isDeployed: false,
    }
  }

  async getExecutionLogs(workflowId: string, limit?: number): Promise<ExecutionLog[]> {
    // TODO: [MOCK] Return empty logs in local mode
    // FUTURE: In enterprise mode, this will fetch from database
    if (process.env.NODE_ENV === 'development') {
      console.log('[LocalPersistence] Execution logs not available in local mode')
    }
    return []
  }

  // ============================================================================
  // Import/Export Operations
  // ============================================================================

  async exportWorkflow(workflowId: string): Promise<string> {
    const workflow = await this.getWorkflow(workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }
    
    const content = await this.getWorkflowContent(workflowId)
    
    const exportData = {
      version: '1.0',
      workflow,
      content,
      exportedAt: new Date().toISOString(),
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  async importWorkflow(jsonData: string): Promise<{ id: string; workflow: Workflow }> {
    try {
      const data = JSON.parse(jsonData)
      
      if (!data.workflow || !data.content) {
        throw new Error('Invalid workflow export format')
      }
      
      // Create new workflow with a new ID
      const result = await this.createWorkflow({
        name: `${data.workflow.name} (Imported)`,
        description: data.workflow.description,
      })
      
      // Save the content
      if (data.content) {
        await this.saveWorkflowContent(result.id, data.content)
      }
      
      return result
    } catch (error) {
      throw new Error(`Failed to import workflow: ${error.message}`)
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private getStoredWorkflows(): Workflow[] {
    if (typeof window === 'undefined') {
      return []
    }
    
    const stored = localStorage.getItem(STORAGE_KEYS.WORKFLOWS)
    if (!stored) {
      return []
    }
    
    try {
      return JSON.parse(stored)
    } catch (error) {
      console.error('[LocalPersistence] Failed to parse workflows:', error)
      return []
    }
  }

  private saveWorkflows(workflows: Workflow[]): void {
    if (typeof window === 'undefined') {
      return
    }
    
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows))
  }

  private deleteWorkflowContent(workflowId: string): void {
    if (typeof window === 'undefined') {
      return
    }
    
    const key = `${STORAGE_KEYS.WORKFLOW_CONTENT}${workflowId}`
    localStorage.removeItem(key)
  }
}