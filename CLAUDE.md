# BioKit Workflow Editor - Development Guidelines

## Project Overview
This is a standalone visual workflow editor extracted from sim-ai (Sim Studio) for BioKit bioinformatics workflows. The editor provides a clean, intuitive interface for building computational biology pipelines without any SaaS features.

## Key Principles

### 1. Extraction Philosophy
- **Extract, Don't Recreate**: Port existing working code from sim-ai rather than writing from scratch
- **Simplify Ruthlessly**: Remove all SaaS features (auth, workspaces, billing, collaboration)
- **Preserve UX Excellence**: Maintain the visual design and interaction patterns that make sim-ai great
- **Start Minimal**: Get basic editor working first, add features incrementally

### 2. Architecture Constraints

#### What to Keep
- ReactFlow-based visual editor
- Zustand for state management (single store, not multiple)
- Shadcn UI components and Tailwind styling
- Node connection validation logic
- Workflow serialization patterns

#### What to Remove
- All authentication (Better Auth, sessions, permissions)
- Database operations (Drizzle, PostgreSQL)
- Real-time collaboration (Socket.IO)
- Workspace/multi-tenancy features
- Billing and subscription logic
- Email services
- OAuth integrations

### 3. Code Style & Patterns

#### Component Structure
```typescript
// Prefer props over context for data flow
interface BiokitNodeProps {
  id: string
  data: NodeData
  selected: boolean
  onUpdate: (id: string, data: NodeData) => void
  onDelete: (id: string) => void
}

// Keep components pure and testable
export function BiokitNode({ id, data, onUpdate, onDelete }: BiokitNodeProps) {
  // Component logic
}
```

#### State Management
```typescript
// Single unified store instead of multiple stores
interface WorkflowStore {
  // State
  nodes: Node[]
  edges: Edge[]
  selectedNodes: Set<string>
  executionStatus: Map<string, NodeStatus>
  
  // Actions - group by feature
  // Node operations
  addNode: (node: Node) => void
  updateNode: (id: string, updates: Partial<Node>) => void
  deleteNode: (id: string) => void
  
  // Edge operations
  addEdge: (edge: Edge) => void
  deleteEdge: (id: string) => void
  
  // Execution
  setNodeStatus: (nodeId: string, status: NodeStatus) => void
  clearExecution: () => void
}
```

#### File Naming
- Components: `kebab-case.tsx` (e.g., `workflow-editor.tsx`)
- Stores: `workflow-store.ts`
- Types: `types.ts` or `workflow.types.ts`
- Utils: `utils.ts` or feature-specific like `serializer.utils.ts`

### 4. Testing Requirements

#### Test Coverage Goals
- Critical paths: 80% coverage
- UI components: Snapshot tests for all
- Store actions: Unit tests for all mutations
- Serialization: Round-trip tests
- API integration: Mock-based tests

#### Testing Patterns
```typescript
// Name tests descriptively
describe('WorkflowEditor', () => {
  it('should add a new node when dragging from toolbar', () => {})
  it('should validate connections between compatible node types', () => {})
  it('should prevent circular dependencies in workflow', () => {})
})

// Test real behavior, not implementation
// Bad: expect(mockFn).toHaveBeenCalledWith(...)
// Good: expect(screen.getByText('Node added')).toBeInTheDocument()
```

### 5. Common Pitfalls to Avoid

#### During Extraction
1. **Hidden Dependencies**: Always trace imports fully - sim-ai components often import from deep paths
2. **Context Assumptions**: Many components expect React contexts that won't exist
3. **Global State**: Watch for `window` or `document` references that might break
4. **CSS Classes**: Some Tailwind classes might be custom to sim-ai's config

#### Component Porting
1. **Over-extraction**: Don't port features "just in case" - YAGNI
2. **Partial Features**: Either port a feature completely or not at all
3. **Dead Code**: Remove all auth checks, permission guards, etc. completely
4. **Config Assumptions**: Hardcode values rather than expecting environment variables

#### State Management
1. **Store Coupling**: Sim-ai stores reference each other - break these dependencies
2. **Side Effects**: Remove all API calls from store actions initially
3. **Persistence**: Don't implement persistence until core editor works
4. **Computed State**: Use vanilla JS, not complex subscription patterns

### 6. BioKit-Specific Patterns

#### Node Development
```typescript
// Each BioKit node should follow this pattern
export const ScanpyUmapNode: BiokitNodeDefinition = {
  id: 'scanpy-umap',
  category: 'processing',
  name: 'UMAP (Scanpy)',
  description: 'Perform UMAP dimensionality reduction',
  
  // Clear input/output definitions
  inputs: [
    { id: 'adata', type: 'anndata', label: 'AnnData Object' }
  ],
  outputs: [
    { id: 'adata', type: 'anndata', label: 'AnnData with UMAP' },
    { id: 'plot', type: 'image', label: 'UMAP Plot' }
  ],
  
  // Parameters with sensible defaults
  parameters: {
    n_neighbors: { type: 'number', default: 15, min: 2, max: 100 },
    min_dist: { type: 'number', default: 0.1, min: 0.0, max: 1.0 }
  },
  
  // Validation
  validate: (params) => {
    if (params.n_neighbors < 2) return 'n_neighbors must be at least 2'
    return null
  }
}
```

#### API Integration
```typescript
// Keep API calls simple and focused
class BiokitAPI {
  constructor(private baseURL: string) {}
  
  async executeWorkflow(workflow: SerializedWorkflow): Promise<ExecutionResult> {
    // Simple POST with timeout
    const response = await fetch(`${this.baseURL}/workflow/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow),
      signal: AbortSignal.timeout(30000) // 30s timeout
    })
    
    if (!response.ok) {
      throw new WorkflowExecutionError(response.statusText)
    }
    
    return response.json()
  }
}
```

### 7. Development Workflow

#### Before Starting Any Task
1. Check if similar functionality exists in sim-ai
2. Review the extraction plan for guidance
3. Consider the minimal implementation first
4. Write tests for critical paths

#### When Extracting Components
1. Copy the component to a temporary file
2. Remove all auth/permission code
3. Convert context usage to props
4. Simplify the component interface
5. Update imports to new structure
6. Add to the BioKit project
7. Test in isolation before integration

#### Code Review Checklist
- [ ] No authentication code remains
- [ ] No database queries
- [ ] No workspace/tenant logic
- [ ] All imports are valid
- [ ] Component is self-contained
- [ ] Tests are included
- [ ] Types are properly defined

### 8. Performance Guidelines

#### Workflow Rendering
- Limit node re-renders using React.memo
- Virtualize large node lists (>100 nodes)
- Debounce node position updates
- Use CSS transforms for node movement

#### State Updates
- Batch related updates
- Use immer for complex state mutations
- Avoid deep cloning large objects
- Implement undo/redo with patches, not snapshots

### 9. Error Handling Strategy

#### User-Facing Errors
```typescript
// Provide actionable error messages
class WorkflowValidationError extends Error {
  constructor(
    message: string,
    public nodeId: string,
    public suggestion?: string
  ) {
    super(message)
  }
}

// Example usage
throw new WorkflowValidationError(
  'Missing required input connection',
  node.id,
  'Connect a data source to the "input" port'
)
```

#### Development Errors
- Use error boundaries for component crashes
- Log errors with context (node type, workflow state)
- Provide recovery options (reset editor, clear workflow)

### 10. Future Considerations

#### Phase 2 Features (After MVP)
- Workflow templates
- Local storage persistence  
- Keyboard shortcuts
- Undo/redo
- Copy/paste nodes
- Workflow validation warnings
- Export/import workflows

#### Integration Points
- BioKit Python backend API
- File upload for data inputs
- Result visualization components
- Progress monitoring
- Error log streaming

## Quick Reference

### Key Directories
```
/components/workflow/   - Main editor components
/components/nodes/     - BioKit node implementations  
/lib/                 - Utilities and helpers
/stores/              - Zustand state management
/types/               - TypeScript type definitions
```

### Essential Commands
```bash
# Development
bun dev              # Start dev server
bun test            # Run tests
bun test:watch      # Watch mode
bun lint            # Check code style

# Building
bun build           # Production build
bun preview         # Preview production build

# Code Quality
bun typecheck       # TypeScript validation
bun test:coverage   # Coverage report
```

### Debugging Tips
1. Enable React DevTools Profiler for performance issues
2. Use Zustand DevTools for state debugging
3. Add `data-testid` attributes for E2E tests
4. Use `console.time()` for performance measurements

### Getting Help
- Review sim-ai source: `/apps/sim/app/w/[id]/`
- Check extraction plan: `EXTRACTION_PLAN.md`
- Architecture notes: `ARCHITECTURE_NOTES.md`
- ReactFlow docs: https://reactflow.dev/
- Zustand docs: https://github.com/pmndrs/zustand

## Remember
The goal is a clean, focused workflow editor for bioinformatics. When in doubt, choose simplicity over features. The editor should feel familiar to sim-ai users but work perfectly as a standalone tool.