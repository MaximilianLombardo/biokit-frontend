import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  isOpen: boolean
  toggle: () => void
  setOpen: (open: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true, // Default to open
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setOpen: (open) => set({ isOpen: open }),
    }),
    {
      name: 'sidebar-state',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // If there's an old mode property, migrate it
        if (persistedState.mode !== undefined) {
          return {
            isOpen: persistedState.mode === 'expanded' || persistedState.mode === 'hover',
          }
        }
        
        // If there's an old isExpanded property, use it
        if (persistedState.isExpanded !== undefined) {
          return {
            isOpen: persistedState.isExpanded,
          }
        }
        
        return persistedState
      },
    }
  )
)