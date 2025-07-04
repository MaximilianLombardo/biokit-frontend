import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { useBiokitStore } from '../stores/biokit-store'

export const BiokitNode = memo(({ id, data, selected }: NodeProps) => {
  const { deleteNode } = useBiokitStore()
  
  return (
    <div
      className={`rounded-lg border bg-card p-4 shadow-sm ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="h-2 w-2 bg-primary"
      />
      
      <div className="min-w-[150px]">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{data.label || 'BioKit Node'}</h3>
          <button
            onClick={() => deleteNode(id)}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            ×
          </button>
        </div>
        
        {data.description && (
          <p className="mt-1 text-xs text-muted-foreground">{data.description}</p>
        )}
        
        {data.type && (
          <div className="mt-2 text-xs text-muted-foreground">
            Type: {data.type}
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="h-2 w-2 bg-primary"
      />
    </div>
  )
})