'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { X, Clock, AlertCircle, Info, CheckCircle, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useLocalWorkflowRegistry } from '@/app/biokit/stores/workflows/local-registry'

interface BiokitLogsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface LogEntry {
  id: string
  workflowId: string
  executionId: string
  level: 'info' | 'error' | 'warning' | 'success'
  message: string
  timestamp: Date
  duration?: string
  metadata?: any
}

// Mock data for now - will be replaced with actual log service
const mockLogs: LogEntry[] = [
  {
    id: '1',
    workflowId: 'biokit-demo',
    executionId: 'exec-1',
    level: 'info',
    message: 'Workflow execution started',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  },
  {
    id: '2',
    workflowId: 'biokit-demo',
    executionId: 'exec-1',
    level: 'success',
    message: 'Data preprocessing completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    duration: '1.2s',
  },
  {
    id: '3',
    workflowId: 'biokit-demo',
    executionId: 'exec-1',
    level: 'warning',
    message: 'Low memory warning during UMAP computation',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
  },
  {
    id: '4',
    workflowId: 'biokit-demo',
    executionId: 'exec-1',
    level: 'error',
    message: 'Failed to save output: Permission denied',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
  },
]

export function BiokitLogsModal({ open, onOpenChange }: BiokitLogsModalProps) {
  const { workflows } = useLocalWorkflowRegistry()
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs)
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')

  // Filter logs based on selected workflow and level
  const filteredLogs = logs.filter((log) => {
    const matchesWorkflow = selectedWorkflow === 'all' || log.workflowId === selectedWorkflow
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel
    return matchesWorkflow && matchesLevel
  })

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'info':
        return <Info className="h-4 w-4" />
      case 'error':
        return <AlertCircle className="h-4 w-4" />
      case 'warning':
        return <AlertCircle className="h-4 w-4" />
      case 'success':
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info':
        return 'text-blue-600 dark:text-blue-400'
      case 'error':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'success':
        return 'text-green-600 dark:text-green-400'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex h-[85vh] flex-col gap-0 p-0 sm:max-w-[1200px]' hideCloseButton>
        <DialogHeader className='border-b px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <DialogTitle className='font-medium text-lg'>Workflow Logs</DialogTitle>
              <p className='text-sm text-muted-foreground mt-1'>
                Monitor and debug your workflow executions
              </p>
            </div>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 p-0'
              onClick={() => onOpenChange(false)}
            >
              <X className='h-4 w-4' />
              <span className='sr-only'>Close</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Filters */}
        <div className='flex items-center gap-4 border-b px-6 py-3'>
          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm font-medium'>Filters:</span>
          </div>
          
          {/* Workflow Filter */}
          <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
            <SelectTrigger className='w-[200px] h-8'>
              <SelectValue placeholder="All workflows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All workflows</SelectItem>
              {Object.values(workflows).map((workflow) => (
                <SelectItem key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Level Filter */}
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className='w-[150px] h-8'>
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>

          <div className='ml-auto text-sm text-muted-foreground'>
            {filteredLogs.length} entries
          </div>
        </div>

        {/* Logs Content */}
        <ScrollArea className='flex-1 px-6 py-4'>
          <div className='space-y-2'>
            {filteredLogs.length === 0 ? (
              <div className='flex h-32 items-center justify-center text-muted-foreground'>
                No logs found for the selected filters
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className='rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors'
                >
                  <div className='flex items-start gap-3'>
                    <div className={cn('mt-0.5', getLogColor(log.level))}>
                      {getLogIcon(log.level)}
                    </div>
                    <div className='flex-1 space-y-1'>
                      <div className='flex items-center justify-between'>
                        <p className='text-sm font-medium'>{log.message}</p>
                        {log.duration && (
                          <span className='text-xs text-muted-foreground'>
                            {log.duration}
                          </span>
                        )}
                      </div>
                      <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                        <span className='flex items-center gap-1'>
                          <Clock className='h-3 w-3' />
                          {format(log.timestamp, 'HH:mm:ss')}
                        </span>
                        <span>Execution: {log.executionId}</span>
                        <span className='capitalize'>{log.level}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}