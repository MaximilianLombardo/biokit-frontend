'use client'

import { useState } from 'react'
import { Plus, Search, FileText, Upload, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '2',
    name: 'Protocol Documentation',
    description: 'Lab protocols and experimental procedures',
    documentCount: 8,
    tokenCount: 28000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
]

export function BiokitKnowledge() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>(mockKnowledgeBases)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBase, setSelectedBase] = useState<KnowledgeBase | null>(null)

  // Filter knowledge bases based on search
  const filteredBases = knowledgeBases.filter((base) =>
    base.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    base.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTokenCount = (count: number) => {
    if (count < 1000) return count.toString()
    if (count < 1000000) return (count / 1000).toFixed(1) + 'K'
    return (count / 1000000).toFixed(1) + 'M'
  }

  return (
    <div className="h-screen w-full bg-background">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b bg-background px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Knowledge Base</h1>
              <p className="text-sm text-muted-foreground">
                Build and search your document collections with AI
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Knowledge Base
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="border-b px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search knowledge bases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {filteredBases.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No knowledge bases found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery ? 'Try a different search term' : 'Create your first knowledge base to get started'}
                </p>
                {!searchQuery && (
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Knowledge Base
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBases.map((base) => (
                <Card
                  key={base.id}
                  className="cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => setSelectedBase(base)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{base.name}</CardTitle>
                        {base.description && (
                          <CardDescription className="text-xs">
                            {base.description}
                          </CardDescription>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 -mr-2 -mt-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Implement delete
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{base.documentCount}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {formatTokenCount(base.tokenCount)} tokens
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Implement upload
                        }}
                      >
                        <Upload className="mr-1 h-3 w-3" />
                        Upload
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Implement search
                        }}
                      >
                        <Search className="mr-1 h-3 w-3" />
                        Search
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}