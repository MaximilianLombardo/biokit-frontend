'use client'

import { PanelRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebarStore } from '../../../../stores/sidebar/store'

// Simple toggle button for sidebar open/closed state
export function SidebarControl() {
  const toggle = useSidebarStore((state) => state.toggle)

  return (
    <Button
      variant='ghost'
      size='icon'
      className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-md p-0 text-muted-foreground hover:bg-accent/50'
      onClick={toggle}
    >
      <PanelRight className='h-[18px] w-[18px] text-muted-foreground' />
      <span className='sr-only'>Toggle sidebar</span>
    </Button>
  )
}