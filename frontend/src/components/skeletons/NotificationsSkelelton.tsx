import React from 'react'
import { Skeleton } from '../ui/skeleton'

const NotificationsSkelelton = () => {
  return (
    <div className='space-y-2'>
        {[...Array(4)].map((_,i)=>(
                <Skeleton data-testid="skeleton" key={i} className='rounded-md bg-gray-600/50 h-16 w-full'/>
            ))
        }
    </div>
  )
}

export default NotificationsSkelelton