import React from 'react'
import FeatureAssistanse from './_components/FeatureAssistanse'
import History from './_components/History'
import Feedback from './_components/Feedback'
const page = () => {
  return (
    <div >
   
 <FeatureAssistanse/>
 <div className='grid grid-cols-1 md:grid-cols-2 gap-10 mt-10'>
  <Feedback/>
  <History/>
 </div>
    </div>
  )
}

export default page
