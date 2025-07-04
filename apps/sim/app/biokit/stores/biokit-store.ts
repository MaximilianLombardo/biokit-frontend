import { create } from 'zustand'
import type { Node, Edge, Connection, EdgeChange, NodeChange } from 'reactflow'
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow'

interface BiokitWorkflowState {
  nodes: Node[]
  edges: Edge[]
  selectedNodes: Set<string>
  
  // Node operations
  addNode: (node: Node) => void
  updateNode: (id: string, data: any) => void
  deleteNode: (id: string) => void
  onNodesChange: (changes: NodeChange[]) => void
  
  // Edge operations  
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  
  // Selection
  setSelectedNodes: (nodeIds: string[]) => void
  
  // Workflow operations
  clearWorkflow: () => void
  getWorkflowJSON: () => { nodes: Node[], edges: Edge[] }
}

export const useBiokitStore = create<BiokitWorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodes: new Set(),
  
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node]
  })),
  
  updateNode: (id, data) => set((state) => ({
    nodes: state.nodes.map(node => 
      node.id === id ? { ...node, data: { ...node.data, ...data } } : node
    )
  })),
  
  deleteNode: (id) => set((state) => ({
    nodes: state.nodes.filter(n => n.id !== id),
    edges: state.edges.filter(e => e.source !== id && e.target !== id),
    selectedNodes: new Set([...state.selectedNodes].filter(nId => nId !== id))
  })),
  
  onNodesChange: (changes) => set((state) => ({
    nodes: applyNodeChanges(changes, state.nodes)
  })),
  
  onEdgesChange: (changes) => set((state) => ({
    edges: applyEdgeChanges(changes, state.edges)
  })),
  
  onConnect: (connection) => set((state) => ({
    edges: addEdge(connection, state.edges)
  })),
  
  setSelectedNodes: (nodeIds) => set(() => ({
    selectedNodes: new Set(nodeIds)
  })),
  
  clearWorkflow: () => set(() => ({
    nodes: [],
    edges: [],
    selectedNodes: new Set()
  })),
  
  getWorkflowJSON: () => {
    const state = get()
    return {
      nodes: state.nodes,
      edges: state.edges
    }
  }
}))