import { useCallback } from 'react'
import { useReactFlow } from 'reactflow'
import { useBiokitStore } from '../stores/biokit-store'

const nodeTypes = [
  { type: 'input', label: 'Data Input', description: 'Load data from file' },
  { type: 'processing', label: 'Process', description: 'Transform or analyze data' },
  { type: 'visualization', label: 'Visualize', description: 'Create plots and charts' },
  { type: 'output', label: 'Output', description: 'Save results' },
]

export function NodeToolbar() {
  const { addNode } = useBiokitStore()
  const reactFlowInstance = useReactFlow()
  
  const handleAddNode = useCallback((nodeType: typeof nodeTypes[0]) => {
    const position = reactFlowInstance.project({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    })
    
    const newNode = {
      id: `${nodeType.type}_${Date.now()}`,
      type: 'biokit',
      position,
      data: {
        label: nodeType.label,
        description: nodeType.description,
        type: nodeType.type,
      },
    }
    
    addNode(newNode)
  }, [addNode, reactFlowInstance])
  
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <h3 className="mb-2 text-sm font-medium">Add Nodes</h3>
      <div className="space-y-1">
        {nodeTypes.map((nodeType) => (
          <button
            key={nodeType.type}
            onClick={() => handleAddNode(nodeType)}
            className="block w-full rounded px-3 py-1 text-left text-sm hover:bg-muted"
          >
            {nodeType.label}
          </button>
        ))}
      </div>
    </div>
  )
}