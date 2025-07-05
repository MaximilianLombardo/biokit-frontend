'use client'

import { useState } from 'react'
import { X, Settings, Keyboard, Key, Info, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { BiokitGeneralSettings } from './components/biokit-general-settings'
import { BiokitShortcutsSettings } from './components/biokit-shortcuts-settings'
import { BiokitEnvironmentSettings } from './components/biokit-environment-settings'
import { BiokitApiKeysSettings } from './components/biokit-api-keys-settings'
import { BiokitAboutSettings } from './components/biokit-about-settings'

interface BiokitSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SettingsSection = 'general' | 'shortcuts' | 'environment' | 'apikeys' | 'about'

const sections: { id: SettingsSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'environment', label: 'Environment', icon: Globe },
  { id: 'apikeys', label: 'API Keys', icon: Key },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'about', label: 'About', icon: Info },
]

export function BiokitSettingsModal({ open, onOpenChange }: BiokitSettingsModalProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex h-[85vh] flex-col gap-0 p-0 sm:max-w-[1040px]' hideCloseButton>
        <DialogHeader className='border-b px-6 py-4'>
          <div className='flex items-center justify-between'>
            <DialogTitle className='font-medium text-lg'>Settings</DialogTitle>
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

        <div className='flex min-h-0 flex-1'>
          {/* Navigation Sidebar */}
          <div className='w-[200px] border-r'>
            <nav className='py-4'>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                    'hover:bg-muted/50',
                    activeSection === section.id
                      ? 'bg-muted/50 font-medium text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <section.icon className='h-4 w-4' />
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className='flex-1 overflow-y-auto'>
            <div className={cn('h-full', activeSection === 'general' ? 'block' : 'hidden')}>
              <BiokitGeneralSettings />
            </div>
            <div className={cn('h-full', activeSection === 'environment' ? 'block' : 'hidden')}>
              <BiokitEnvironmentSettings />
            </div>
            <div className={cn('h-full', activeSection === 'apikeys' ? 'block' : 'hidden')}>
              <BiokitApiKeysSettings />
            </div>
            <div className={cn('h-full', activeSection === 'shortcuts' ? 'block' : 'hidden')}>
              <BiokitShortcutsSettings />
            </div>
            <div className={cn('h-full', activeSection === 'about' ? 'block' : 'hidden')}>
              <BiokitAboutSettings />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}