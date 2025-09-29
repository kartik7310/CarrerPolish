import React from 'react'
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
const UserInputDialog = ({children,coachingOption}: {
  children: React.ReactNode })=> {
  return (
   <Dialog>
  <DialogTrigger>{children}</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{coachingOption.name}</DialogTitle>
      <DialogDescription asChild>
        <div className='mt-3'>
          <h2 className='text-black'>Enter a topic to master you skills in {coachingOption.name}</h2>
          <Textarea className='mt-3 'placeholder='Enter topic here.... '/>
        </div>
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
  )
}

export default UserInputDialog
