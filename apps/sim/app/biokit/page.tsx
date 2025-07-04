'use client'

import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'

// Dynamically import the simplified biokit workflow to avoid SSR issues
const Workflow = dynamic(() => import('./biokit-workflow'), {
  ssr: false,
})

// Create a wrapper component that provides mock context
function BiokitWorkflowWrapper() {
  // Mock the params that workflow expects
  const mockParams = { id: 'biokit-demo' }
  
  return (
    <div className="h-full w-full">
      {/* The workflow component will handle its own layout */}
      <Workflow />
    </div>
  )
}

export default function BiokitPage() {
  return (
    <div className="h-screen w-screen bg-background">
      <Suspense fallback={
        <div className="flex h-full items-center justify-center">
          <p>Loading BioKit workflow editor...</p>
        </div>
      }>
        <TooltipProvider>
          <ReactFlowProvider>
            <BiokitWorkflowWrapper />
          </ReactFlowProvider>
        </TooltipProvider>
      </Suspense>
    </div>
  )
}