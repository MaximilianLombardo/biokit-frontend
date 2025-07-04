#!/bin/bash

# Script to create GitHub issues for BioKit Workflow Editor Extraction
# Run from the biokit-frontend repository

echo "Creating remaining GitHub issues for BioKit Workflow Editor Extraction..."
echo "Starting from Phase 1, issue 3 (first two already created)..."

# Phase 1: Issue 3
gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 1] Create minimal Zustand store for workflow state" \
  --body "Create a simplified Zustand store for managing workflow state without database persistence. See EXTRACTION_PLAN.md Phase 1.3"

# Phase 2: Component Removal & Cleanup
echo "Creating Phase 2 issues..."

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 2] Remove authentication and user management components" \
  --body "Remove all auth-related components including login, signup, sessions, and user profiles"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 2] Remove workspace and multi-tenancy features" \
  --body "Remove workspace components, permissions, sharing, and team management"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 2] Remove SaaS features (billing, deployment, marketplace)" \
  --body "Remove billing, usage tracking, deployment, and marketplace features"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 2] Remove real-time collaboration features" \
  --body "Remove Socket.IO and all real-time collaboration features"

# Phase 3: New Project Setup
echo "Creating Phase 3 issues..."

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 3] Initialize fresh Next.js project for BioKit" \
  --body "Set up a new, clean Next.js project structure for the BioKit workflow editor"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 3] Set up Shadcn UI and core dependencies" \
  --body "Install and configure Shadcn UI components, ReactFlow, Zustand, and other core dependencies"

# Phase 4: Component Migration
echo "Creating Phase 4 issues..."

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 4] Port workflow canvas component" \
  --body "Migrate the core workflow canvas component from sim-ai to the new project"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 4] Port node base components" \
  --body "Migrate the node component system from sim-ai"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 4] Port workflow toolbar" \
  --body "Migrate the node selection toolbar"

# Phase 5: BioKit Nodes Implementation
echo "Creating Phase 5 issues..."

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 5] Create BioKit node registry system" \
  --body "Implement a node registry for BioKit-specific nodes"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 5] Implement BioKit Input and Load Data nodes" \
  --body "Create the data input nodes for BioKit workflows"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 5] Implement Scanpy UMAP node" \
  --body "Create the Scanpy UMAP analysis node"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 5] Implement Display Image node" \
  --body "Create node for displaying generated plots and images"

# Phase 6: API Integration
echo "Creating Phase 6 issues..."

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 6] Implement workflow serialization for BioKit API" \
  --body "Create serialization logic to convert visual workflows to BioKit API format"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 6] Create API client for BioKit backend" \
  --body "Implement API client for communication with BioKit backend"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 6] Add workflow execution hook" \
  --body "Create React hook for managing workflow execution state and API calls"

# Phase 7: Polish & Testing
echo "Creating Phase 7 issues..."

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 7] Add comprehensive error handling" \
  --body "Implement proper error handling throughout the application"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 7] Write comprehensive test suite" \
  --body "Create unit, integration, and E2E tests for the workflow editor"

gh issue create \
  --repo MaximilianLombardo/biokit-frontend \
  --title "[Phase 7] Create user and developer documentation" \
  --body "Write comprehensive documentation for users and developers"

echo "Issue creation complete!"