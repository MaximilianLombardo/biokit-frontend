# Mock Implementations Tracking

This document tracks all mock implementations in the BioKit workflow editor and their intended future implementations.

## Overview
As part of the unified store architecture, we're creating mock implementations for features that will be fully implemented in enterprise mode. This allows us to maintain a clean architecture while keeping the local development experience simple.

## Mock Implementations

### 1. NoOpCollaborationProvider
- **Status**: Mock implementation (no-op)
- **Location**: `/lib/adapters/local/collaboration.ts`
- **Current behavior**: All methods are no-ops, no real-time sync
- **Future implementation**: 
  - YJS integration with y-websocket
  - CRDT-based conflict resolution
  - User presence tracking
  - Cursor position sharing
- **TODO**: 
  - [ ] Research YJS providers
  - [ ] Design conflict resolution strategy
  - [ ] Implement WebRTC fallback
  - [ ] Add offline support

### 2. LocalAuthProvider
- **Status**: Mock implementation
- **Location**: `/lib/adapters/local/auth.ts`
- **Current behavior**: 
  - Always returns authenticated
  - Mock user: `{ id: 'local-user', email: 'user@local' }`
  - All permissions granted
- **Future implementation**:
  - NextAuth.js integration
  - JWT token management
  - Role-based permissions
  - OAuth providers (Google, GitHub)
- **TODO**:
  - [ ] Set up NextAuth configuration
  - [ ] Implement permission system
  - [ ] Add user profile management
  - [ ] Create auth UI components

### 3. LocalWorkflowPersistence (Partial Mock)
- **Status**: Functional for local storage, mocks deployment features
- **Location**: `/lib/adapters/local/persistence.ts`
- **Current behavior**:
  - Full CRUD operations using localStorage
  - Mock deployment methods (no-op)
  - No execution logs
- **Future implementation**:
  - PostgreSQL database integration
  - Deployment to cloud functions
  - Execution history and logs
  - Workflow versioning
- **TODO**:
  - [ ] Design database schema
  - [ ] Implement deployment API
  - [ ] Add execution monitoring
  - [ ] Create migration utilities

### 4. MockWorkspaceProvider
- **Status**: Not yet implemented (planned)
- **Location**: `/lib/adapters/local/workspace.ts`
- **Current behavior**: Single workspace only
- **Future implementation**:
  - Multi-workspace support
  - Workspace member management
  - Workspace-level permissions
  - Resource isolation
- **TODO**:
  - [ ] Design workspace data model
  - [ ] Implement workspace switching
  - [ ] Add invitation system
  - [ ] Create workspace settings UI

### 5. MockBillingProvider
- **Status**: Not yet implemented (planned)
- **Location**: `/lib/adapters/local/billing.ts`
- **Current behavior**: All features enabled
- **Future implementation**:
  - Stripe integration
  - Usage tracking
  - Subscription tiers
  - Payment method management
- **TODO**:
  - [ ] Define pricing tiers
  - [ ] Implement usage metering
  - [ ] Add Stripe webhook handlers
  - [ ] Create billing UI

## Implementation Guidelines

### When Creating New Mocks
1. Always prefix mock implementations with `Mock` or `NoOp`
2. Add clear comments indicating mock status:
   ```typescript
   // TODO: [MOCK] This is a mock implementation
   // FUTURE: Implement with YJS for real-time collaboration
   ```
3. Log mock operations in development:
   ```typescript
   if (process.env.NODE_ENV === 'development') {
     console.log('[MockAuth] Login called with:', credentials)
   }
   ```
4. Throw errors for unimplemented critical features:
   ```typescript
   async deployWorkflow() {
     throw new Error('[MOCK] Deployment not available in local mode')
   }
   ```

### Testing Mocks
- Create separate test suites for mock vs real implementations
- Use environment variables to switch between mocks and real services
- Ensure mocks maintain the same interface as real implementations
- Add integration tests that work with both mocks and real services

### Migration Path
When implementing a real version of a mock:
1. Create the real implementation alongside the mock
2. Use feature flags to gradually roll out
3. Run both in parallel during transition
4. Remove mock only after real implementation is stable

## Mock vs Real Feature Matrix

| Feature | Local Mode | Enterprise Mode | Status |
|---------|------------|-----------------|---------|
| Workflow CRUD | ✅ Real (localStorage) | ✅ Real (PostgreSQL) | Implemented |
| Real-time Sync | ❌ Mock (no-op) | 🔄 YJS (planned) | TODO |
| Authentication | ❌ Mock (always auth) | 🔄 NextAuth (planned) | TODO |
| Permissions | ❌ Mock (all granted) | 🔄 RBAC (planned) | TODO |
| Deployment | ❌ Mock (no-op) | 🔄 Cloud Functions | TODO |
| Workspaces | ❌ Not implemented | 🔄 Multi-tenant | TODO |
| Billing | ❌ Not implemented | 🔄 Stripe | TODO |
| Execution Logs | ❌ Mock (console only) | 🔄 Database | TODO |
| File Storage | ✅ Real (browser) | 🔄 S3/R2 | TODO |
| Webhooks | ❌ Mock (no-op) | 🔄 Real webhooks | TODO |

## Notes
- All mocks should be clearly documented in code
- Keep mock implementations simple - they're temporary
- Focus on maintaining the correct interface, not functionality
- Use mocks to unblock development, not as permanent solutions