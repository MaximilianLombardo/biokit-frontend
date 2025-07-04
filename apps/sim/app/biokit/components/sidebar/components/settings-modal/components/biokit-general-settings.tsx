'use client'

import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useGeneralStore } from '@/stores/settings/general/store'

const TOOLTIPS = {
  debugMode: 'Enable visual debugging information during workflow execution.',
  autoConnect: 'Automatically connect nodes when dropping them near existing nodes.',
}

export function BiokitGeneralSettings() {
  const theme = useGeneralStore((state) => state.theme)
  const isAutoConnectEnabled = useGeneralStore((state) => state.isAutoConnectEnabled)
  const isDebugModeEnabled = useGeneralStore((state) => state.isDebugModeEnabled)

  const setTheme = useGeneralStore((state) => state.setTheme)
  const toggleAutoConnect = useGeneralStore((state) => state.toggleAutoConnect)
  const toggleDebugMode = useGeneralStore((state) => state.toggleDebugMode)

  const handleThemeChange = (value: 'system' | 'light' | 'dark') => {
    setTheme(value)
  }

  const handleDebugModeChange = (checked: boolean) => {
    if (checked !== isDebugModeEnabled) {
      toggleDebugMode()
    }
  }

  const handleAutoConnectChange = (checked: boolean) => {
    if (checked !== isAutoConnectEnabled) {
      toggleAutoConnect()
    }
  }

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h2 className='mb-[22px] font-medium text-lg'>General Settings</h2>
        <div className='space-y-4'>
          <div className='flex items-center justify-between py-1'>
            <div className='flex items-center gap-2'>
              <Label htmlFor='theme-select' className='font-medium'>
                Theme
              </Label>
            </div>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger id='theme-select' className='w-[180px]'>
                <SelectValue placeholder='Select theme' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='system'>System</SelectItem>
                <SelectItem value='light'>Light</SelectItem>
                <SelectItem value='dark'>Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className='flex items-center justify-between py-1'>
            <div className='flex items-center gap-2'>
              <Label htmlFor='debug-mode' className='font-medium'>
                Debug mode
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 p-1 text-gray-500'
                    aria-label='Learn more about debug mode'
                  >
                    <Info className='h-5 w-5' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='top' className='max-w-[300px] p-3'>
                  <p className='text-sm'>{TOOLTIPS.debugMode}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch
              id='debug-mode'
              checked={isDebugModeEnabled}
              onCheckedChange={handleDebugModeChange}
            />
          </div>
          
          <div className='flex items-center justify-between py-1'>
            <div className='flex items-center gap-2'>
              <Label htmlFor='auto-connect' className='font-medium'>
                Auto-connect on drop
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 p-1 text-gray-500'
                    aria-label='Learn more about auto-connect feature'
                  >
                    <Info className='h-5 w-5' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='top' className='max-w-[300px] p-3'>
                  <p className='text-sm'>{TOOLTIPS.autoConnect}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch
              id='auto-connect'
              checked={isAutoConnectEnabled}
              onCheckedChange={handleAutoConnectChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}