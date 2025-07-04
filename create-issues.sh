#!/bin/bash

# Script to create GitHub issues for BioKit Workflow Editor Extraction
# Run from the biokit-frontend repository

echo "Creating GitHub issues for BioKit Workflow Editor Extraction..."

# Create the main epic issue
echo "Creating Epic issue..."
gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Epic] Extract Workflow Editor from Sim-AI for BioKit" \
  --body "## Overview
This epic tracks the extraction of the workflow editor from Sim-AI to create a standalone BioKit workflow editor.

## Documentation
- [Extraction Plan](https://github.com/MaximilianLombardo/biokit-frontend/blob/biokit-extraction/EXTRACTION_PLAN.md)
- [Architecture Notes](https://github.com/MaximilianLombardo/biokit-frontend/blob/biokit-extraction/ARCHITECTURE_NOTES.md)
- [Quick Start Guide](https://github.com/MaximilianLombardo/biokit-frontend/blob/biokit-extraction/EXTRACTION_QUICK_START.md)

## Phases
1. **Phase 1**: Isolation Within Sim-AI
2. **Phase 2**: Component Removal & Cleanup
3. **Phase 3**: New Project Setup
4. **Phase 4**: Component Migration
5. **Phase 5**: BioKit Nodes Implementation
6. **Phase 6**: API Integration
7. **Phase 7**: Polish & Testing

## Success Criteria
- [ ] Standalone workflow editor without SaaS features
- [ ] BioKit-specific nodes implemented
- [ ] Integration with BioKit backend API
- [ ] Comprehensive test coverage
- [ ] User documentation" \

# Phase 1: Isolation Within Sim-AI
echo "Creating Phase 1 issues..."

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 1] Create sandbox environment for testing editor isolation" \
  --body "## Description
Create a sandbox page within the sim-ai app to test running the workflow editor without dependencies.

## Tasks
- [ ] Create `/apps/sim/app/biokit-sandbox/page.tsx`
- [ ] Set up ReactFlowProvider without auth dependencies
- [ ] Create BiokitWorkflowEditor component wrapper
- [ ] Verify editor renders without errors

## Acceptance Criteria
- Sandbox page loads without authentication
- Basic workflow editor is visible
- No console errors related to missing auth/workspace context

## Reference
See EXTRACTION_PLAN.md Phase 1.1"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 1] Decouple workflow editor from authentication" \
  --body "## Description
Remove all authentication dependencies from the workflow editor component.

## Tasks
- [ ] Remove useSession hooks
- [ ] Remove useWorkspacePermissions
- [ ] Remove useParams for workspace ID
- [ ] Replace auth-dependent logic with props
- [ ] Create headless version of workflow editor

## Files to Modify
- `/app/w/[id]/workflow.tsx`
- Related component files

## Acceptance Criteria
- Editor works without any auth context
- All user/workspace data comes from props
- No auth-related imports remain

## Reference
See EXTRACTION_PLAN.md Phase 1.2" "phase-1,enhancement"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 1] Create minimal Zustand store for workflow state" \
  --body "## Description
Create a simplified Zustand store for managing workflow state without database persistence.

## Tasks
- [ ] Create biokit-store.ts
- [ ] Implement basic node/edge state management
- [ ] Add execution status tracking
- [ ] Remove database sync logic
- [ ] Remove collaborative features

## Store Interface
\`\`\`typescript
interface BiokitWorkflowState {
  nodes: Node[]
  edges: Edge[]
  selectedNodes: string[]
  executionStatus: Record<string, NodeStatus>
  // Action methods...
}
\`\`\`

## Acceptance Criteria
- Store manages workflow state locally
- No database operations
- Clear action methods for state updates

## Reference
See EXTRACTION_PLAN.md Phase 1.3" "phase-1,enhancement"

# Phase 2: Component Removal & Cleanup
echo "Creating Phase 2 issues..."

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 2] Remove authentication and user management components" \
  --body "## Description
Identify and remove all authentication-related components from the extracted code.

## Components to Remove
- [ ] All auth-related components (useSession, useUser, auth providers)
- [ ] Login/signup pages and components
- [ ] Session management code
- [ ] User profile components
- [ ] Password reset flows
- [ ] Email verification

## Acceptance Criteria
- No auth imports remain
- No user context dependencies
- Clean component interfaces without auth props" "phase-2,cleanup"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 2] Remove workspace and multi-tenancy features" \
  --body "## Description
Remove all workspace-related features and multi-tenancy logic.

## Components to Remove
- [ ] Workspace components and workspace switching
- [ ] Workspace permissions and sharing
- [ ] Team management features
- [ ] Workspace settings
- [ ] Workspace-based routing

## Acceptance Criteria
- No workspace context remains
- Single-user/single-project focus
- Simplified routing without workspace IDs" "phase-2,cleanup"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 2] Remove SaaS features (billing, deployment, marketplace)" \
  --body "## Description
Remove all SaaS-specific features that aren't needed for standalone editor.

## Components to Remove
- [ ] Billing components and subscription management
- [ ] Usage tracking and limits
- [ ] Deployment/marketplace features
- [ ] API key management for deployments
- [ ] Pricing/plan selection

## Acceptance Criteria
- No commercial features remain
- No usage limits or tracking
- Simplified UI without SaaS elements" "phase-2,cleanup"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 2] Remove real-time collaboration features" \
  --body "## Description
Remove Socket.IO and all real-time collaboration features.

## Components to Remove
- [ ] Socket.IO client connections
- [ ] Collaborative editing features
- [ ] User presence indicators
- [ ] Real-time cursor tracking
- [ ] Collaborative state sync

## Acceptance Criteria
- No Socket.IO imports
- Single-user editing only
- No real-time sync logic" "phase-2,cleanup"

# Phase 3: New Project Setup
echo "Creating Phase 3 issues..."

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 3] Initialize fresh Next.js project for BioKit" \
  --body "## Description
Set up a new, clean Next.js project structure for the BioKit workflow editor.

## Tasks
- [ ] Create new Next.js app with TypeScript
- [ ] Configure App Router
- [ ] Set up Tailwind CSS
- [ ] Configure TypeScript settings
- [ ] Set up ESLint and Prettier

## Commands
\`\`\`bash
npx create-next-app@latest biokit-workflow-editor \\
  --typescript \\
  --tailwind \\
  --app \\
  --no-src-dir \\
  --import-alias \"@/*\"
\`\`\`

## Acceptance Criteria
- Clean Next.js 15 project
- TypeScript configured
- Development server runs without errors" "phase-3,setup"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 3] Set up Shadcn UI and core dependencies" \
  --body "## Description
Install and configure Shadcn UI components and other core dependencies.

## Tasks
- [ ] Initialize Shadcn UI
- [ ] Install ReactFlow
- [ ] Install Zustand
- [ ] Configure component aliases
- [ ] Set up base styles

## Dependencies
- reactflow
- zustand
- @radix-ui components (via shadcn)
- class-variance-authority
- tailwind-merge

## Acceptance Criteria
- Shadcn UI components available
- ReactFlow renders test flow
- Zustand store works
- Consistent styling system" "phase-3,setup"

# Phase 4: Component Migration
echo "Creating Phase 4 issues..."

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 4] Port workflow canvas component" \
  --body "## Description
Migrate the core workflow canvas component from sim-ai to the new project.

## Tasks
- [ ] Port workflow.tsx to workflow-canvas.tsx
- [ ] Remove auth checks
- [ ] Simplify props interface
- [ ] Maintain ReactFlow setup and handlers
- [ ] Port zoom controls and minimap

## Source
From: /app/w/[id]/workflow.tsx
To: /components/workflow/workflow-canvas.tsx

## Acceptance Criteria
- Canvas renders with ReactFlow
- Can add/remove nodes
- Can connect nodes
- Zoom and pan work" "phase-4,enhancement"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 4] Port node base components" \
  --body "## Description
Migrate the node component system from sim-ai.

## Tasks
- [ ] Port workflow-block.tsx to base-node.tsx
- [ ] Simplify to remove sub-blocks initially
- [ ] Add status indicator for execution
- [ ] Create node wrapper component
- [ ] Port handle components

## Components
- Base node component
- Node handles for connections
- Node status indicators
- Node selection system

## Acceptance Criteria
- Nodes render correctly
- Connection handles work
- Status indicators visible
- Selection works" "phase-4,enhancement"

# Phase 5: BioKit Nodes Implementation
echo "Creating Phase 5 issues..."

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 5] Create BioKit node registry system" \
  --body "## Description
Implement a node registry for BioKit-specific nodes.

## Tasks
- [ ] Create node registry structure
- [ ] Define BiokitNode interface
- [ ] Implement node categories
- [ ] Create node registration system
- [ ] Add node search/filter capabilities

## Node Categories
- input: Data loading nodes
- processing: Analysis nodes
- visualization: Display nodes

## Acceptance Criteria
- Registry contains all node types
- Nodes can be searched/filtered
- Category organization works" "phase-5,enhancement"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 5] Implement BioKit Input and Load Data nodes" \
  --body "## Description
Create the data input nodes for BioKit workflows.

## Nodes to Implement
1. **Input Node**
   - Accept file path input
   - Output data reference

2. **Load Data Node**
   - Load biological data files
   - Support multiple formats (CSV, TSV, H5AD)
   - Data preview capability

## Acceptance Criteria
- Nodes appear in toolbar
- Can be added to canvas
- Input fields work
- Connection points functional" "phase-5,enhancement"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 5] Implement Scanpy UMAP node" \
  --body "## Description
Create the Scanpy UMAP analysis node.

## Features
- [ ] UMAP parameter inputs (n_neighbors, min_dist)
- [ ] Input data validation
- [ ] Progress indicator during execution
- [ ] Error handling
- [ ] Result preview

## Parameters
- n_neighbors: number (default: 15)
- min_dist: number (default: 0.1)
- random_state: number (optional)

## Acceptance Criteria
- Node accepts data input
- Parameters are configurable
- Execution status visible
- Outputs UMAP result" "phase-5,enhancement"

# Phase 6: API Integration
echo "Creating Phase 6 issues..."

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 6] Implement workflow serialization for BioKit API" \
  --body "## Description
Create serialization logic to convert visual workflows to BioKit API format.

## Tasks
- [ ] Define BioKit workflow JSON schema
- [ ] Implement node serialization
- [ ] Implement edge serialization
- [ ] Add validation logic
- [ ] Create deserialization for loading

## Schema Example
\`\`\`json
{
  \"graph\": {
    \"nodes\": [...],
    \"edges\": [...]
  }
}
\`\`\`

## Acceptance Criteria
- Workflows serialize to valid JSON
- API accepts serialized format
- Can deserialize saved workflows" "phase-6,enhancement"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 6] Create API client for BioKit backend" \
  --body "## Description
Implement API client for communication with BioKit backend.

## Endpoints to Implement
- POST /api/v1/workflow/run
- GET /api/v1/node/:nodeId/output
- GET /api/v1/workflow/:workflowId/status

## Features
- [ ] Error handling
- [ ] Retry logic
- [ ] Request/response typing
- [ ] Environment configuration
- [ ] Authentication (if needed)

## Acceptance Criteria
- Can submit workflows for execution
- Can poll execution status
- Can retrieve node outputs
- Proper error handling" "phase-6,enhancement"

# Phase 7: Polish & Testing
echo "Creating Phase 7 issues..."

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 7] Add comprehensive error handling" \
  --body "## Description
Implement proper error handling throughout the application.

## Areas to Cover
- [ ] API request failures
- [ ] Invalid node connections
- [ ] Execution errors
- [ ] Data loading errors
- [ ] UI component errors

## Features
- User-friendly error messages
- Error recovery options
- Error logging
- Fallback UI states

## Acceptance Criteria
- All errors handled gracefully
- Clear error messages shown
- No unhandled promise rejections
- Error boundaries in place" "phase-7,enhancement"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 7] Write comprehensive test suite" \
  --body "## Description
Create unit, integration, and E2E tests for the workflow editor.

## Test Coverage
- [ ] Unit tests for all components
- [ ] Integration tests for workflows
- [ ] E2E tests for full user flows
- [ ] API client tests
- [ ] Store tests

## Test Scenarios
- Creating workflows
- Connecting nodes
- Executing workflows
- Error scenarios
- Edge cases

## Acceptance Criteria
- 80%+ code coverage
- All critical paths tested
- Tests run in CI
- Documentation for running tests" "phase-7,testing"

echo "Issue creation complete!"