'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useBiokitPermissions } from '../../hooks/use-biokit-permissions'
import { getAllBlocks, getBlocksByCategory } from '@/blocks'
import type { BlockCategory } from '@/blocks/types'
import { useSidebarStore } from '@/stores/sidebar/store'
import { useToolbarStore } from '../../stores/toolbar/store'
import { useLocalWorkflowRegistry } from '../../stores/workflows/local-registry'
import { ToolbarBlock } from './components/toolbar-block/toolbar-block'
import LoopToolbarItem from './components/toolbar-loop-block/toolbar-loop-block'
import ParallelToolbarItem from './components/toolbar-parallel-block/toolbar-parallel-block'
import { ToolbarTabs } from './components/toolbar-tabs/toolbar-tabs'

interface ToolbarButtonProps {
  onClick: () => void
  className: string
  children: React.ReactNode
  tooltipContent: string
  tooltipSide?: 'left' | 'right' | 'top' | 'bottom'
}

const ToolbarButton = React.memo<ToolbarButtonProps>(
  ({ onClick, className, children, tooltipContent, tooltipSide = 'right' }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button onClick={onClick} className={className}>
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>{tooltipContent}</TooltipContent>
    </Tooltip>
  )
)

ToolbarButton.displayName = 'ToolbarButton'

export const BiokitToolbar = React.memo(() => {
  // Get the active workflow from the registry
  const { activeWorkflowId, workflows } = useLocalWorkflowRegistry()

  const currentWorkflow = useMemo(
    () => (activeWorkflowId ? workflows[activeWorkflowId] : null),
    [activeWorkflowId, workflows]
  )

  const userPermissions = useBiokitPermissions()

  const [activeTab, setActiveTab] = useState<BlockCategory>('blocks')
  const [searchQuery, setSearchQuery] = useState('')
  const { mode, isExpanded } = useSidebarStore()
  const isToolbarOpen = useToolbarStore((state) => state.isOpen)

  // In hover mode, act as if sidebar is always collapsed for layout purposes
  const isSidebarCollapsed = useMemo(
    () => (mode === 'expanded' ? !isExpanded : mode === 'collapsed' || mode === 'hover'),
    [mode, isExpanded]
  )

  const blocks = useMemo(() => {
    const filteredBlocks = !searchQuery.trim() ? getBlocksByCategory(activeTab) : getAllBlocks()

    return filteredBlocks.filter((block) => {
      if (block.type === 'starter' || block.hideFromToolbar) return false

      return (
        !searchQuery.trim() ||
        block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
  }, [searchQuery, activeTab])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleTabChange = useCallback((tab: BlockCategory) => {
    setActiveTab(tab)
  }, [])

  // Don't render toolbar when closed (sidebar will show the open button)
  if (!isToolbarOpen) {
    return null
  }

  return (
    <div
      className={`fixed transition-all duration-200 ${isSidebarCollapsed ? 'left-14' : 'left-60'} top-16 z-10 h-[calc(100vh-4rem)] w-60 border-r bg-background sm:block`}
    >
      <div className='flex h-full flex-col'>
        <div className='sticky top-0 z-20 bg-background px-4 pt-4 pb-1'>
          <div className='relative'>
            <Search className='-translate-y-[50%] absolute top-[50%] left-3 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search...'
              className='rounded-md pl-9'
              value={searchQuery}
              onChange={handleSearchChange}
              autoComplete='off'
              autoCorrect='off'
              autoCapitalize='off'
              spellCheck='false'
            />
          </div>
        </div>

        {!searchQuery && (
          <div className='sticky top-[72px] z-20 bg-background'>
            <ToolbarTabs activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
        )}

        <ScrollArea className='h-[calc(100%-4rem)]'>
          <div className='p-4 pb-20'>
            <div className='flex flex-col gap-3'>
              {blocks.map((block) => (
                <ToolbarBlock key={block.type} config={block} disabled={!userPermissions.canEdit} />
              ))}
              {activeTab === 'blocks' && !searchQuery && (
                <>
                  <LoopToolbarItem disabled={!userPermissions.canEdit} />
                  <ParallelToolbarItem disabled={!userPermissions.canEdit} />
                </>
              )}
            </div>
          </div>
        </ScrollArea>

      </div>
    </div>
  )
})

BiokitToolbar.displayName = 'BiokitToolbar'
