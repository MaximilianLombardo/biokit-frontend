'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  ConnectionLineType,
  type EdgeTypes,
  type NodeTypes,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { createLogger } from './lib/logs/console-logger'
import { LoopNodeComponent } from './components/loop-node/loop-node'
import { ParallelNodeComponent } from './components/parallel-node/parallel-node'
import { getBlock } from '@/blocks'
import { useExecutionStore } from './stores/execution/store'
import { useNotificationStore } from './stores/notifications/store'
import { useVariablesStore } from './stores/panel/variables/store'
import { useGeneralStore } from './stores/settings/general/store'
import { useSidebarStore } from './stores/sidebar/store'
import { useLocalWorkflowRegistry } from './stores/workflows/local-registry'
import { useLocalWorkflowContent } from './stores/workflows/local-content'
import { useWorkflowStore } from '@/stores/workflows/workflow/store'
import { BiokitControlBar } from './components/control-bar/biokit-control-bar'
import { ErrorBoundary } from './components/error/index'
import { Panel } from './components/panel/panel'
import { SkeletonLoading } from './components/skeleton-loading/skeleton-loading'
import { BiokitToolbar } from './components/toolbar/biokit-toolbar'
import { BiokitWorkflowBlock } from './components/workflow-block/biokit-workflow-block'
import { WorkflowEdge } from './components/workflow-edge/workflow-edge'
import {
  applyAutoLayoutSmooth,
  detectHandleOrientation,
  getNodeAbsolutePosition,
  getNodeDepth,
  getNodeHierarchy,
  isPointInLoopNode,
  resizeLoopNodes,
  updateNodeParent as updateNodeParentUtil,
} from './utils'

const logger = createLogger('BiokitWorkflow')

// Mock permissions - always allow editing in standalone mode
const mockPermissions = {
  canEdit: true,
  canView: true,
  canRun: true,
  canModifyBlock: () => true,
}

// Mock collaborative operations
const mockCollaborativeOps = {
  updateBlock: (id: string, data: any) => {
    // In standalone mode, just update locally
    console.log('Update block:', id, data)
  },
  deleteBlock: (id: string) => {
    console.log('Delete block:', id)
  },
  addBlock: (block: any) => {
    console.log('Add block:', block)
  },
  updateEdge: (edge: any) => {
    console.log('Update edge:', edge)
  },
  deleteEdge: (id: string) => {
    console.log('Delete edge:', id)
  },
}

const WorkflowInner = () => {
  const { getIntersectingNodes, getEdges, getNodes, screenToFlowPosition, project } = useReactFlow()
  
  // Get active workflow from registry
  const { activeWorkflowId, workflows, createWorkflow, setActiveWorkflow } = useLocalWorkflowRegistry()
  const { saveWorkflowContent, loadWorkflowContent } = useLocalWorkflowContent()
  
  // Initialize workflow state before using it
  const [isInitialized, setIsInitialized] = useState(false)
  const [previousWorkflowId, setPreviousWorkflowId] = useState<string | null>(null)
  
  useEffect(() => {
    const initializeWorkflow = async () => {
      // If no active workflow, create a default one
      if (!activeWorkflowId) {
        const newId = await createWorkflow({ name: 'My First Workflow' })
        setActiveWorkflow(newId)
        return
      }
      
      // Save the previous workflow's content before switching
      if (previousWorkflowId && previousWorkflowId !== activeWorkflowId) {
        const currentState = useWorkflowStore.getState()
        saveWorkflowContent(previousWorkflowId, {
          blocks: currentState.blocks || {},
          edges: currentState.edges || [],
          loops: currentState.loops || {},
          parallels: currentState.parallels || {},
        })
      }
      
      // Load the new workflow's content
      const savedContent = loadWorkflowContent(activeWorkflowId)
      if (savedContent) {
        // Ensure all blocks have valid configs
        const blocksWithConfigs = Object.entries(savedContent.blocks).reduce((acc, [id, block]) => {
          const blockType = block.data?.type || block.type
          if (blockType !== 'loop' && blockType !== 'parallel' && blockType !== 'loopNode' && blockType !== 'parallelNode') {
            const blockConfig = getBlock(blockType)
            if (blockConfig) {
              // Ensure the block has a valid config
              acc[id] = {
                ...block,
                data: {
                  ...block.data,
                  config: blockConfig
                }
              }
            } else {
              // Skip blocks with invalid types
              console.warn(`Skipping block with invalid type: ${blockType}`)
            }
          } else {
            // Keep loop and parallel nodes as-is
            acc[id] = block
          }
          return acc
        }, {} as typeof savedContent.blocks)
        
        useWorkflowStore.setState({
          ...savedContent,
          blocks: blocksWithConfigs
        })
      } else {
        // Clear the workflow store for new workflows
        useWorkflowStore.setState({
          blocks: {},
          edges: [],
          loops: {},
          parallels: {},
        })
      }
      
      setPreviousWorkflowId(activeWorkflowId)
      setIsInitialized(true)
    }
    
    initializeWorkflow()
  }, [activeWorkflowId, createWorkflow, setActiveWorkflow, saveWorkflowContent, loadWorkflowContent, previousWorkflowId])
  
  // Get stores - the workflow store manages a single workflow at a time
  const blocks = useWorkflowStore((state) => {
    if (!isInitialized) return []
    // Convert blocks object to array for ReactFlow
    return Object.values(state.blocks || {})
  })
  const edges = useWorkflowStore((state) => isInitialized ? (state.edges || []) : [])
  
  // Auto-save workflow content when it changes
  useEffect(() => {
    if (!activeWorkflowId || !isInitialized) return
    
    const saveTimer = setTimeout(() => {
      const currentState = useWorkflowStore.getState()
      saveWorkflowContent(activeWorkflowId, {
        blocks: currentState.blocks || {},
        edges: currentState.edges || [],
        loops: currentState.loops || {},
        parallels: currentState.parallels || {},
      })
    }, 1000) // Save after 1 second of inactivity
    
    return () => clearTimeout(saveTimer)
  }, [blocks, edges, activeWorkflowId, isInitialized, saveWorkflowContent])
  
  // Save workflow before unloading
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeWorkflowId && isInitialized) {
        const currentState = useWorkflowStore.getState()
        saveWorkflowContent(activeWorkflowId, {
          blocks: currentState.blocks || {},
          edges: currentState.edges || [],
          loops: currentState.loops || {},
          parallels: currentState.parallels || {},
        })
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [activeWorkflowId, isInitialized, saveWorkflowContent])
  

  // Listen for toolbar block click events
  useEffect(() => {
    const handleAddBlockFromToolbar = (event: CustomEvent) => {
      const { type } = event.detail

      if (!type) return

      // Calculate the center position of the viewport
      const centerPosition = project({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      })

      // Generate id and name
      const id = crypto.randomUUID()
      const existingBlocksOfType = blocks.filter((b: any) => (b.data?.type || b.type) === type)
      const blockNumber = existingBlocksOfType.length + 1
      // Get block config
      const blockConfig = getBlock(type)
      const name = type === 'loop' 
        ? `Loop ${blockNumber}` 
        : type === 'parallel' 
          ? `Parallel ${blockNumber}`
          : blockConfig
            ? `${blockConfig.name} ${blockNumber}`
            : `Block ${blockNumber}`
      
      // Create node data
      const nodeType = type === 'loop' 
        ? 'loopNode' 
        : type === 'parallel' 
          ? 'parallelNode' 
          : 'workflowBlock'
      
      const nodeData = {
        id,
        type: nodeType,
        position: centerPosition,
        data: {
          id,
          type,
          name,
          config: blockConfig || {},
        }
      }

      
      // Add block to store
      useWorkflowStore.setState((state) => ({
        blocks: {
          ...state.blocks,
          [id]: nodeData
        }
      }))
    }

    window.addEventListener('add-block-from-toolbar', handleAddBlockFromToolbar as EventListener)

    return () => {
      window.removeEventListener('add-block-from-toolbar', handleAddBlockFromToolbar as EventListener)
    }
  }, [project, blocks])
  
  // Simplified node types
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      workflowBlock: BiokitWorkflowBlock,
      loopNode: LoopNodeComponent,
      parallelNode: ParallelNodeComponent,
    }),
    []
  )
  
  // Simplified edge types
  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      workflowEdge: WorkflowEdge,
    }),
    []
  )
  
  // Helper functions for drag and drop
  const findClosestOutput = useCallback(
    (newNodePosition: { x: number; y: number }) => {
      const existingBlocks = blocks
        .map((block: any) => ({
          id: block.id,
          type: block.data?.type || block.type,
          position: block.position,
          distance: Math.sqrt(
            (block.position.x - newNodePosition.x) ** 2 +
              (block.position.y - newNodePosition.y) ** 2
          ),
        }))
        .sort((a, b) => a.distance - b.distance)

      return existingBlocks[0] || null
    },
    [blocks]
  )

  const determineSourceHandle = useCallback((block: { id: string; type: string }) => {
    let sourceHandle = 'source'

    if (block.type === 'condition') {
      const conditionHandles = document.querySelectorAll(
        `[data-nodeid^="${block.id}"][data-handleid^="condition-"]`
      )
      if (conditionHandles.length > 0) {
        const handleId = conditionHandles[0].getAttribute('data-handleid')
        if (handleId) {
          sourceHandle = handleId
        }
      }
    } else if (block.type === 'loop') {
      sourceHandle = 'loop-end-source'
    } else if (block.type === 'parallel') {
      sourceHandle = 'parallel-end-source'
    }

    return sourceHandle
  }, [])

  // Wrapper for isPointInLoopNode that includes getNodes
  const isPointInLoopNodeWrapper = useCallback(
    (position: { x: number; y: number }) => {
      return isPointInLoopNode(position, getNodes)
    },
    [getNodes]
  )

  // Handle drops
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      try {
        const dataString = event.dataTransfer.getData('application/json')
        const data = JSON.parse(dataString)
        if (data.type === 'connectionBlock') return

        const reactFlowBounds = event.currentTarget.getBoundingClientRect()
        const position = project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        })

        // Check if dropping inside a container node (loop or parallel)
        const containerInfo = isPointInLoopNodeWrapper(position)

        // Clear any drag-over styling
        document
          .querySelectorAll('.loop-node-drag-over, .parallel-node-drag-over')
          .forEach((el) => {
            el.classList.remove('loop-node-drag-over', 'parallel-node-drag-over')
          })
        document.body.style.cursor = ''

        // Get block config
        const blockConfig = getBlock(data.type)
        if (!blockConfig && data.type !== 'loop' && data.type !== 'parallel') {
          logger.error('Invalid block type:', { data })
          return
        }

        // Generate id and name
        const id = crypto.randomUUID()
        const existingBlocksOfType = blocks.filter((b: any) => (b.data?.type || b.type) === data.type)
        const blockNumber = existingBlocksOfType.length + 1
        const name = data.type === 'loop' 
          ? `Loop ${blockNumber}` 
          : data.type === 'parallel' 
            ? `Parallel ${blockNumber}`
            : `${blockConfig!.name} ${blockNumber}`

        // Add block to store
        const addBlock = (nodeData: any) => {
          useWorkflowStore.setState((state) => ({
            blocks: {
              ...state.blocks,
              [id]: nodeData
            }
          }))
        }

        // Add edge to store
        const addEdge = (edgeData: any) => {
          useWorkflowStore.setState((state) => ({
            edges: [...state.edges, edgeData]
          }))
        }

        // Create node data
        const nodeType = data.type === 'loop' 
          ? 'loopNode' 
          : data.type === 'parallel' 
            ? 'parallelNode' 
            : 'workflowBlock'
              
        const nodeData = {
          id,
          type: nodeType,
          position: containerInfo ? {
            x: position.x - containerInfo.loopPosition.x,
            y: position.y - containerInfo.loopPosition.y,
          } : position,
          data: {
            id,
            type: data.type,
            name,
            config: blockConfig || {},
            parentId: containerInfo?.loopId,
            extent: containerInfo ? 'parent' : undefined,
            width: data.type === 'loop' || data.type === 'parallel' ? 500 : undefined,
            height: data.type === 'loop' || data.type === 'parallel' ? 300 : undefined,
          }
        }

        addBlock(nodeData)

        // Auto-connect if enabled (using store directly)
        const isAutoConnectEnabled = useGeneralStore.getState().isAutoConnectEnabled
        if (isAutoConnectEnabled && data.type !== 'starter') {
          const closestBlock = findClosestOutput(position)
          if (closestBlock) {
            const sourceHandle = determineSourceHandle(closestBlock)
            addEdge({
              id: crypto.randomUUID(),
              source: closestBlock.id,
              target: id,
              sourceHandle,
              targetHandle: 'target',
              type: 'workflowEdge',
            })
          }
        }

        // Resize loop nodes if needed
        if (containerInfo) {
          resizeLoopNodes(getNodes, (updates) => {
            // Apply the resize updates
            console.log('Resize updates:', updates)
          })
        }
      } catch (err) {
        logger.error('Error dropping block:', { err })
      }
    },
    [project, blocks, findClosestOutput, determineSourceHandle, isPointInLoopNodeWrapper, getNodes]
  )

  // Handle drag over
  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      if (!event.dataTransfer?.types.includes('application/json')) return

      try {
        const reactFlowBounds = event.currentTarget.getBoundingClientRect()
        const position = project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        })

        const containerInfo = isPointInLoopNodeWrapper(position)

        // Clear previous highlighting
        document
          .querySelectorAll('.loop-node-drag-over, .parallel-node-drag-over')
          .forEach((el) => {
            el.classList.remove('loop-node-drag-over', 'parallel-node-drag-over')
          })

        // Highlight container if hovering over one
        if (containerInfo) {
          const containerElement = document.querySelector(`[data-id="${containerInfo.loopId}"]`)
          if (containerElement) {
            const containerNode = getNodes().find((n) => n.id === containerInfo.loopId)
            const isLoopNode = containerNode?.type === 'loopNode'
            containerElement.classList.add(isLoopNode ? 'loop-node-drag-over' : 'parallel-node-drag-over')
          }
        }

        event.dataTransfer.dropEffect = 'copy'
      } catch (err) {
        logger.error('Error during drag over:', { err })
      }
    },
    [project, isPointInLoopNodeWrapper, getNodes]
  )

  // Don't render until initialized
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Initializing workflow editor...</p>
      </div>
    )
  }
  
  return (
    <div className="h-screen w-screen bg-background">
      <BiokitControlBar />
      <div className="flex h-[calc(100vh-52px)]">
        <BiokitToolbar />
        <div className="relative flex-1">
          <ReactFlow
            nodes={blocks}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={(changes) => {
              // Apply changes to the store
              changes.forEach((change) => {
                if (change.type === 'position' && change.position) {
                  useWorkflowStore.setState((state) => ({
                    blocks: {
                      ...state.blocks,
                      [change.id]: {
                        ...state.blocks[change.id],
                        position: change.position
                      }
                    }
                  }))
                } else if (change.type === 'remove') {
                  // Handle node deletion
                  useWorkflowStore.setState((state) => {
                    const newBlocks = { ...state.blocks }
                    delete newBlocks[change.id]
                    
                    // Also remove any edges connected to this node
                    const newEdges = state.edges.filter(
                      edge => edge.source !== change.id && edge.target !== change.id
                    )
                    
                    return {
                      blocks: newBlocks,
                      edges: newEdges
                    }
                  })
                }
              })
            }}
            onEdgesChange={(changes) => {
              // Handle edge changes
            }}
            onConnect={(connection) => {
              // Handle new connections
            }}
            onDrop={onDrop}
            onDragOver={onDragOver}
            deleteKeyCode={['Backspace', 'Delete']}
            defaultEdgeOptions={{
              type: 'workflowEdge',
              animated: false,
            }}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background />
          </ReactFlow>
        </div>
        <Panel />
      </div>
    </div>
  )
}

export default function BiokitWorkflow() {
  return (
    <ErrorBoundary>
      <ReactFlowProvider>
        <WorkflowInner />
      </ReactFlowProvider>
    </ErrorBoundary>
  )
}