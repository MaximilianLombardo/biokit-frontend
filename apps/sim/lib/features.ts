/**
 * Feature flags based on application mode.
 * These flags control which features are available in local vs enterprise modes.
 */

import type { Features } from './adapters/interfaces'

/**
 * Get feature flags based on current mode
 */
export function getFeatures(mode: 'local' | 'enterprise' = 'local'): Features {
  if (mode === 'local') {
    return {
      // Core features available in local mode
      workflows: true,
      collaboration: false, // No real-time collaboration in local mode
      deployment: false,    // No deployment to cloud functions
      
      // Enterprise features not available in local mode
      workspaces: false,
      billing: false,
      teams: false,
      audit: false,
      
      // Advanced features not available in local mode
      webhooks: false,
      scheduling: false,
      apiAccess: false,
      customDomains: false,
    }
  }
  
  // Enterprise mode - all features enabled
  return {
    workflows: true,
    collaboration: true,
    deployment: true,
    workspaces: true,
    billing: true,
    teams: true,
    audit: true,
    webhooks: true,
    scheduling: true,
    apiAccess: true,
    customDomains: true,
  }
}

/**
 * Static feature flags for use in components
 * Uses environment variable to determine mode
 */
export const features = getFeatures(
  process.env.NEXT_PUBLIC_MODE as 'local' | 'enterprise' || 'local'
)