export interface ToolbarStore {
  isOpen: boolean
  toggleToolbar: () => void
  setToolbarOpen: (open: boolean) => void
}