import React from 'react'
import TaskCardSkeleton from './TaskCardSkeleton'

const KabanColumnSkeleton = ({count}:{count:number}) => {
  return (
    <div className='space-y-2'>
        {[...Array(count)].map((_,i)=>(
            <TaskCardSkeleton key={i}/>
        ))}
    </div>
  )
}

export default KabanColumnSkeleton