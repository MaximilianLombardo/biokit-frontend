import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { ToolbarStore } from './types'

export const useToolbarStore = create<ToolbarStore>()(
  devtools(
    persist(
      (set) => ({
        isOpen: true,
        
        toggleToolbar: () => {
          set((state) => ({ isOpen: !state.isOpen }))
        },
        
        setToolbarOpen: (open: boolean) => {
          set({ isOpen: open })
        },
      }),
      {
        name: 'toolbar-store',
      }
    )
  )
)