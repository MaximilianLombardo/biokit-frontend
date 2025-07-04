'use client'

import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { FileText, HelpCircle, Plus, Settings } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/stores/sidebar/store'
import { useLocalWorkflowRegistry } from '../../stores/workflows/local-registry'
import { SidebarControl } from './components/sidebar-control/sidebar-control'

export function BiokitSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { workflows, activeWorkflowId, createWorkflow, setActiveWorkflow } = useLocalWorkflowRegistry()
  const { mode, isExpanded } = useSidebarStore()
  const [isHovered, setIsHovered] = useState(false)

  // Calculate if sidebar should be collapsed
  const isCollapsed = mode === 'collapsed' || (mode === 'hover' && !isHovered)

  // Get workflows list
  const workflowsList = useMemo(() => {
    return Object.values(workflows).sort((a, b) => {
      // Sort by last modified date (newest first)
      const dateA = a.lastModified instanceof Date 
        ? a.lastModified.getTime() 
        : new Date(a.lastModified).getTime()
      const dateB = b.lastModified instanceof Date 
        ? b.lastModified.getTime() 
        : new Date(b.lastModified).getTime()
      return dateB - dateA
    })
  }, [workflows])

  // Create new workflow
  const handleCreateWorkflow = async () => {
    try {
      const id = await createWorkflow({})
      setActiveWorkflow(id)
    } catch (error) {
      console.error('Error creating workflow:', error)
    }
  }

  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-10 flex flex-col border-r bg-background transition-all duration-200',
        isCollapsed ? 'w-14' : 'w-60',
        mode === 'hover' && 'hover:shadow-lg'
      )}
      onMouseEnter={() => {
        if (mode === 'hover') {
          setIsHovered(true)
        }
      }}
      onMouseLeave={() => {
        if (mode === 'hover') {
          setIsHovered(false)
        }
      }}
    >
      {/* Header */}
      <div className='flex h-14 items-center border-b px-3'>
        {isCollapsed ? (
          <div className='mx-auto text-lg font-bold'>B</div>
        ) : (
          <h1 className='text-lg font-bold'>BioKit</h1>
        )}
      </div>

      {/* Workflows Section */}
      <div className='flex-1 px-2 py-4'>
        <div className={cn(
          'mb-2 flex items-center',
          isCollapsed ? 'justify-center' : 'justify-between px-2'
        )}>
          {!isCollapsed && (
            <>
              <h2 className='text-xs font-medium text-muted-foreground'>Workflows</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='h-6 w-6'
                    onClick={handleCreateWorkflow}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Create new workflow</TooltipContent>
              </Tooltip>
            </>
          )}
          {isCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='icon'
                  variant='ghost'
                  className='h-8 w-8'
                  onClick={handleCreateWorkflow}
                >
                  <Plus className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent side='right'>Create new workflow</TooltipContent>
            </Tooltip>
          )}
        </div>

        <ScrollArea className='h-[calc(100vh-300px)]'>
          <div className='space-y-1'>
            {workflowsList.map((workflow) => (
              <Tooltip key={workflow.id} delayDuration={isCollapsed ? 0 : 1000}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveWorkflow(workflow.id)}
                    className={cn(
                      'flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent',
                      activeWorkflowId === workflow.id && 'bg-accent',
                      isCollapsed && 'justify-center px-0'
                    )}
                  >
                    <FileText className={cn('h-4 w-4 flex-shrink-0', !isCollapsed && 'mr-2')} />
                    {!isCollapsed && (
                      <span className='truncate text-left'>{workflow.name}</span>
                    )}
                  </button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side='right'>{workflow.name}</TooltipContent>
                )}
              </Tooltip>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Bottom Controls */}
      <div className='flex-shrink-0 border-t p-3'>
        <div className={cn(
          'flex items-center',
          isCollapsed ? 'flex-col space-y-2' : 'justify-between'
        )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size='icon'
                variant='ghost'
                className='h-8 w-8'
                onClick={() => {
                  // TODO: Implement settings modal
                  console.log('Settings clicked')
                }}
              >
                <Settings className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isCollapsed ? 'right' : 'top'}>Settings</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size='icon'
                variant='ghost'
                className='h-8 w-8'
                onClick={() => {
                  // TODO: Implement help modal
                  console.log('Help clicked')
                }}
              >
                <HelpCircle className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isCollapsed ? 'right' : 'top'}>Help</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarControl />
            </TooltipTrigger>
            <TooltipContent side={isCollapsed ? 'right' : 'top'}>Toggle sidebar</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  )
}