/**
 * Local adapter implementations for standalone BioKit development.
 * These adapters provide full functionality using browser storage
 * and mock implementations for enterprise features.
 */

export { LocalWorkflowPersistence } from './persistence'
export { NoOpCollaborationProvider } from './collaboration'
export { LocalAuthProvider } from './auth'

// Re-export interfaces for convenience
export type { 
  IWorkflowPersistence,
  ICollaborationProvider,
  IAuthProvider,
  Workflow,
  WorkflowContent,
  User,
  Features,
  Adapters,
} from '../interfaces'