# ADR-001: Unified Store Architecture with Adapter Pattern

## Status
Proposed

## Context
The BioKit workflow editor was extracted from Sim-AI to create a standalone tool. During this extraction, duplicate Zustand stores were created:
- Original stores at `/stores/` (used by main Sim app)
- BioKit-specific stores at `/app/biokit/stores/` (created for isolation)

This duplication has caused several issues:
1. Components importing from different stores get undefined state
2. ActionBar buttons (duplicate/delete) are non-functional
3. Developer confusion about which store to import
4. Maintenance burden of keeping stores in sync

Additionally, we want to support both:
- Local development mode (using localStorage)
- Enterprise mode (using PostgreSQL, real-time collaboration)

## Decision
We will implement an **Adapter Pattern** to use a single set of stores with pluggable backends. This involves:

1. Creating interfaces for external dependencies:
   - `IWorkflowPersistence` - for data storage
   - `ICollaborationProvider` - for real-time sync
   - `IAuthProvider` - for authentication

2. Implementing adapters for each mode:
   - Local: localStorage, no-op collaboration, mock auth
   - Enterprise: API calls, WebSocket/YJS, real auth

3. Using dependency injection to provide the appropriate adapters based on configuration

4. Maintaining a single set of Zustand stores that use these adapters

## Consequences

### Positive
- **Single source of truth**: Eliminates store synchronization issues
- **Flexibility**: Easy to switch between local and enterprise modes
- **Future-proof**: Can add new adapters (e.g., YJS) without changing stores
- **Testability**: Easy to mock adapters for testing
- **Clear boundaries**: Separates business logic from infrastructure
- **Reduced complexity**: No more duplicate store maintenance

### Negative
- **Initial complexity**: More upfront design work
- **Abstraction overhead**: Additional layer between stores and persistence
- **Migration effort**: Need to update all components to use unified stores

### Neutral
- Performance impact should be negligible with proper implementation
- Requires careful documentation of adapter contracts
- Team needs to understand dependency injection pattern

## Implementation Notes

### Phase 1: Infrastructure
```typescript
// Define interfaces
interface IWorkflowPersistence {
  createWorkflow(data: WorkflowData): Promise<Workflow>
  getWorkflow(id: string): Promise<Workflow | null>
  // ... other methods
}

// Local implementation
class LocalWorkflowPersistence implements IWorkflowPersistence {
  async createWorkflow(data: WorkflowData) {
    // Use localStorage
  }
}

// Remote implementation
class RemoteWorkflowPersistence implements IWorkflowPersistence {
  async createWorkflow(data: WorkflowData) {
    // Use API calls
  }
}
```

### Phase 2: Dependency Injection
```typescript
// Provider component
function AdaptersProvider({ children, mode = 'local' }) {
  const adapters = useMemo(() => {
    if (mode === 'local') {
      return {
        persistence: new LocalWorkflowPersistence(),
        collaboration: new NoOpCollaborationProvider(),
        auth: new LocalAuthProvider(),
      }
    } else {
      return {
        persistence: new RemoteWorkflowPersistence(),
        collaboration: new WebSocketCollaborationProvider(),
        auth: new RemoteAuthProvider(),
      }
    }
  }, [mode])
  
  return (
    <AdaptersContext.Provider value={adapters}>
      {children}
    </AdaptersContext.Provider>
  )
}
```

### Phase 3: Store Integration
```typescript
// Updated store
export const useWorkflowRegistry = create((set, get) => ({
  // Adapter reference
  persistence: null,
  
  // Initialize with adapter
  setPersistence: (persistence) => set({ persistence }),
  
  // Use adapter for operations
  createWorkflow: async (data) => {
    const { persistence } = get()
    if (!persistence) throw new Error('No persistence adapter')
    
    const workflow = await persistence.createWorkflow(data)
    // Update local state
  }
}))
```

## Alternatives Considered

1. **Keep duplicate stores**: Maintain separate implementations
   - Rejected: Too much maintenance overhead and synchronization issues

2. **Direct localStorage/API calls in components**: No abstraction
   - Rejected: Tight coupling makes it hard to switch modes

3. **Feature flags only**: Use flags to conditionally call localStorage or API
   - Rejected: Leads to complex conditionals throughout codebase

4. **Complete rewrite**: Start fresh with new architecture
   - Rejected: Too time-consuming and risky

## References
- [Adapter Pattern](https://refactoring.guru/design-patterns/adapter)
- [Dependency Injection in React](https://kentcdodds.com/blog/application-state-management-with-react)
- [Zustand Best Practices](https://github.com/pmndrs/zustand#best-practices)