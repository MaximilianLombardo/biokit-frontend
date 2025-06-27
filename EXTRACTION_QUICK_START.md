# BioKit Extraction Quick Start Guide

## For the Next Developer

This guide provides quick steps to continue the BioKit workflow editor extraction.

## Current Status
- ✅ Created git worktree at `/Users/maks/Documents/Cline/biokit/biokit-workflow-editor`
- ✅ Created detailed extraction plan
- ✅ Analyzed sim-ai architecture
- ⏳ Ready to start Phase 1: Component isolation

## Your First Steps

### 1. Access the New Worktree
```bash
cd /Users/maks/Documents/Cline/biokit/biokit-workflow-editor
```

### 2. Move Documentation
```bash
# Copy the extraction docs from the main worktree
cp ../biokit-frontend/EXTRACTION_PLAN.md .
cp ../biokit-frontend/ARCHITECTURE_NOTES.md .
cp ../biokit-frontend/EXTRACTION_QUICK_START.md .

# Commit them
git add *.md
git commit -m "Add extraction documentation"
git push -u origin biokit-extraction
```

### 3. Start Phase 1: Create Sandbox
Create the sandbox page to test isolation:

```bash
# Create sandbox directory
mkdir -p apps/sim/app/biokit-sandbox

# Create the page
cat > apps/sim/app/biokit-sandbox/page.tsx << 'EOF'
'use client'

export default function BiokitSandbox() {
  return (
    <div className="h-screen flex items-center justify-center">
      <h1>BioKit Workflow Editor Sandbox</h1>
    </div>
  )
}
EOF
```

### 4. Key Files to Start With

#### Files to Study First:
1. `/apps/sim/app/w/[id]/workflow.tsx` - Main editor component
2. `/apps/sim/stores/workflows/workflow/store.ts` - State management
3. `/apps/sim/serializer/index.ts` - Workflow serialization
4. `/apps/sim/blocks/registry.ts` - How blocks are registered

#### Files to Extract Early:
1. `/apps/sim/components/ui/` - Shadcn components (copy wholesale)
2. `/apps/sim/lib/utils.ts` - Utility functions
3. `/apps/sim/app/globals.css` - Global styles

### 5. Component Isolation Checklist

When isolating the workflow editor:

- [ ] Remove `useSession()` calls
- [ ] Remove `useParams()` for workspace ID
- [ ] Remove `useWorkspacePermissions()`
- [ ] Remove Socket.IO connections
- [ ] Replace database loads with props
- [ ] Remove collaborative editing features
- [ ] Simplify toolbar to show only BioKit nodes

### 6. Quick Testing

To verify the current app still works:
```bash
# In the main worktree (not the extraction one)
cd /Users/maks/Documents/Cline/biokit/biokit-frontend
bun run dev

# Visit http://localhost:3000/w to see the editor
```

### 7. Dependencies You'll Need

For the new BioKit project:
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "^15.0.0",
    "reactflow": "^11.0.0",
    "zustand": "^4.0.0",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "@radix-ui/react-label": "latest",
    "@radix-ui/react-separator": "latest",
    "@radix-ui/react-slot": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "tailwindcss": "^3.4.0"
  }
}
```

### 8. Common Issues & Solutions

**Issue**: "Cannot find module '@/lib/auth'"
**Solution**: Remove the import and any code using it

**Issue**: "Property 'user' does not exist"
**Solution**: The component expects auth context. Remove or mock the user prop.

**Issue**: "Cannot connect to database"
**Solution**: Replace database calls with local state or props

### 9. API Endpoints to Create

Eventually, you'll need these endpoints in the BioKit backend:

```
POST   /api/v1/workflow/run
GET    /api/v1/node/:nodeId/output  
GET    /api/v1/workflow/:workflowId/status
```

### 10. Success Criteria

You'll know Phase 1 is complete when:
- The workflow editor renders in the sandbox without errors
- You can add nodes and connect them
- No authentication errors appear
- No database connection errors occur
- The editor state is managed locally

## Next Steps After Isolation

Once you have the editor working in isolation:

1. Create a fresh Next.js project for BioKit
2. Copy over the isolated components
3. Implement the BioKit-specific nodes
4. Connect to the BioKit backend API

## Need Help?

The extraction plan has three key documents:
- `EXTRACTION_PLAN.md` - Detailed step-by-step plan
- `ARCHITECTURE_NOTES.md` - Technical details about sim-ai
- `EXTRACTION_QUICK_START.md` - This quick reference

Good luck with the extraction! The sim-ai codebase is well-structured, so the extraction should be straightforward once you identify all the dependencies.