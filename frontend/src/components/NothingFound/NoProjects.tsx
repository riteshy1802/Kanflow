import React from 'react'

const NoProjects = ({message}:{message:string}) => {
  return (
    <div className='p-3 w-full flex items-center justify-center text-xs text-gray-400'>{message}</div>
  )
}

export default NoProjects