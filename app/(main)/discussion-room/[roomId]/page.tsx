"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { CoachingExperts } from "@/services/options";
import { UserButton } from "@stackframe/stack";
import { Button } from "@/components/ui/button";

import RecordRTC from "recordrtc";
import { MutableRefObject, useRef } from "react";

const Page = () => {
  const { roomId } = useParams();
  const [expert, setExpert] = useState<any>(null);
  const [enableMic,setEnableMic] = useState(false)

  const DiscussionRoomData = useQuery(api.DiscissionRoom.GetDiscussionRoom, {
    id: roomId,
  });
  

  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExperts.find(
        (item) => item.name === DiscussionRoomData.expertName
      );
      console.log("expert ", Expert);
      setExpert(Expert);
    }
  }, [DiscussionRoomData]);

  const recorder = useRef<any>(null);
  const realtimeTranscriber = useRef<any>(null); //  transcription handler
  let silenceTimeout: NodeJS.Timeout;
 
  const connectToServer = () => {
    setEnableMic(true)
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          recorder.current = new RecordRTC(stream, {
            type: "audio",
            mimeType: "audio/webm;codecs=pcm",
            recorderType: RecordRTC.StereoAudioRecorder,
            timeSlice: 250, // audio chunks every 250ms
            desiredSampRate: 16000, // sample rate for speech models
            numberOfAudioChannels: 1, // mono audio
            bufferSize: 4096,
            audioBitsPerSecond: 128000,

            // Called every 250ms with new audio data
            ondataavailable: async (blob: Blob) => {
              // if (!realtimeTranscriber.current) return;

              clearTimeout(silenceTimeout);

              const buffer = await blob.arrayBuffer();
              console.log("buffer",buffer);
              
              // console.log(buffer) // <- raw audio data

              // Restart silence detection timer
              silenceTimeout = setTimeout(() => {
                console.log("User stopped talking");
                // Stop recording / finalize transcript if needed
              }, 2000); // waits 2s of silence
            },
          });

          // Start recording
          recorder.current.startRecording();
        })
        .catch((err) => console.error(err));
    }
  };
const Disconnect=(e:any)=>{
  e.preventDefault()
  recorder.current.pauseRecording();
  recorder.current=null
  setEnableMic(false)
}
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          {DiscussionRoomData?.CoachingOption || "Discussion Room"}
        </h2>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-2 h-[50vh] md:h-[60vh] bg-secondary border rounded-3xl shadow-md flex flex-col items-center justify-center relative overflow-hidden">
          {expert ? (
            <>
              <Image
                src={expert.avatar}
                width={80}
                height={80}
                alt="Avatar"
                className="rounded-full h-[80px] w-[80px] object-cover shadow-lg border border-white"
              />
              <h2 className="mt-3 text-lg font-semibold text-gray-700">
                {expert.name}
              </h2>
            </>
          ) : (
            <p className="text-gray-500">Loading expert...</p>
          )}

          <div className="p-4 bg-white shadow-lg rounded-xl absolute bottom-6 right-6">
            <UserButton />
          </div>
        </div>

        {/* Right Section (Sidebar) */}
        <div>
          <div className="w-full h-[50vh] md:h-[60vh] bg-secondary border rounded-3xl shadow-md flex flex-col items-center justify-center text-gray-700 font-medium">
            Vertical Box
          </div>
          <div className="mt-2">
            <p className="text-gray-500 ">
              {" "}
              at the end of your converstation we generate feedback/notes{" "}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="flex justify-center">
       {!enableMic? <Button size="lg" className="px-10" onClick={connectToServer}>
          Connect
        </Button>
        :
        <Button variant="destructive" onClick={Disconnect}>
          Disconnect
        </Button> 
      }
      </div>
    </div>
  );
};

export default Page;
