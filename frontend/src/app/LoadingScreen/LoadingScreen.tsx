import React from 'react'

const LoadingScreen = () => {
  return (
    <div className='w-[100%] h-screen flex items-center justify-center bg-[#111112]'>
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-800/20 via-transparent to-purple-900/10"></div>
      <span className="loader"></span>
    </div>
  )
}

export default LoadingScreen