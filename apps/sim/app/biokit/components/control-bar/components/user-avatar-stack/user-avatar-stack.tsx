'use client'

import { UserAvatar } from './components/user-avatar/user-avatar'

// Simplified version without real-time presence
export function UserAvatarStack() {
  // In standalone mode, just show the current user
  const currentUser = {
    connectionId: 1,
    name: 'BioKit User',
    color: '#3b82f6', // blue-500
  }

  return (
    <div className="relative flex -space-x-2">
      <UserAvatar
        key={currentUser.connectionId}
        user={currentUser}
        isCurrentUser={true}
      />
    </div>
  )
}