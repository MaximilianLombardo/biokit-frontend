// Mock keyboard shortcuts hook for standalone mode

export function useKeyboardShortcuts() {
  // In standalone mode, return empty implementation
  return {
    registerShortcut: () => {},
    unregisterShortcut: () => {},
  }
}

export function getKeyboardShortcutText(keys: string[]): string {
  // Simple implementation for displaying keyboard shortcuts
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
  
  return keys.map(key => {
    switch(key) {
      case 'cmd':
        return isMac ? '⌘' : 'Ctrl'
      case 'shift':
        return '⇧'
      case 'alt':
        return isMac ? '⌥' : 'Alt'
      default:
        return key.toUpperCase()
    }
  }).join('+')
}