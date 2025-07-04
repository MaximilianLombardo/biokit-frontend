'use client'

const shortcuts = [
  { keys: ['Cmd/Ctrl', 'S'], description: 'Save workflow' },
  { keys: ['Cmd/Ctrl', 'Z'], description: 'Undo' },
  { keys: ['Cmd/Ctrl', 'Shift', 'Z'], description: 'Redo' },
  { keys: ['Delete/Backspace'], description: 'Delete selected nodes' },
  { keys: ['Cmd/Ctrl', 'C'], description: 'Copy selected nodes' },
  { keys: ['Cmd/Ctrl', 'V'], description: 'Paste nodes' },
  { keys: ['Cmd/Ctrl', 'A'], description: 'Select all nodes' },
  { keys: ['Escape'], description: 'Clear selection' },
]

export function BiokitShortcutsSettings() {
  return (
    <div className='space-y-6 p-6'>
      <div>
        <h2 className='mb-[22px] font-medium text-lg'>Keyboard Shortcuts</h2>
        <div className='space-y-3'>
          {shortcuts.map((shortcut, index) => (
            <div key={index} className='flex items-center justify-between py-2'>
              <span className='text-sm text-muted-foreground'>{shortcut.description}</span>
              <div className='flex gap-1'>
                {shortcut.keys.map((key, keyIndex) => (
                  <span key={keyIndex} className='flex items-center gap-1 text-sm'>
                    <kbd className='rounded border bg-muted px-2 py-1 font-mono text-xs'>
                      {key}
                    </kbd>
                    {keyIndex < shortcut.keys.length - 1 && <span>+</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}