// Mock permissions hook for standalone BioKit workflow editor
// Always returns full permissions since there's no authentication

export const useBiokitPermissions = () => ({
  // Standard permissions
  canComment: true,
  canDelete: true,
  canEdit: true,
  canManage: true,
  canView: true,
  canRun: true,
  canDeploy: true,
  
  // Function-based permissions
  canModifyBlock: (blockId?: string) => true,
  canDeleteBlock: (blockId?: string) => true,
  canAddBlock: () => true,
  canModifyEdge: (edgeId?: string) => true,
  
  // Workspace-level permissions
  isOwner: true,
  isAdmin: true,
  isMember: true,
  
  // Feature permissions
  canUseMarketplace: true,
  canAccessLogs: true,
  canManageIntegrations: true,
});

// Also export a hook that mimics useUserPermissionsContext
export const useUserPermissionsContext = useBiokitPermissions;