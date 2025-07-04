'use client'

import { useState } from 'react'
import { Play, Save, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useWorkflowStore } from '../../stores/workflows/workflow/store'
import { useWorkflowRegistry } from '../../stores/workflows/registry/store'

export function BiokitControlBar() {
  const [isExecuting, setIsExecuting] = useState(false)
  const blocks = useWorkflowStore((state) => Object.values(state.blocks || {}))
  const edges = useWorkflowStore((state) => state.edges || [])
  const activeWorkflow = useWorkflowRegistry((state) => 
    state.activeWorkflowId ? state.workflows[state.activeWorkflowId] : null
  )

  const handleExecute = async () => {
    setIsExecuting(true)
    // Mock execution
    console.log('Executing workflow with blocks:', blocks)
    console.log('Edges:', edges)
    
    setTimeout(() => {
      setIsExecuting(false)
      console.log('Workflow execution complete')
    }, 2000)
  }

  const handleSave = () => {
    const workflow = {
      blocks: useWorkflowStore.getState().blocks,
      edges: useWorkflowStore.getState().edges,
      loops: useWorkflowStore.getState().loops,
      parallels: useWorkflowStore.getState().parallels,
    }
    console.log('Saving workflow:', workflow)
  }

  const handleExport = () => {
    const workflow = {
      name: activeWorkflow?.name || 'biokit-workflow',
      blocks: useWorkflowStore.getState().blocks,
      edges: useWorkflowStore.getState().edges,
      loops: useWorkflowStore.getState().loops,
      parallels: useWorkflowStore.getState().parallels,
    }
    
    const json = JSON.stringify(workflow, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflow.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-[52px] items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-medium">
          {activeWorkflow?.name || 'BioKit Workflow Editor'}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleSave}
        >
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleExport}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button
          size="sm"
          onClick={handleExecute}
          disabled={isExecuting || blocks.length === 0}
        >
          {isExecuting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Executing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Workflow
            </>
          )}
        </Button>
      </div>
    </div>
  )
}