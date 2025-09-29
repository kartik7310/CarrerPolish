import React from 'react'
import AppHeader from './_components/AppHeader';

const layout = ({children}: {
  children: React.ReactNode;
}) => {
  return (
    <div>
      <AppHeader/>
      <div className='p-8 mt-15 md:px-20 lg:px-30  xl:px-45 2xl:px-56'>
        {children}
      </div>
    </div>
  )
}

export default layout
