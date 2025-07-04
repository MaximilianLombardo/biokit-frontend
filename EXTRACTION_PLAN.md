# BioKit Workflow Editor Extraction Plan

## Overview
This document outlines the complete plan for extracting the workflow editor from sim-ai (Sim Studio) to create a standalone workflow editor for BioKit. The extraction will preserve the core visual workflow building capabilities while removing SaaS features like authentication, workspaces, and billing.

## Project Goals
1. Extract a clean, standalone workflow editor from sim-ai
2. Remove all authentication and multi-tenant features
3. Create BioKit-specific nodes for bioinformatics workflows
4. Implement a simple execution API matching BioKit's backend
5. Maintain the excellent UX of sim-ai's editor

## Current State Analysis

### Sim-AI Architecture
The sim-ai codebase is a sophisticated SaaS platform with:
- **Frontend**: Next.js 15 with App Router, ReactFlow for the editor
- **State**: Zustand for state management
- **UI**: Shadcn UI components with Tailwind CSS
- **Backend**: PostgreSQL, Drizzle ORM, Better Auth
- **Features**: Real-time collaboration, workspaces, authentication, billing

### Key Components for Extraction
1. **Workflow Editor** (`/app/w/[id]/`)
   - Main editor component with ReactFlow
   - Block/node components
   - Edge/connection components
   - Toolbar for adding blocks
   - Panel for console/variables

2. **Block System** (`/blocks/`)
   - Block definitions and registry
   - Block types and interfaces
   - Serialization logic

3. **State Management** (`/stores/`)
   - Workflow state (nodes, edges)
   - Execution state
   - UI state (panels, selections)

4. **Serialization** (`/serializer/`)
   - Converts workflow to JSON format
   - Already exists and can be adapted

## Extraction Strategy

### Phase 1: Isolation Within Sim-AI (Days 1-2)

#### 1.1 Create Sandbox Environment
Create a test page to verify the editor can run without dependencies:

```typescript
// apps/sim/app/biokit-sandbox/page.tsx
'use client'

import { ReactFlowProvider } from 'reactflow'
import { BiokitWorkflowEditor } from './biokit-workflow-editor'
import { useBiokitStore } from './biokit-store'

export default function BiokitSandbox() {
  return (
    <ReactFlowProvider>
      <BiokitWorkflowEditor 
        initialNodes={[]}
        initialEdges={[]}
        onSave={(nodes, edges) => console.log('Save:', nodes, edges)}
      />
    </ReactFlowProvider>
  )
}
```

#### 1.2 Decouple Core Components

**Files to refactor:**
- `/app/w/[id]/workflow.tsx` → Remove:
  - `useSession`, `useParams` hooks
  - `useWorkspacePermissions` 
  - `useCollaborativeWorkflow`
  - Socket.IO connections
  - Database workflow loading

**Create headless version:**
```typescript
interface BiokitWorkflowEditorProps {
  initialNodes: Node[]
  initialEdges: Edge[]
  onSave: (nodes: Node[], edges: Edge[]) => void
  onExecute?: (workflow: SerializedWorkflow) => void
}
```

#### 1.3 Create Minimal Store

```typescript
// stores/biokit-store.ts
interface BiokitWorkflowState {
  nodes: Node[]
  edges: Edge[]
  selectedNodes: string[]
  executionStatus: Record<string, NodeStatus>
  
  // Actions
  addNode: (node: Node) => void
  updateNode: (id: string, data: any) => void
  deleteNode: (id: string) => void
  addEdge: (edge: Edge) => void
  deleteEdge: (id: string) => void
  setExecutionStatus: (nodeId: string, status: NodeStatus) => void
}
```

### Phase 2: Component Removal & Cleanup (Day 3)

#### 2.1 Components to Remove/Refactor

During extraction, these components need to be identified and removed or refactored:

**Authentication & User Management:**
- All auth-related components (`useSession`, `useUser`, auth providers)
- Login/signup pages and components
- Session management code
- User profile components

**Multi-tenancy Features:**
- Workspace components and workspace switching
- Workspace permissions and sharing
- Team management features

**SaaS Features:**
- Deployment/marketplace features
- Billing components and subscription management
- Usage tracking and limits
- API key management for deployments

**Collaboration Features:**
- Real-time collaboration (Socket.IO)
- User presence indicators
- Collaborative editing features
- Chat components and messaging

**Integration Features:**
- OAuth/credential selectors
- Third-party service authentication
- Credential storage and management

#### 2.2 Initialize BioKit Frontend

```bash
# Create new Next.js project
npx create-next-app@latest biokit-workflow-editor \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd biokit-workflow-editor

# Install dependencies
bun add reactflow zustand
bun add -D @types/reactflow

# Setup Shadcn UI
npx shadcn@latest init
npx shadcn@latest add button card dialog dropdown-menu input label separator
```

#### 2.2 Project Structure

```
biokit-workflow-editor/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (main editor page)
│   ├── globals.css
│   └── api/
│       └── workflow/
│           ├── run/
│           │   └── route.ts
│           └── node/
│               └── [nodeId]/
│                   └── output/
│                       └── route.ts
├── components/
│   ├── ui/ (shadcn components)
│   ├── workflow/
│   │   ├── workflow-editor.tsx
│   │   ├── workflow-canvas.tsx
│   │   ├── workflow-toolbar.tsx
│   │   ├── workflow-panel.tsx
│   │   └── workflow-controls.tsx
│   └── nodes/
│       ├── base-node.tsx
│       ├── input-node.tsx
│       ├── load-data-node.tsx
│       ├── scanpy-umap-node.tsx
│       └── display-image-node.tsx
├── lib/
│   ├── api-client.ts
│   ├── workflow-serializer.ts
│   ├── node-registry.ts
│   └── utils.ts
├── stores/
│   └── workflow-store.ts
├── types/
│   ├── workflow.ts
│   ├── nodes.ts
│   └── api.ts
└── hooks/
    ├── use-workflow.ts
    └── use-node-execution.ts
```

### Phase 3: New Project Setup (Day 4)

### Phase 4: Component Migration (Days 5-6)

#### 3.1 Core Components to Port

**From sim-ai → biokit-workflow-editor:**

1. **Workflow Canvas** 
   - `/app/w/[id]/workflow.tsx` → `/components/workflow/workflow-canvas.tsx`
   - Remove auth checks, simplify props
   - Keep ReactFlow setup and handlers

2. **Node Component**
   - `/app/w/[id]/components/workflow-block/workflow-block.tsx` → `/components/nodes/base-node.tsx`
   - Simplify to remove sub-blocks initially
   - Add status indicator for execution

3. **Toolbar**
   - `/app/w/[id]/components/toolbar/toolbar.tsx` → `/components/workflow/workflow-toolbar.tsx`
   - Show only BioKit nodes
   - Drag-and-drop to add nodes

4. **Serializer**
   - `/serializer/index.ts` → `/lib/workflow-serializer.ts`
   - Adapt to BioKit's API format

#### 3.2 Dependencies to Copy

**Essential files:**
- `/components/ui/*` - All Shadcn components used
- `/lib/utils.ts` - cn() helper for className merging
- `tailwind.config.ts` - Tailwind configuration
- `/app/globals.css` - Global styles and CSS variables

### Phase 5: BioKit Nodes Implementation (Days 7-8)

#### 5.1 Node Registry

```typescript
// lib/node-registry.ts
export interface BiokitNode {
  id: string
  type: string
  category: 'input' | 'processing' | 'visualization'
  name: string
  description: string
  icon?: React.ComponentType
  inputs: NodePort[]
  outputs: NodePort[]
  defaultData: Record<string, any>
  component: React.ComponentType<NodeComponentProps>
}

export const BIOKIT_NODES: BiokitNode[] = [
  {
    id: 'input',
    type: 'biokit/input',
    category: 'input',
    name: 'Input',
    description: 'Load data from file path',
    inputs: [],
    outputs: [{ id: 'data', type: 'dataframe', name: 'Data' }],
    defaultData: { filepath: '' },
    component: InputNode
  },
  {
    id: 'load-data',
    type: 'biokit/load-data',
    category: 'input',
    name: 'Load Data',
    description: 'Load biological data',
    inputs: [{ id: 'path', type: 'string', name: 'File Path' }],
    outputs: [{ id: 'data', type: 'dataframe', name: 'Loaded Data' }],
    defaultData: { format: 'csv' },
    component: LoadDataNode
  },
  {
    id: 'scanpy-umap',
    type: 'biokit/scanpy-umap',
    category: 'processing',
    name: 'Run Scanpy UMAP',
    description: 'Perform UMAP dimensionality reduction',
    inputs: [{ id: 'data', type: 'dataframe', name: 'Input Data' }],
    outputs: [{ id: 'result', type: 'dataframe', name: 'UMAP Result' }],
    defaultData: { n_neighbors: 15, min_dist: 0.1 },
    component: ScanpyUmapNode
  },
  {
    id: 'display-image',
    type: 'biokit/display-image',
    category: 'visualization',
    name: 'Display Image',
    description: 'Display a generated plot',
    inputs: [{ id: 'data', type: 'any', name: 'Plot Data' }],
    outputs: [],
    defaultData: {},
    component: DisplayImageNode
  }
]
```

#### 5.2 Node Components

```typescript
// components/nodes/base-node.tsx
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface BaseNodeProps {
  data: {
    label: string
    status?: 'idle' | 'queued' | 'running' | 'completed' | 'error'
    inputs?: NodePort[]
    outputs?: NodePort[]
    [key: string]: any
  }
  selected: boolean
}

export function BaseNode({ data, selected }: BaseNodeProps) {
  const statusColors = {
    idle: 'border-gray-500',
    queued: 'border-yellow-500',
    running: 'border-blue-500 animate-pulse',
    completed: 'border-green-500',
    error: 'border-red-500'
  }

  return (
    <Card className={cn(
      'min-w-[200px] p-4',
      statusColors[data.status || 'idle'],
      selected && 'ring-2 ring-primary'
    )}>
      {data.inputs?.map((input) => (
        <Handle
          key={input.id}
          type="target"
          position={Position.Left}
          id={input.id}
          className="w-3 h-3"
        />
      ))}
      
      <div className="font-semibold">{data.label}</div>
      
      {data.outputs?.map((output) => (
        <Handle
          key={output.id}
          type="source"
          position={Position.Right}
          id={output.id}
          className="w-3 h-3"
        />
      ))}
    </Card>
  )
}
```

### Phase 6: API Integration (Day 9)

#### 6.1 Workflow Serialization

```typescript
// lib/workflow-serializer.ts
export function serializeWorkflow(nodes: Node[], edges: Edge[]): BiokitWorkflow {
  return {
    graph: {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle
      }))
    }
  }
}
```

#### 6.2 API Client

```typescript
// lib/api-client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1'

export async function runWorkflow(workflow: BiokitWorkflow) {
  const response = await fetch(`${API_BASE}/workflow/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow)
  })
  
  if (!response.ok) {
    throw new Error(`Failed to run workflow: ${response.statusText}`)
  }
  
  return response.json()
}

export async function getNodeOutput(nodeId: string) {
  const response = await fetch(`${API_BASE}/node/${nodeId}/output`)
  
  if (!response.ok) {
    throw new Error(`Failed to get node output: ${response.statusText}`)
  }
  
  return response.json()
}
```

#### 6.3 Execution Hook

```typescript
// hooks/use-workflow-execution.ts
export function useWorkflowExecution() {
  const { nodes, edges, setNodeStatus } = useWorkflowStore()
  const [isRunning, setIsRunning] = useState(false)

  const executeWorkflow = async () => {
    setIsRunning(true)
    
    // Set all nodes to queued
    nodes.forEach(node => {
      setNodeStatus(node.id, 'queued')
    })

    try {
      const workflow = serializeWorkflow(nodes, edges)
      const result = await runWorkflow(workflow)
      
      // Start polling or websocket connection for status updates
      pollExecutionStatus(result.workflow_id)
    } catch (error) {
      console.error('Execution failed:', error)
      nodes.forEach(node => {
        setNodeStatus(node.id, 'error')
      })
    } finally {
      setIsRunning(false)
    }
  }

  return { executeWorkflow, isRunning }
}
```

### Phase 7: Display Image Node (Day 10)

```typescript
// components/nodes/display-image-node.tsx
export function DisplayImageNode({ data, id }: NodeComponentProps) {
  const [imageUrl, setImageUrl] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (data.status === 'completed') {
      loadImage()
    }
  }, [data.status])

  const loadImage = async () => {
    setLoading(true)
    setError(undefined)
    
    try {
      const result = await getNodeOutput(id)
      if (result.type === 'image/png' && result.data.url) {
        setImageUrl(result.data.url)
      }
    } catch (err) {
      setError('Failed to load image')
    } finally {
      setLoading(false)
    }
  }

  return (
    <BaseNode data={data}>
      <div className="mt-2">
        {loading && <div>Loading image...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt="Workflow output"
            className="max-w-[300px] rounded"
          />
        )}
      </div>
    </BaseNode>
  )
}
```

## Testing Strategy

### Unit Tests
- Node components rendering
- Store actions and state updates
- Serialization functions
- API client methods

### Integration Tests
- Full workflow creation and execution
- Node connection validation
- Error handling flows

### E2E Tests
- Create workflow with all node types
- Execute workflow and verify results
- Load/save workflow scenarios

## Migration Checklist

### Phase 1: Isolation ✅
- [ ] Create sandbox page in sim-ai
- [ ] Extract workflow editor component
- [ ] Create headless store
- [ ] Verify editor works without auth

### Phase 2: Component Removal ✅
- [ ] Identify auth-related components
- [ ] Remove workspace components
- [ ] Remove deployment/marketplace features
- [ ] Remove collaboration features
- [ ] Remove OAuth/credential selectors
- [ ] Remove chat components
- [ ] Remove billing components

### Phase 3: Setup ✅
- [ ] Initialize new Next.js project
- [ ] Install core dependencies
- [ ] Setup Shadcn UI
- [ ] Create project structure

### Phase 4: Migration ✅
- [ ] Port workflow canvas
- [ ] Port node components
- [ ] Port toolbar
- [ ] Copy UI components and styles

### Phase 5: BioKit Nodes ✅
- [ ] Create node registry
- [ ] Implement Input node
- [ ] Implement Load Data node
- [ ] Implement Scanpy UMAP node
- [ ] Implement Display Image node

### Phase 6: API ✅
- [ ] Implement serializer
- [ ] Create API client
- [ ] Add execution hook
- [ ] Handle status updates

### Phase 7: Polish ✅
- [ ] Add error handling
- [ ] Implement image display
- [ ] Add loading states
- [ ] Final testing

## Known Issues & Solutions

### Issue 1: Deep Authentication Integration
**Problem**: Many components expect auth context
**Solution**: Create props-based components that don't rely on context

### Issue 2: Database Dependencies
**Problem**: Workflow loading/saving tied to database
**Solution**: Use local state initially, add simple persistence later

### Issue 3: Complex Block System
**Problem**: Blocks have many features (sub-blocks, loops, parallels)
**Solution**: Start with simple nodes, add complexity incrementally

### Issue 4: Tool Integrations
**Problem**: Tools are tied to backend execution
**Solution**: Create simplified BioKit-specific nodes

## Future Enhancements

1. **Persistence**: Add local storage or file-based save/load
2. **Advanced Nodes**: Port loop and parallel execution nodes
3. **Real-time Updates**: Add WebSocket for execution status
4. **Collaboration**: Add simple sharing features
5. **Templates**: Pre-built workflows for common tasks

## Resources

- [ReactFlow Documentation](https://reactflow.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Shadcn UI](https://ui.shadcn.com/)
- [Next.js App Router](https://nextjs.org/docs/app)

## Contact

For questions about this extraction plan, please refer to the original sim-ai codebase at `/Users/maks/Documents/Cline/biokit/biokit-frontend/` for reference implementation details.