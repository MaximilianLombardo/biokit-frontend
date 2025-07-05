'use client'

import { AdaptersProvider } from '@/contexts/adapters-context'
import { useInitializeStores } from '@/hooks/use-initialize-stores'
import BiokitWorkflow from '../biokit-workflow'

function TestApp() {
  useInitializeStores()
  
  return <BiokitWorkflow />
}

export default function TestUnifiedPage() {
  return (
    <AdaptersProvider mode="local">
      <TestApp />
    </AdaptersProvider>
  )
}