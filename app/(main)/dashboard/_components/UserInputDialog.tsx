import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import Image from "next/image";
import { CoachingExperts } from "@/services/options";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@radix-ui/react-dialog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const UserInputDialog = ({
  children,
  coachingOption,
}: {
  children: React.ReactNode;
}) => {
   const router = useRouter()
  const[selectedExpert,setSelectedExpert] = useState("")
  const [topic ,setTopic] = useState("")
  const [loading,setLoading] = useState(false)
  const [openDialogBox,setOpenDialogBox] = useState(false)
   const createDiscussionRoom = useMutation(api.DiscissionRoom.CreateNewRoom);


   const OnclickNext =async()=>{
    setLoading(true)
    const result = await createDiscussionRoom({
      topic:topic,
      coachingOption:coachingOption?.name,
      expertName:selectedExpert
    })
    console.log("result",result);
    
    setLoading(false)
    setOpenDialogBox(false)
    router.push(`/discussion-room/${result}`)
   }
  return (
    <Dialog open={openDialogBox} onOpenChange={setOpenDialogBox}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{coachingOption.name}</DialogTitle>
          <DialogDescription asChild>
            <div className="mt-3">
              <h2 className="text-black">
                Enter a topic to master you skills in {coachingOption.name}
              </h2>
              <Textarea className="mt-3 " placeholder="Enter topic here.... " 
               onChange={(e:any)=>setTopic(e.target.value)}
              />

              <h2 className="text-black mt-3">
               select you coaching expert
              </h2>

              <div className="grid grid-cols-3 md:grid-cols-5 gap-6 mt-2">
                {CoachingExperts.map((expert, index) => (
                  <div key={index} onClick={()=>setSelectedExpert(expert.name)}>
                    <Image
                    
                      src={expert.avatar}
                      alt={expert.name}
                      height={60}
                      width={60}
                      className="rounded-2xl h-[80px] w-[80px] object-center hover:scale-105 transition-all cursor-pointer"
                    />
                    <h2 className="text-center">{expert.name}</h2>
                  </div>
                ))}
              </div>
                  <div className="flex gap-5 justify-end mt-5">
                    <DialogClose asChild>
  <Button variant={'ghost'}>Cancel</Button>
                    </DialogClose>
                  
                    <Button disabled={(!topic|| !selectedExpert ||loading)} onClick={OnclickNext}>{loading && <LoaderCircle className="animate-spin"/>}Next</Button>
                  </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default UserInputDialog;
