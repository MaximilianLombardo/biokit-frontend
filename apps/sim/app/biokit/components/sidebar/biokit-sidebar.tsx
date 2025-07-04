'use client'

import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { FileText, HelpCircle, MoreHorizontal, Plus, Settings, Trash } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/stores/sidebar/store'
import { useLocalWorkflowRegistry } from '../../stores/workflows/local-registry'
import { SidebarControl } from './components/sidebar-control/sidebar-control'

export function BiokitSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { workflows, activeWorkflowId, createWorkflow, setActiveWorkflow, deleteWorkflow } = useLocalWorkflowRegistry()
  const { mode, isExpanded } = useSidebarStore()
  const [isHovered, setIsHovered] = useState(false)
  const [workflowToDelete, setWorkflowToDelete] = useState<{ id: string; name: string } | null>(null)
  const [hoveredWorkflowId, setHoveredWorkflowId] = useState<string | null>(null)

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

  // Handle workflow deletion
  const handleDeleteWorkflow = () => {
    if (!workflowToDelete) return

    const { id } = workflowToDelete
    const workflowIds = Object.keys(workflows)
    const deletingActiveWorkflow = id === activeWorkflowId

    // Delete the workflow
    deleteWorkflow(id)

    // If we deleted the active workflow, switch to another one
    if (deletingActiveWorkflow) {
      const remainingWorkflows = workflowIds.filter(wId => wId !== id)
      if (remainingWorkflows.length > 0) {
        // Switch to the first remaining workflow
        setActiveWorkflow(remainingWorkflows[0])
      } else {
        // No workflows left, create a new one
        handleCreateWorkflow()
      }
    }

    setWorkflowToDelete(null)
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
              <div
                key={workflow.id}
                className='group relative'
                onMouseEnter={() => setHoveredWorkflowId(workflow.id)}
                onMouseLeave={() => setHoveredWorkflowId(null)}
              >
                {isCollapsed ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setActiveWorkflow(workflow.id)}
                        className={cn(
                          'flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent',
                          activeWorkflowId === workflow.id && 'bg-accent',
                          'justify-center px-0'
                        )}
                      >
                        <FileText className='h-4 w-4 flex-shrink-0' />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side='right'>{workflow.name}</TooltipContent>
                  </Tooltip>
                ) : (
                  <div className='flex items-center'>
                    <button
                      onClick={() => setActiveWorkflow(workflow.id)}
                      className={cn(
                        'flex flex-1 items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent',
                        activeWorkflowId === workflow.id && 'bg-accent'
                      )}
                    >
                      <FileText className='mr-2 h-4 w-4 flex-shrink-0' />
                      <span className='truncate text-left'>{workflow.name}</span>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className={cn(
                            'h-8 w-8 transition-opacity',
                            hoveredWorkflowId === workflow.id ? 'opacity-100' : 'opacity-0'
                          )}
                        >
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='z-50'>
                        <DropdownMenuItem
                          onClick={() => setWorkflowToDelete({ id: workflow.id, name: workflow.name })}
                          className='cursor-pointer text-destructive focus:text-destructive'
                        >
                          <Trash className='mr-2 h-4 w-4' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!workflowToDelete} onOpenChange={(open) => !open && setWorkflowToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{workflowToDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The workflow and all its content will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkflow}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  )
}