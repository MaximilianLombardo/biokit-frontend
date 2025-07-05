'use client'

import { useState } from 'react'
import { X, Plus, Search, FileText, Upload, Trash2, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface BiokitKnowledgeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface KnowledgeBase {
  id: string
  name: string
  description?: string
  documentCount: number
  tokenCount: number
  createdAt: Date
  updatedAt: Date
}

interface Document {
  id: string
  knowledgeBaseId: string
  filename: string
  fileSize: number
  chunkCount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  uploadedAt: Date
}

// Mock data for now
const mockKnowledgeBases: KnowledgeBase[] = [
  {
    id: '1',
    name: 'Bioinformatics Papers',
    description: 'Collection of research papers on single-cell analysis',
    documentCount: 12,
    tokenCount: 45000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '2',
    name: 'Protocol Documentation',
    description: 'Lab protocols and experimental procedures',
    documentCount: 8,
    tokenCount: 28000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
]

export function BiokitKnowledgeModal({ open, onOpenChange }: BiokitKnowledgeModalProps) {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>(mockKnowledgeBases)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBase, setSelectedBase] = useState<KnowledgeBase | null>(null)
  const [activeTab, setActiveTab] = useState('bases')

  // Filter knowledge bases based on search
  const filteredBases = knowledgeBases.filter((base) =>
    base.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    base.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTokenCount = (count: number) => {
    if (count < 1000) return count.toString()
    if (count < 1000000) return (count / 1000).toFixed(1) + 'K'
    return (count / 1000000).toFixed(1) + 'M'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex h-[85vh] flex-col gap-0 p-0 sm:max-w-[1200px]' hideCloseButton>
        <DialogHeader className='border-b px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <DialogTitle className='font-medium text-lg'>Knowledge Base</DialogTitle>
              <p className='text-sm text-muted-foreground mt-1'>
                Build and search your document collections with AI
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className='flex-1 flex flex-col'>
          <div className='border-b px-6'>
            <TabsList className='h-10 p-0 bg-transparent'>
              <TabsTrigger value='bases' className='data-[state=active]:shadow-none'>
                Knowledge Bases
              </TabsTrigger>
              <TabsTrigger value='search' className='data-[state=active]:shadow-none'>
                Search
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='bases' className='flex-1 flex flex-col m-0'>
            {/* Search and Actions Bar */}
            <div className='flex items-center gap-4 border-b px-6 py-3'>
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Search knowledge bases...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10 h-8'
                />
              </div>
              <Button size='sm' className='h-8'>
                <Plus className='mr-2 h-4 w-4' />
                New Base
              </Button>
            </div>

            {/* Knowledge Bases Grid */}
            <ScrollArea className='flex-1 px-6 py-4'>
              {filteredBases.length === 0 ? (
                <div className='flex h-full items-center justify-center'>
                  <div className='text-center'>
                    <Database className='mx-auto h-12 w-12 text-muted-foreground' />
                    <h3 className='mt-4 text-lg font-semibold'>No knowledge bases found</h3>
                    <p className='mt-2 text-sm text-muted-foreground'>
                      {searchQuery ? 'Try a different search term' : 'Create your first knowledge base to get started'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className='grid gap-4 md:grid-cols-2'>
                  {filteredBases.map((base) => (
                    <div
                      key={base.id}
                      className='group relative rounded-lg border bg-card p-4 hover:shadow-md transition-all cursor-pointer'
                      onClick={() => setSelectedBase(base)}
                    >
                      <div className='flex items-start justify-between mb-3'>
                        <div className='space-y-1'>
                          <h3 className='font-medium'>{base.name}</h3>
                          {base.description && (
                            <p className='text-xs text-muted-foreground'>
                              {base.description}
                            </p>
                          )}
                        </div>
                        <Button
                          size='icon'
                          variant='ghost'
                          className='h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity'
                          onClick={(e) => {
                            e.stopPropagation()
                            // TODO: Implement delete
                          }}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                      
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4 text-sm'>
                          <div className='flex items-center gap-1'>
                            <FileText className='h-3.5 w-3.5 text-muted-foreground' />
                            <span>{base.documentCount} docs</span>
                          </div>
                          <Badge variant='secondary' className='text-xs'>
                            {formatTokenCount(base.tokenCount)} tokens
                          </Badge>
                        </div>
                        
                        <div className='flex items-center gap-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            className='h-7 text-xs'
                            onClick={(e) => {
                              e.stopPropagation()
                              // TODO: Implement upload
                            }}
                          >
                            <Upload className='mr-1 h-3 w-3' />
                            Upload
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value='search' className='flex-1 flex flex-col m-0'>
            <div className='flex-1 flex items-center justify-center text-muted-foreground'>
              <div className='text-center'>
                <Search className='mx-auto h-12 w-12 mb-4' />
                <p>Vector search functionality coming soon</p>
                <p className='text-sm mt-2'>Search across all your knowledge bases using AI</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}