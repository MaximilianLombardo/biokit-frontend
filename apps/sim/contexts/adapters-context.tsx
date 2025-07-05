'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { 
  IWorkflowPersistence, 
  ICollaborationProvider, 
  IAuthProvider,
  Features,
  Adapters,
} from '@/lib/adapters/interfaces'
import { getFeatures } from '@/lib/features'

// Local adapters
import {
  LocalWorkflowPersistence,
  NoOpCollaborationProvider,
  LocalAuthProvider,
} from '@/lib/adapters/local'

// TODO: [FUTURE] Import remote adapters when implemented
// import {
//   RemoteWorkflowPersistence,
//   YjsCollaborationProvider,
//   RemoteAuthProvider,
// } from '@/lib/adapters/remote'

/**
 * Context value containing all adapters and features
 */
interface AdaptersContextValue extends Adapters {
  mode: 'local' | 'enterprise'
}

const AdaptersContext = createContext<AdaptersContextValue | null>(null)

/**
 * Props for the adapters provider
 */
interface AdaptersProviderProps {
  children: ReactNode
  mode?: 'local' | 'enterprise'
  overrides?: {
    persistence?: IWorkflowPersistence
    collaboration?: ICollaborationProvider
    auth?: IAuthProvider
  }
}

/**
 * Provider component that creates and provides adapters based on mode
 */
export function AdaptersProvider({ 
  children, 
  mode = process.env.NEXT_PUBLIC_MODE as 'local' | 'enterprise' || 'local',
  overrides,
}: AdaptersProviderProps) {
  const adapters = useMemo(() => {
    // Get feature flags for the current mode
    const features = getFeatures(mode)
    
    if (mode === 'local') {
      // Local mode - use browser storage and mock implementations
      return {
        mode,
        persistence: overrides?.persistence || new LocalWorkflowPersistence(),
        collaboration: overrides?.collaboration || new NoOpCollaborationProvider(),
        auth: overrides?.auth || new LocalAuthProvider(),
        features,
      }
    } else {
      // TODO: [FUTURE] Enterprise mode - use real implementations
      // FUTURE: Uncomment when remote adapters are implemented
      // return {
      //   mode,
      //   persistence: overrides?.persistence || new RemoteWorkflowPersistence(
      //     process.env.NEXT_PUBLIC_API_URL!
      //   ),
      //   collaboration: overrides?.collaboration || new YjsCollaborationProvider(
      //     process.env.NEXT_PUBLIC_WS_URL!
      //   ),
      //   auth: overrides?.auth || new RemoteAuthProvider(),
      //   features,
      // }
      
      // For now, throw error if trying to use enterprise mode
      throw new Error(
        'Enterprise mode is not yet implemented. Please use local mode.'
      )
    }
  }, [mode, overrides])
  
  return (
    <AdaptersContext.Provider value={adapters}>
      {children}
    </AdaptersContext.Provider>
  )
}

/**
 * Hook to access all adapters
 */
export function useAdapters() {
  const context = useContext(AdaptersContext)
  if (!context) {
    throw new Error('useAdapters must be used within AdaptersProvider')
  }
  return context
}

/**
 * Hook to access persistence adapter
 */
export function usePersistence() {
  const { persistence } = useAdapters()
  return persistence
}

/**
 * Hook to access collaboration adapter
 */
export function useCollaboration() {
  const { collaboration } = useAdapters()
  return collaboration
}

/**
 * Hook to access auth adapter
 */
export function useAuth() {
  const { auth } = useAdapters()
  return auth
}

/**
 * Hook to access feature flags
 */
export function useFeatures() {
  const { features } = useAdapters()
  return features
}

/**
 * Hook to access current mode
 */
export function useMode() {
  const { mode } = useAdapters()
  return mode
}