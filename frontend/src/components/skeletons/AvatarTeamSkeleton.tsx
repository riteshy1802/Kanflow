import React from 'react'
import { Skeleton } from '../ui/skeleton'

const AvatarTeamSkeleton = () => {
  return (
    <div className="flex -space-x-2">
        {[...Array(4)].map((_, i) => (
            <Skeleton
                data-testid="skeleton"
                key={i}
                className="h-8 w-8 border-gray-800 bg-gray-600/40 rounded-full"
            />
        ))}
    </div>
  )
}

export default AvatarTeamSkeleton