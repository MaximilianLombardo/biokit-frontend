'use client'

import { ExternalLink, Github, BookOpen, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BiokitAboutSettings() {
  const version = '1.0.0-beta'
  const buildDate = new Date().toLocaleDateString()

  const links = [
    {
      title: 'Documentation',
      description: 'Learn how to use BioKit Workflow Editor',
      icon: BookOpen,
      href: 'https://biokit.readthedocs.io',
    },
    {
      title: 'GitHub Repository',
      description: 'View source code and contribute',
      icon: Github,
      href: 'https://github.com/biokit/biokit-workflow-editor',
    },
    {
      title: 'Community Support',
      description: 'Get help from the community',
      icon: MessageCircle,
      href: 'https://github.com/biokit/biokit-workflow-editor/discussions',
    },
  ]

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h2 className='mb-[22px] font-medium text-lg'>About BioKit Workflow Editor</h2>
        
        {/* Version Info */}
        <div className='space-y-4 mb-8'>
          <div className='p-4 bg-muted/30 rounded-lg space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Version</span>
              <span className='font-mono'>{version}</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Build Date</span>
              <span className='font-mono'>{buildDate}</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>License</span>
              <span className='font-mono'>MIT</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className='mb-8'>
          <p className='text-sm text-muted-foreground mb-3'>
            BioKit Workflow Editor is a visual workflow editor for bioinformatics pipelines. 
            Build, test, and deploy computational biology workflows with an intuitive drag-and-drop interface.
          </p>
          <p className='text-sm text-muted-foreground'>
            This editor is part of the BioKit ecosystem, providing seamless integration with 
            popular bioinformatics tools and frameworks.
          </p>
        </div>

        {/* Links */}
        <div className='space-y-3'>
          <h3 className='text-sm font-medium mb-3'>Resources</h3>
          {links.map((link) => (
            <a
              key={link.title}
              href={link.href}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group'
            >
              <link.icon className='h-5 w-5 mt-0.5 text-muted-foreground group-hover:text-foreground' />
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>{link.title}</span>
                  <ExternalLink className='h-3 w-3 text-muted-foreground' />
                </div>
                <p className='text-xs text-muted-foreground mt-0.5'>{link.description}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Credits */}
        <div className='mt-8 pt-8 border-t'>
          <p className='text-xs text-muted-foreground text-center'>
            Built with ❤️ by the BioKit team
          </p>
        </div>
      </div>
    </div>
  )
}