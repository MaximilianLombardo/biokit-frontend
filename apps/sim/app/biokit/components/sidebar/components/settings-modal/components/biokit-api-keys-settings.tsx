'use client'

import { useState } from 'react'
import { Copy, Eye, EyeOff, RotateCw, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function BiokitApiKeysSettings() {
  const [apiKey, setApiKey] = useState('bk_1234567890abcdef')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyApiKey = async () => {
    await navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGenerateNewKey = async () => {
    setIsGenerating(true)
    // Simulate API call
    setTimeout(() => {
      const newKey = `bk_${Math.random().toString(36).substring(2, 18)}`
      setApiKey(newKey)
      setIsGenerating(false)
    }, 1000)
  }

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h2 className='mb-[22px] font-medium text-lg'>API Keys</h2>
        <p className='text-sm text-muted-foreground mb-6'>
          Manage your BioKit API keys for authenticating workflow executions and accessing BioKit services.
        </p>

        <div className='space-y-6'>
          {/* Current API Key */}
          <div className='space-y-4'>
            <div>
              <Label htmlFor='api-key' className='text-sm font-medium'>
                Current API Key
              </Label>
              <p className='text-xs text-muted-foreground mt-1'>
                Use this key to authenticate requests to the BioKit API
              </p>
            </div>
            
            <div className='flex gap-2'>
              <div className='relative flex-1'>
                <Input
                  id='api-key'
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  readOnly
                  className='font-mono pr-10'
                />
                <Button
                  variant='ghost'
                  size='sm'
                  className='absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0'
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </Button>
              </div>
              <Button
                variant='outline'
                size='default'
                onClick={handleCopyApiKey}
                disabled={copied}
              >
                {copied ? (
                  <>
                    <CheckCircle className='h-4 w-4 mr-2' />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className='h-4 w-4 mr-2' />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Generate New Key */}
          <div className='pt-4 border-t'>
            <div className='space-y-4'>
              <div>
                <h3 className='text-sm font-medium'>Generate New API Key</h3>
                <p className='text-xs text-muted-foreground mt-1'>
                  Generate a new API key. This will invalidate your current key.
                </p>
              </div>
              <Button
                variant='outline'
                onClick={handleGenerateNewKey}
                disabled={isGenerating}
              >
                <RotateCw className={cn('h-4 w-4 mr-2', isGenerating && 'animate-spin')} />
                {isGenerating ? 'Generating...' : 'Generate New Key'}
              </Button>
            </div>
          </div>

          {/* API Endpoint */}
          <div className='pt-4 border-t'>
            <div className='space-y-4'>
              <div>
                <h3 className='text-sm font-medium'>API Endpoint</h3>
                <p className='text-xs text-muted-foreground mt-1'>
                  Configure the BioKit API endpoint for your workflows
                </p>
              </div>
              <Input
                placeholder='https://api.biokit.io'
                defaultValue='http://localhost:8000'
                className='font-mono'
              />
            </div>
          </div>

          {/* Usage */}
          <div className='pt-4 border-t'>
            <h3 className='text-sm font-medium mb-3'>Usage Example</h3>
            <div className='bg-muted rounded-lg p-4'>
              <pre className='text-xs font-mono overflow-x-auto'>
{`curl -X POST http://localhost:8000/api/workflows/execute \\
  -H "Authorization: Bearer ${showApiKey ? apiKey : 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"workflow_id": "123", "parameters": {}}'`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}