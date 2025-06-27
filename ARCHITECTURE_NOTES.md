# Architecture Notes: Sim-AI → BioKit Extraction

## Sim-AI Architecture Overview

### Core Technologies
- **Framework**: Next.js 15.3.4 with App Router
- **UI Library**: React 19.1.0
- **Flow Editor**: ReactFlow 11.x
- **State Management**: Zustand 4.x
- **Styling**: Tailwind CSS 3.4.1 + Shadcn UI
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Better Auth
- **Real-time**: Socket.IO for collaboration
- **Monorepo**: Turborepo with Bun workspaces

### Key Architectural Patterns

#### 1. Component Organization
```
/app/w/[id]/                    # Dynamic route for workspace
├── components/                 # Feature-specific components
│   ├── workflow-block/        # Node components
│   ├── control-bar/           # Top toolbar
│   ├── panel/                 # Right sidebar
│   └── toolbar/               # Bottom node selector
├── hooks/                     # Feature-specific hooks
├── workflow.tsx               # Main editor component
└── page.tsx                   # Route entry point
```

#### 2. State Management Structure
Sim-AI uses multiple Zustand stores:
- `workflows/workflow/store.ts` - Main workflow state (nodes, edges)
- `workflows/subblock/store.ts` - Sub-block configurations
- `workflows/registry/store.ts` - Available blocks registry
- `execution/store.ts` - Execution status tracking
- `panel/store.ts` - UI panel states

#### 3. Block System Architecture
```typescript
// Block Definition Structure
interface Block {
  id: string                    // Unique identifier
  type: string                  // Block type (agent, api, etc.)
  name: string                  // Display name
  category: string              // Category for grouping
  inputs: BlockInput[]          // Input ports
  outputs: BlockOutput[]        // Output ports
  controls: BlockControl[]      // UI controls
  icon: string                  // Icon identifier
  color: string                 // Theme color
}
```

#### 4. Execution Flow
1. User builds workflow visually
2. Workflow serialized to JSON via `/serializer/`
3. JSON sent to backend API
4. Backend executor (`/executor/`) processes workflow
5. Status updates sent via WebSocket
6. Frontend updates node states

### Dependencies to Understand

#### Essential Dependencies
- `reactflow` - Core flow editor
- `zustand` - State management
- `@radix-ui/*` - Headless UI components (used by Shadcn)
- `class-variance-authority` - Dynamic className handling
- `tailwind-merge` - Tailwind class merging

#### Sim-AI Specific (Don't Port)
- `better-auth` - Authentication
- `drizzle-orm` - Database ORM
- `@vercel/postgres` - Database
- `socket.io-client` - Real-time collaboration
- `stripe` - Billing
- `resend` - Email service

### File Structure Mapping

#### What Maps Where
```
SIM-AI                          →  BIOKIT
/app/w/[id]/workflow.tsx       →  /components/workflow/editor.tsx
/blocks/                       →  /lib/nodes/ (simplified)
/stores/workflows/             →  /store/workflow.ts (unified)
/serializer/                   →  /lib/serializer.ts
/components/ui/                →  /components/ui/ (copy as-is)
/executor/                     →  (Not needed - backend concern)
/tools/                        →  (Not needed - create BioKit nodes)
```

### Authentication Removal Strategy

#### Components with Auth Dependencies
1. **Middleware** (`middleware.ts`)
   - Handles route protection
   - Can be completely removed

2. **Layout Components**
   - `/app/w/layout.tsx` - Has workspace permission provider
   - Solution: Create new layout without providers

3. **API Routes**
   - All check `getSession()`
   - Solution: Create new simplified endpoints

4. **Hooks to Replace**
   - `useSession()` → Remove entirely
   - `useWorkspacePermissions()` → Remove entirely
   - `useUser()` → Remove entirely

### Database Decoupling

#### Current Database Usage
- Workflows stored in `workflow` table
- Execution logs in `logs` table
- User settings in `userSettings` table
- Workspace data in `workspace` table

#### Replacement Strategy
1. **Local Storage** for user preferences
2. **In-memory state** for active workflow
3. **File export/import** for persistence
4. **Simple API** for execution (no storage)

### WebSocket/Real-time Removal

#### Current Implementation
- Socket.IO for collaborative editing
- Real-time execution updates
- Presence indicators

#### Simplified Approach
- Remove all Socket.IO code
- Use polling for execution status
- No collaborative features in MVP

### Component Simplification Guide

#### WorkflowBlock Component
**Current**: Complex with sub-blocks, permissions, collaborative features
**Target**: Simple node with inputs/outputs and status indicator

#### Toolbar Component  
**Current**: Loads blocks from database, checks permissions
**Target**: Static list of BioKit nodes, drag-to-add

#### Panel Component
**Current**: Chat, console, variables with persistence
**Target**: Simple console for execution logs

### Performance Considerations

1. **Remove Lazy Loading**: Sim-AI lazy loads blocks for performance. With fewer nodes, load all upfront.

2. **Simplify State Updates**: Remove optimistic updates and conflict resolution.

3. **Remove Caching**: Sim-AI caches workflows and execution results. Start without caching.

### Security Considerations

Since we're removing auth:
1. No user data storage
2. No multi-tenancy concerns  
3. API should validate input but doesn't need auth
4. CORS configuration for API access

### Testing Approach

1. **Component Testing**: Use React Testing Library for isolated components
2. **Integration Testing**: Test workflow creation and serialization
3. **E2E Testing**: Full workflow creation → execution → result display

### Gradual Extraction Strategy

Instead of extracting everything at once:

1. **Week 1**: Get basic editor rendering with mock nodes
2. **Week 2**: Add BioKit nodes and serialization
3. **Week 3**: Implement execution API and status updates
4. **Week 4**: Polish, error handling, and testing

### Common Pitfalls to Avoid

1. **Don't Port Hidden Dependencies**: Check imports carefully
2. **Don't Keep Unused Code**: Resist keeping code "just in case"
3. **Don't Over-Engineer**: Start simple, add features as needed
4. **Don't Copy Blindly**: Understand each component's purpose

### Useful Code Patterns from Sim-AI

#### 1. Node Connection Validation
```typescript
// From workflow store - useful pattern to keep
const isValidConnection = (connection: Connection) => {
  const sourceNode = nodes.find(n => n.id === connection.source)
  const targetNode = nodes.find(n => n.id === connection.target)
  // Validation logic
}
```

#### 2. Workflow Serialization
```typescript
// Serializer pattern worth keeping
const serializeWorkflow = (nodes, edges) => {
  return {
    version: '1.0',
    graph: { nodes: [...], edges: [...] }
  }
}
```

#### 3. Status Management
```typescript
// Execution status pattern
type NodeStatus = 'idle' | 'queued' | 'running' | 'completed' | 'error'
```

### References for Extraction

1. **ReactFlow Basics**: Start with ReactFlow examples, not sim-ai's complex implementation
2. **Zustand Patterns**: Use simple stores, not sim-ai's complex multi-store setup  
3. **Shadcn Components**: Copy only the ones you need
4. **API Design**: Follow REST principles, not sim-ai's complex routing