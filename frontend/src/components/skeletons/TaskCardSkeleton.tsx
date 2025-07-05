import React from 'react'
import { Skeleton } from '../ui/skeleton'

const TaskCardSkeleton = () => {
  return (
    <Skeleton data-testid="skeleton" className='h-36 w-full border-gray-800 bg-gray-600/50'/>
  )
}

export default TaskCardSkeleton