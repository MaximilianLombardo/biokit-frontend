'use client'

import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { Edit, FileText, HelpCircle, LibraryBig, MoreHorizontal, PanelRight, Plus, ScrollText, Settings, Trash } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
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
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '../../stores/sidebar/store'
import { useToolbarStore } from '../../stores/toolbar/store'
import { useLocalWorkflowRegistry } from '../../stores/workflows/local-registry'
import { SidebarControl } from './components/sidebar-control/sidebar-control'
import { BiokitSettingsModal } from './components/settings-modal/biokit-settings-modal'
import { BiokitLogsModal } from '../logs-modal/biokit-logs-modal'
import { BiokitKnowledgeModal } from '../knowledge-modal/biokit-knowledge-modal'

export function BiokitSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { workflows, activeWorkflowId, createWorkflow, setActiveWorkflow, deleteWorkflow, updateWorkflow } = useLocalWorkflowRegistry()
  const isOpen = useSidebarStore((state) => state.isOpen)
  const { toggleToolbar } = useToolbarStore()
  const [workflowToDelete, setWorkflowToDelete] = useState<{ id: string; name: string } | null>(null)
  const [hoveredWorkflowId, setHoveredWorkflowId] = useState<string | null>(null)
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [showKnowledge, setShowKnowledge] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  // Sidebar is collapsed when not open
  const isCollapsed = !isOpen

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

  // Handle starting edit mode
  const handleStartEdit = (workflowId: string, currentName: string) => {
    setEditingWorkflowId(workflowId)
    setEditingName(currentName)
  }

  // Handle saving the edited name
  const handleSaveEdit = () => {
    if (editingWorkflowId && editingName.trim()) {
      updateWorkflow(editingWorkflowId, { name: editingName.trim() })
    }
    setEditingWorkflowId(null)
    setEditingName('')
  }

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingWorkflowId(null)
    setEditingName('')
  }

  // Handle key press in edit mode
  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelEdit()
    }
  }

  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-10 flex flex-col border-r bg-background transition-all duration-200',
        isCollapsed ? 'w-14' : 'w-60'
      )}
    >
      {/* Header */}
      <div className='flex h-[52px] items-center border-b px-3 pt-[21px] pb-0.5'>
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

        <ScrollArea className='h-[calc(100vh-400px)]'>
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
                      {editingWorkflowId === workflow.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={handleSaveEdit}
                          onKeyDown={handleEditKeyDown}
                          onClick={(e) => e.stopPropagation()}
                          className='h-6 px-1 py-0 text-sm'
                          autoFocus
                        />
                      ) : (
                        <span 
                          className='truncate text-left'
                          onDoubleClick={(e) => {
                            e.stopPropagation()
                            handleStartEdit(workflow.id, workflow.name)
                          }}
                        >
                          {workflow.name}
                        </span>
                      )}
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          disabled={editingWorkflowId === workflow.id}
                          className={cn(
                            'h-8 w-8 transition-opacity focus:ring-0 focus:ring-offset-0',
                            hoveredWorkflowId === workflow.id && editingWorkflowId !== workflow.id ? 'opacity-100' : 'opacity-0'
                          )}
                        >
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='z-50'>
                        <DropdownMenuItem
                          onClick={() => handleStartEdit(workflow.id, workflow.name)}
                          className='cursor-pointer'
                        >
                          <Edit className='mr-2 h-4 w-4' />
                          Rename
                        </DropdownMenuItem>
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
      <div className='flex-shrink-0 border-t p-3 pb-6'>
        <motion.div 
          className={cn(
            'flex items-center',
            isCollapsed ? 'flex-col space-y-2' : 'flex-row-reverse justify-between'
          )}
          layout={!shouldReduceMotion}
          transition={{ 
            duration: 0.3, 
            ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier for smoother motion
            layout: {
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1]
            }
          }}
        >
          <motion.div 
            layout={!shouldReduceMotion} 
            transition={{ 
              duration: 0.3, 
              delay: 0,
              ease: [0.4, 0, 0.2, 1],
              layout: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='icon'
                  variant='ghost'
                  className='h-8 w-8'
                  onClick={toggleToolbar}
                >
                  <PanelRight className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isCollapsed ? 'right' : 'top'}>Toggle Toolbar</TooltipContent>
            </Tooltip>
          </motion.div>

          <motion.div 
            layout={!shouldReduceMotion} 
            transition={{ 
              duration: 0.3, 
              delay: 0.05,
              ease: [0.4, 0, 0.2, 1],
              layout: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='icon'
                  variant='ghost'
                  className='h-8 w-8'
                  onClick={() => setShowLogs(true)}
                >
                  <ScrollText className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isCollapsed ? 'right' : 'top'}>Logs</TooltipContent>
            </Tooltip>
          </motion.div>

          <motion.div 
            layout={!shouldReduceMotion} 
            transition={{ 
              duration: 0.3, 
              delay: 0.1,
              ease: [0.4, 0, 0.2, 1],
              layout: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='icon'
                  variant='ghost'
                  className='h-8 w-8'
                  onClick={() => setShowKnowledge(true)}
                >
                  <LibraryBig className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isCollapsed ? 'right' : 'top'}>Knowledge Base</TooltipContent>
            </Tooltip>
          </motion.div>

          <motion.div 
            layout={!shouldReduceMotion} 
            transition={{ 
              duration: 0.3, 
              delay: 0.15,
              ease: [0.4, 0, 0.2, 1],
              layout: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='icon'
                  variant='ghost'
                  className='h-8 w-8'
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isCollapsed ? 'right' : 'top'}>Settings</TooltipContent>
            </Tooltip>
          </motion.div>

          <motion.div 
            layout={!shouldReduceMotion} 
            transition={{ 
              duration: 0.3, 
              delay: 0.2,
              ease: [0.4, 0, 0.2, 1],
              layout: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
          >
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
          </motion.div>

          <motion.div 
            layout={!shouldReduceMotion} 
            transition={{ 
              duration: 0.3, 
              delay: 0.25,
              ease: [0.4, 0, 0.2, 1],
              layout: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarControl />
              </TooltipTrigger>
              <TooltipContent side={isCollapsed ? 'right' : 'top'}>Toggle sidebar</TooltipContent>
            </Tooltip>
          </motion.div>
        </motion.div>
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

      {/* Settings Modal */}
      <BiokitSettingsModal 
        open={showSettings} 
        onOpenChange={setShowSettings} 
      />

      {/* Logs Modal */}
      <BiokitLogsModal 
        open={showLogs} 
        onOpenChange={setShowLogs} 
      />

      {/* Knowledge Modal */}
      <BiokitKnowledgeModal 
        open={showKnowledge} 
        onOpenChange={setShowKnowledge} 
      />
    </aside>
  )
}