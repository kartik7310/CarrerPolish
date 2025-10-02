"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { CoachingExperts } from "@/services/options";
import { UserButton } from "@stackframe/stack";
import { Button } from "@/components/ui/button";
import { AiModal, getToken } from "@/services/GlobalService";

const Page = () => {
  const { roomId } = useParams();
  const [expert, setExpert] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<string>("disconnected");

  const DiscussionRoomData = useQuery(api.DiscissionRoom.GetDiscussionRoom, { id: roomId });

  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExperts.find(item => item.name === DiscussionRoomData.expertName);
      setExpert(Expert);
    }
  }, [DiscussionRoomData]);

  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isStreamingRef = useRef(false);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectToServer = async () => {
    try {
      setConnectionStatus("connecting");
      setTranscript("");
      setPartialTranscript("");

      const token = await getToken();
      if (!token) throw new Error("Failed to get authentication token");

      const socket = new WebSocket(
        `wss://streaming.assemblyai.com/v3/ws?token=${token}&sample_rate=16000&format_turns=true`
      );
      socketRef.current = socket;

      socket.onopen = async () => {
        setConnectionStatus("connected");
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          });
          streamRef.current = stream;

          const audioContext = new AudioContext({ sampleRate: 16000 });
          audioContextRef.current = audioContext;

          const source = audioContext.createMediaStreamSource(stream);
          sourceRef.current = source;

          const processor = audioContext.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          source.connect(processor);
          processor.connect(audioContext.destination);

          processor.onaudioprocess = (e) => {
            if (!isStreamingRef.current) return;

            const inputData = e.inputBuffer.getChannelData(0);
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }
            audioQueueRef.current.push(pcm16);

            if (socket.readyState === WebSocket.OPEN) {
              while (audioQueueRef.current.length > 0) {
                const chunk = audioQueueRef.current.shift();
                if (chunk) {
                  try {
                    socket.send(chunk.buffer);
                  } catch (error) {
                    audioQueueRef.current.unshift(chunk);
                    break;
                  }
                }
              }
            }
          };

          isStreamingRef.current = true;
          setIsConnected(true);
        } catch (micError) {
          console.error("Microphone error:", micError);
          setConnectionStatus("error");
          socket.close();
        }
      };

      socket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "Turn") {
            const text = data.transcript || "";
            const isFormatted = data.turn_is_formatted;

            if (text) {
              if (isFormatted) {
                setTranscript((prev) => prev + (prev ? " " : "") + text);
                setPartialTranscript("");

                // Call AI only for finalized text
                try {
                  const responseAi = await AiModal(
                    DiscussionRoomData?.topic,
                    DiscussionRoomData?.CoachingOption,
                    text
                  );
                  console.log("AI Response:", responseAi);
                } catch (aiError) {
                  console.error("AI API Error:", aiError);
                }
              } else {
                setPartialTranscript(text);

                // Optional: debounce AI call for partials
                if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
                aiTimeoutRef.current = setTimeout(async () => {
                  try {
                    const responseAi = await AiModal(
                      DiscussionRoomData?.topic,
                      DiscussionRoomData?.CoachingOption,
                      text
                    );
                    console.log("AI Response (debounced):", responseAi);
                  } catch (err) {
                    console.error("AI API Error:", err);
                  }
                }, 3000);
              }
            }
          }
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        setConnectionStatus("error");
        setIsConnected(false);
      };

      socket.onclose = () => {
        setConnectionStatus("disconnected");
        setIsConnected(false);
        isStreamingRef.current = false;
      };
    } catch (error) {
      console.error("Connection error:", error);
      setConnectionStatus("error");
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    isStreamingRef.current = false;
    if (socketRef.current?.readyState === WebSocket.OPEN) socketRef.current.send(JSON.stringify({ type: "Terminate" }));

    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioContextRef.current?.close();
    socketRef.current?.close();

    processorRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
    socketRef.current = null;

    audioQueueRef.current = [];
    setIsConnected(false);
    setPartialTranscript("");
    setConnectionStatus("disconnected");
  };

  useEffect(() => {
    return () => {
      if (isConnected) disconnect();
    };
  }, [isConnected]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          {DiscussionRoomData?.CoachingOption || "Discussion Room"}
        </h2>
        {connectionStatus === "connected" && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[50vh] md:h-[60vh] bg-secondary border rounded-3xl shadow-md flex flex-col items-center justify-center relative overflow-hidden">
          {expert ? (
            <>
              <Image
                src={expert.avatar}
                width={80}
                height={80}
                alt={`${expert.name} avatar`}
                className="rounded-full h-[80px] w-[80px] object-cover shadow-lg border-4 border-white"
              />
              <h3 className="mt-4 text-xl font-semibold text-gray-700">{expert.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{expert.role || "Coach"}</p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse"></div>
              <p className="text-gray-500">Loading expert...</p>
            </div>
          )}
          <div className="absolute bottom-6 right-6 bg-white shadow-lg rounded-xl p-2">
            <UserButton />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="w-full h-[50vh] md:h-[60vh] bg-white border rounded-3xl shadow-md p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Transcript</h3>
              {transcript && (
                <button
                  onClick={() => {
                    setTranscript("");
                    setPartialTranscript("");
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="text-sm text-gray-700 leading-relaxed space-y-2">
              {!transcript && !partialTranscript ? (
                <p className="text-gray-400 text-center mt-8">
                  {isConnected ? "Listening... Start speaking" : "Connect to start transcription"}
                </p>
              ) : (
                <>
                  {transcript && <p className="whitespace-pre-wrap">{transcript}</p>}
                  {partialTranscript && <p className="text-blue-600 italic whitespace-pre-wrap">{partialTranscript}</p>}
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">
            At the end of your conversation we generate feedback and notes
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        {!isConnected ? (
          <Button size="lg" className="px-10" onClick={connectToServer} disabled={connectionStatus === "connecting"}>
            {connectionStatus === "connecting" ? "Connecting..." : "Start Session"}
          </Button>
        ) : (
          <Button size="lg" variant="destructive" onClick={disconnect}>
            End Session
          </Button>
        )}
        {connectionStatus === "error" && (
          <p className="text-sm text-red-600">
            Connection failed. Please check your microphone permissions and try again.
          </p>
        )}
        {isConnected && <p className="text-xs text-gray-600">Speak clearly for best transcription results</p>}
      </div>
    </div>
  );
};

export default Page;
