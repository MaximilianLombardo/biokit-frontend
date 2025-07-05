# Migration Guide: Unified Store Architecture

This guide helps developers migrate from the current dual-store architecture to the unified store architecture with adapters.

## Overview
We're moving from having two separate store implementations (main app stores and biokit-specific stores) to a single set of stores with pluggable adapters for different modes (local vs enterprise).

## For Developers

### 1. Updating Import Paths

#### Before (Incorrect - Mixed Stores)
```typescript
// Some components use main store
import { useWorkflowStore } from '@/stores/workflows/workflow/store'

// Others use biokit store
import { useWorkflowStore } from './stores/workflows/workflow/store'
```

#### After (Correct - Unified Store)
```typescript
// All components use main store
import { useWorkflowStore } from '@/stores/workflows/workflow/store'
```

### 2. Using Adapters Instead of Direct Calls

#### Before (Direct localStorage)
```typescript
function saveWorkflow(workflow: Workflow) {
  localStorage.setItem(`workflow-${workflow.id}`, JSON.stringify(workflow))
}
```

#### After (Using Adapter)
```typescript
import { usePersistence } from '@/contexts/adapters-context'

function MyComponent() {
  const persistence = usePersistence()
  
  async function saveWorkflow(workflow: Workflow) {
    await persistence.saveWorkflow(workflow)
  }
}
```

### 3. Handling Async Operations

#### Before (Synchronous localStorage)
```typescript
const workflow = JSON.parse(localStorage.getItem(`workflow-${id}`) || '{}')
```

#### After (Async Adapter)
```typescript
const workflow = await persistence.getWorkflow(id)
if (!workflow) {
  // Handle not found
}
```

### 4. Feature Detection

#### Before (Hardcoded)
```typescript
// Always show deployment button
<DeployButton onClick={deployWorkflow} />
```

#### After (Feature Flags)
```typescript
import { features } from '@/lib/features'

// Only show in enterprise mode
{features.deployment && <DeployButton onClick={deployWorkflow} />}
```

## Migration Steps

### Phase 1: Update Your Component (Minimum Changes)
1. Change import to use main store: `@/stores/workflows/workflow/store`
2. Remove any direct localStorage calls
3. Test that basic functionality works

### Phase 2: Use Adapters (Recommended)
1. Import the adapter hooks:
   ```typescript
   import { usePersistence, useAuth } from '@/contexts/adapters-context'
   ```
2. Replace direct operations with adapter calls
3. Handle async operations properly
4. Add error handling for failed operations

### Phase 3: Add Feature Detection (Best Practice)
1. Import feature flags: `import { features } from '@/lib/features'`
2. Conditionally render enterprise features
3. Show appropriate UI for local vs enterprise mode

## Common Patterns

### Loading Workflows
```typescript
// Old way
const [workflows, setWorkflows] = useState([])
useEffect(() => {
  const stored = localStorage.getItem('workflows')
  if (stored) setWorkflows(JSON.parse(stored))
}, [])

// New way
const [workflows, setWorkflows] = useState([])
const [loading, setLoading] = useState(true)
const persistence = usePersistence()

useEffect(() => {
  async function load() {
    try {
      const data = await persistence.listWorkflows()
      setWorkflows(data)
    } finally {
      setLoading(false)
    }
  }
  load()
}, [persistence])
```

### Saving Changes
```typescript
// Old way
function save() {
  localStorage.setItem('workflow', JSON.stringify(workflow))
}

// New way
const persistence = usePersistence()
async function save() {
  try {
    await persistence.saveWorkflow(workflow)
    toast.success('Saved successfully')
  } catch (error) {
    toast.error('Failed to save')
  }
}
```

### Checking Permissions
```typescript
// Old way (no permissions)
<DeleteButton onClick={deleteWorkflow} />

// New way
const auth = useAuth()
{auth.hasPermission('workflow', 'delete') && (
  <DeleteButton onClick={deleteWorkflow} />
)}
```

## Testing Your Migration

### 1. Unit Tests
```typescript
// Mock the adapters
const mockPersistence = {
  getWorkflow: jest.fn().mockResolvedValue(mockWorkflow),
  saveWorkflow: jest.fn().mockResolvedValue(undefined),
}

// Provide in test
<AdaptersContext.Provider value={{ persistence: mockPersistence }}>
  <YourComponent />
</AdaptersContext.Provider>
```

### 2. Integration Tests
```typescript
// Test both modes
describe('Workflow Editor', () => {
  it('works in local mode', () => {
    render(
      <AdaptersProvider mode="local">
        <WorkflowEditor />
      </AdaptersProvider>
    )
    // Test localStorage operations
  })
  
  it('works in enterprise mode', () => {
    render(
      <AdaptersProvider mode="enterprise">
        <WorkflowEditor />
      </AdaptersProvider>
    )
    // Test API operations
  })
})
```

## Troubleshooting

### Issue: "Cannot read properties of undefined"
**Cause**: Component is using wrong store or store not initialized
**Fix**: 
1. Check import path is `@/stores/...`
2. Ensure component is wrapped in `AdaptersProvider`
3. Check that store is initialized with adapter

### Issue: "No persistence adapter"
**Cause**: Store trying to use adapter before it's set
**Fix**:
1. Add `useInitializeStores()` in your app root
2. Check that `AdaptersProvider` wraps your app
3. Wait for initialization before rendering

### Issue: "localStorage is not defined"
**Cause**: Server-side rendering trying to access localStorage
**Fix**:
1. Use adapter instead of direct localStorage
2. Check for `typeof window !== 'undefined'`
3. Use dynamic imports for client-only components

### Issue: Feature working in local but not enterprise mode
**Cause**: Mock implementation not matching real implementation
**Fix**:
1. Check adapter interface is consistent
2. Ensure async operations are handled
3. Add proper error handling

## Rollback Plan
If you encounter issues:
1. The old biokit stores are still available (marked deprecated)
2. You can temporarily revert imports to use biokit stores
3. Report issues in GitHub with the `unified-store` label
4. We'll address blockers before removing old stores

## Future Improvements
- Automatic migration tool for import paths
- Codemod for common patterns
- Enhanced TypeScript types for adapters
- Better error messages for common mistakes

## Questions?
- Check the [ADR-001](./architecture/ADR-001-unified-stores.md) for architectural decisions
- See [MOCKS.md](./MOCKS.md) for mock implementation details
- Create an issue with the `unified-store` label for help