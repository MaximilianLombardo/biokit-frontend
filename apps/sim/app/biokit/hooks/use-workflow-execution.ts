// Mock workflow execution hook for standalone mode
export function useWorkflowExecution(workflowId: string) {
  // In standalone mode, return mock functions
  return {
    execute: async () => {
      console.log('Executing workflow:', workflowId)
      // Mock execution
      return { success: true }
    },
    isExecuting: false,
    error: null,
  }
}