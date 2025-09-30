"use client"
import { Button } from '@/components/ui/button'
import { CoachingOptions } from '@/services/options'
import { useUser } from '@stackframe/stack'
import Image from 'next/image'
import React from 'react'
import UserInputDialog from './UserInputDialog'

const FeatureAssistanse = () => {
  const user = useUser()
  return (
    <div>
     <div className='flex justify-between items-center'>
      <div>
       <h2 className='font-medium text-gray-500'> My WorkSpace</h2>
      <h2 className='text-2xl font-bold'>Welcome back  {user?.displayName}</h2>
     </div>
     <Button>Profile</Button>
     </div>

     <div className='grid grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-10 mt-10'>
      {CoachingOptions.map((option,index)=>(
        <UserInputDialog  key={index} coachingOption={option}>
 <div className='p-3 bg-secondary rounded-3xl flex flex-col justify-center items-center'>
          <Image src={option.icon} alt={option.name}
        width={200}
        height={200}
        className='h-[70px] w-[70px]'/>
        <h2>{option.name}</h2>
        </div>
        </UserInputDialog>
       
      ))}
     </div>
    </div>
  )
}

export default FeatureAssistanse
