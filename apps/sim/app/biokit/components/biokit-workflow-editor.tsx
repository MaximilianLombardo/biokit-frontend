import { useCallback } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  type Node,
  type OnConnect,
  type NodeTypes,
} from 'reactflow'
import { useBiokitStore } from '../stores/biokit-store'
import { BiokitNode } from './biokit-node'
import { NodeToolbar } from './node-toolbar'

const nodeTypes: NodeTypes = {
  biokit: BiokitNode,
}

export function BiokitWorkflowEditor() {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect,
    getWorkflowJSON 
  } = useBiokitStore()
  
  const reactFlowInstance = useReactFlow()

  const handleExport = useCallback(() => {
    const workflow = getWorkflowJSON()
    const json = JSON.stringify(workflow, null, 2)
    console.log('Exported workflow:', json)
    
    // Create download link
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'biokit-workflow.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [getWorkflowJSON])

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
        
        <Panel position="top-left">
          <NodeToolbar />
        </Panel>
        
        <Panel position="top-right" className="space-x-2">
          <button
            onClick={handleExport}
            className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Export JSON
          </button>
        </Panel>
      </ReactFlow>
    </div>
  )
}