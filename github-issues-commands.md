# GitHub Issues Creation Commands

Run these commands from the biokit-frontend directory to create issues for the BioKit workflow editor extraction.

## First, navigate to the main repository
```bash
cd /Users/maks/Documents/Cline/biokit/biokit-frontend
```

## Epic Issue
```bash
gh issue create \
  --title "[Epic] Extract Workflow Editor from Sim-AI for BioKit" \
  --body "See branch biokit-extraction for extraction plan documentation" "epic,enhancement"
```

## Phase 1: Isolation Issues
```bash
# 1. Sandbox environment
gh issue create \
  --title "[Phase 1] Create sandbox environment for testing editor isolation" \
  --body "Create a sandbox page within sim-ai to test running the workflow editor without dependencies. See EXTRACTION_PLAN.md Phase 1.1" "phase-1,enhancement"

# 2. Decouple from auth
gh issue create \
  --title "[Phase 1] Decouple workflow editor from authentication" \
  --body "Remove all authentication dependencies from the workflow editor component. See EXTRACTION_PLAN.md Phase 1.2" "phase-1,enhancement"

# 3. Minimal store
gh issue create \
  --title "[Phase 1] Create minimal Zustand store for workflow state" \
  --body "Create a simplified Zustand store for managing workflow state without database persistence. See EXTRACTION_PLAN.md Phase 1.3" "phase-1,enhancement"
```

## Phase 2: Component Removal
```bash
# 1. Remove auth
gh issue create \
  --title "[Phase 2] Remove authentication and user management components" \
  --body "Remove all auth-related components including login, signup, sessions, and user profiles" "phase-2,cleanup"

# 2. Remove workspaces
gh issue create \
  --title "[Phase 2] Remove workspace and multi-tenancy features" \
  --body "Remove workspace components, permissions, sharing, and team management" "phase-2,cleanup"

# 3. Remove SaaS features
gh issue create \
  --title "[Phase 2] Remove SaaS features (billing, deployment, marketplace)" \
  --body "Remove billing, usage tracking, deployment, and marketplace features" "phase-2,cleanup"

# 4. Remove collaboration
gh issue create \
  --title "[Phase 2] Remove real-time collaboration features" \
  --body "Remove Socket.IO and all real-time collaboration features" "phase-2,cleanup"
```

## Phase 3: Project Setup
```bash
# 1. Initialize project
gh issue create \
  --title "[Phase 3] Initialize fresh Next.js project for BioKit" \
  --body "Set up a new, clean Next.js project structure for the BioKit workflow editor" "phase-3,setup"

# 2. Dependencies
gh issue create \
  --title "[Phase 3] Set up Shadcn UI and core dependencies" \
  --body "Install and configure Shadcn UI components, ReactFlow, Zustand, and other core dependencies" "phase-3,setup"
```

## Phase 4: Component Migration
```bash
# 1. Canvas
gh issue create \
  --title "[Phase 4] Port workflow canvas component" \
  --body "Migrate the core workflow canvas component from sim-ai to the new project" "phase-4,enhancement"

# 2. Nodes
gh issue create \
  --title "[Phase 4] Port node base components" \
  --body "Migrate the node component system from sim-ai" "phase-4,enhancement"

# 3. Toolbar
gh issue create \
  --title "[Phase 4] Port workflow toolbar" \
  --body "Migrate the node selection toolbar" "phase-4,enhancement"
```

## Phase 5: BioKit Nodes
```bash
# 1. Registry
gh issue create \
  --title "[Phase 5] Create BioKit node registry system" \
  --body "Implement a node registry for BioKit-specific nodes" "phase-5,enhancement"

# 2. Input nodes
gh issue create \
  --title "[Phase 5] Implement BioKit Input and Load Data nodes" \
  --body "Create the data input nodes for BioKit workflows" "phase-5,enhancement"

# 3. UMAP node
gh issue create \
  --title "[Phase 5] Implement Scanpy UMAP node" \
  --body "Create the Scanpy UMAP analysis node" "phase-5,enhancement"

# 4. Display node
gh issue create \
  --title "[Phase 5] Implement Display Image node" \
  --body "Create node for displaying generated plots and images" "phase-5,enhancement"
```

## Phase 6: API Integration
```bash
# 1. Serialization
gh issue create \
  --title "[Phase 6] Implement workflow serialization for BioKit API" \
  --body "Create serialization logic to convert visual workflows to BioKit API format" "phase-6,enhancement"

# 2. API client
gh issue create \
  --title "[Phase 6] Create API client for BioKit backend" \
  --body "Implement API client for communication with BioKit backend" "phase-6,enhancement"

# 3. Execution hook
gh issue create \
  --title "[Phase 6] Add workflow execution hook" \
  --body "Create React hook for managing workflow execution state and API calls" "phase-6,enhancement"
```

## Phase 7: Polish & Testing
```bash
# 1. Error handling
gh issue create \
  --title "[Phase 7] Add comprehensive error handling" \
  --body "Implement proper error handling throughout the application" "phase-7,enhancement"

# 2. Testing
gh issue create \
  --title "[Phase 7] Write comprehensive test suite" \
  --body "Create unit, integration, and E2E tests for the workflow editor" "phase-7,testing"

# 3. Documentation
gh issue create \
  --title "[Phase 7] Create user and developer documentation" \
  --body "Write comprehensive documentation for users and developers" "phase-7,documentation"
```

## Creating All Issues at Once

If you want to create all issues at once, you can save the script from `create-issues.sh` and run:

```bash
cd /Users/maks/Documents/Cline/biokit/biokit-frontend
bash /Users/maks/Documents/Cline/biokit/biokit-workflow-editor/create-issues.sh
```