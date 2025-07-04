'use client'

import { useState } from 'react'
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface EnvironmentVariable {
  id: string
  key: string
  value: string
  isSecret: boolean
}

export function BiokitEnvironmentSettings() {
  const [variables, setVariables] = useState<EnvironmentVariable[]>([
    { id: '1', key: 'BIOKIT_API_URL', value: 'http://localhost:8000', isSecret: false },
    { id: '2', key: 'DATA_STORAGE_PATH', value: '/Users/data/biokit', isSecret: false },
  ])
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [isSecret, setIsSecret] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  const handleAdd = () => {
    if (newKey && newValue) {
      const newVar: EnvironmentVariable = {
        id: Date.now().toString(),
        key: newKey.toUpperCase().replace(/\s+/g, '_'),
        value: newValue,
        isSecret,
      }
      setVariables([...variables, newVar])
      setNewKey('')
      setNewValue('')
      setIsSecret(false)
    }
  }

  const handleDelete = (id: string) => {
    setVariables(variables.filter(v => v.id !== id))
  }

  const toggleShowSecret = (id: string) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h2 className='mb-[22px] font-medium text-lg'>Environment Variables</h2>
        <p className='text-sm text-muted-foreground mb-4'>
          Configure environment variables for your BioKit workflows. These will be available during workflow execution.
        </p>

        {/* Add new variable form */}
        <div className='space-y-4 mb-6 p-4 border rounded-lg bg-muted/30'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='new-key' className='text-sm'>Key</Label>
              <Input
                id='new-key'
                placeholder='VARIABLE_NAME'
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                onKeyPress={handleKeyPress}
                className='mt-1'
              />
            </div>
            <div>
              <Label htmlFor='new-value' className='text-sm'>Value</Label>
              <Input
                id='new-value'
                type={isSecret ? 'password' : 'text'}
                placeholder='Value'
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className='mt-1'
              />
            </div>
          </div>
          <div className='flex items-center justify-between'>
            <label className='flex items-center gap-2 text-sm'>
              <input
                type='checkbox'
                checked={isSecret}
                onChange={(e) => setIsSecret(e.target.checked)}
                className='rounded'
              />
              Mark as secret
            </label>
            <Button
              size='sm'
              onClick={handleAdd}
              disabled={!newKey || !newValue}
            >
              <Plus className='h-4 w-4 mr-1' />
              Add Variable
            </Button>
          </div>
        </div>

        {/* Variables table */}
        {variables.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className='w-[100px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variables.map((variable) => (
                <TableRow key={variable.id}>
                  <TableCell className='font-mono text-sm'>{variable.key}</TableCell>
                  <TableCell className='font-mono text-sm'>
                    <div className='flex items-center gap-2'>
                      {variable.isSecret && !showSecrets[variable.id] 
                        ? '••••••••' 
                        : variable.value}
                      {variable.isSecret && (
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 w-6 p-0'
                          onClick={() => toggleShowSecret(variable.id)}
                        >
                          {showSecrets[variable.id] ? (
                            <EyeOff className='h-3 w-3' />
                          ) : (
                            <Eye className='h-3 w-3' />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDelete(variable.id)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className='text-center py-8 text-muted-foreground'>
            No environment variables configured
          </div>
        )}
      </div>
    </div>
  )
}