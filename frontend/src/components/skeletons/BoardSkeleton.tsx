import React from 'react'
import KabanColumnSkeleton from './KabanColumnSkeleton'
import { Skeleton } from '../ui/skeleton'

const BoardSkeleton = () => {
    const countSkeletons = [3,4,6,2,5]
    return (
        <div className='px-6 pb-10'>
            <div className='grid py-5 mb-8 grid-cols-5 gap-5 h-8'>
                {countSkeletons.map((_,i)=>(
                    <Skeleton key={i} className='w-full h-10 border-gray-800 bg-gray-600/50'/>
                ))}
            </div>
            <div className='grid grid-cols-5 gap-6 h-full'>
                {countSkeletons.map((columnSkeletonsNumber:number,index)=>(
                    <KabanColumnSkeleton key={index} count={columnSkeletonsNumber}/>
                ))}
            </div>
        </div>
    )
}

export default BoardSkeleton