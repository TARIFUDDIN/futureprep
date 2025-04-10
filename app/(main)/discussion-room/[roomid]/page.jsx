"use client";
import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { AIModel, ConvertTextToSpeech, getToken } from '@/services/GlobalServices';
import { CoachingExpert } from '@/services/Options';
import { UserButton } from '@stackframe/stack';
import { useMutation, useQuery } from 'convex/react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { RealtimeTranscriber } from "assemblyai";
import { Loader2Icon } from 'lucide-react';
import ChatBox from './_components/ChatBox';
import { toast } from 'sonner';
import { UserContext } from '@/app/_context/UserContext';

// Dynamic import for RecordRTC
const RecordRTC = dynamic(
  () => import('recordrtc').then((mod) => mod.default || mod),
  { ssr: false }
);

const DiscussionRoom = () => {
    const { roomid } = useParams();
    const discussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, { id: roomid });
    const { userData, setUserData } = useContext(UserContext);
    
    // Mutations
    const updateUserToken = useMutation(api.users.UpdateUserToken);
    const UpdateConversation = useMutation(api.DiscussionRoom.UpdateConversation);
    
    // State Management
    const [expert, setExpert] = useState(null);
    const [enableMic, setEnableMic] = useState(false);
    const [transcribe, setTranscribe] = useState('');
    const [conversation, setConversation] = useState([{
        role: 'system', 
        content: 'Welcome to the coaching session'
    }]);
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [enableFeedbackNotes, setEnableFeedbackNotes] = useState(false);
    const [abortController, setAbortController] = useState(null);

    // Refs
    const recorder = useRef(null);
    const realtimeTranscriber = useRef(null);
    const texts = useRef({});
    const silenceTimeout = useRef(null);

    // Initialize expert data
    useEffect(() => {
        if (discussionRoomData) {
            const selectedExpert = CoachingExpert.find(item => item.name === discussionRoomData.expertName);
            setExpert(selectedExpert);
        }
    }, [discussionRoomData]);

    // Token estimation and update methods
    const estimateTokenCount = useCallback((text) => {
        return text?.trim().split(/\s+/).length || 0;
    }, []);

    const updateUserTokenMethod = useCallback(async (text) => {
        if (!userData?._id) return;
        
        const tokenCount = estimateTokenCount(text);
        try {
            await updateUserToken({
                id: userData._id,
                credit: Number(userData.credit) - tokenCount
            });
            setUserData(prev => ({
                ...prev,
                credit: Number(prev.credit) - tokenCount
            }));
        } catch (error) {
            console.error("Error updating user token:", error);
            toast.error("Failed to update credits");
        }
    }, [userData?._id, estimateTokenCount, updateUserToken, setUserData]);

    // Connect to voice server
    const connectToServer = async () => {
        try {
            setEnableMic(true);
            setLoading(true);
            
            // Get AssemblyAI token
            const tokenData = await getToken();
            if (!tokenData?.token) {
                throw new Error("Failed to get authentication token");
            }

            // Initialize transcriber
            realtimeTranscriber.current = new RealtimeTranscriber({
                token: tokenData.token,
                sample_rate: 16000
            });

            realtimeTranscriber.current.on('transcript', async (transcript) => {
                if (transcript.message_type === 'FinalTranscript') {
                    const newMessage = {
                        role: 'user',
                        content: transcript.text
                    };
                    setConversation(prev => [...prev, newMessage]);
                    await updateUserTokenMethod(transcript.text);
                }
                
                // Update transcription display
                texts.current[transcript.audio_start] = transcript?.text;
                const keys = Object.keys(texts.current).sort((a, b) => a - b);
                const msg = keys.map(key => texts.current[key]).filter(Boolean).join(' ');
                setTranscribe(msg);
            });

            await realtimeTranscriber.current.connect();

            // Initialize recording
            if (typeof window !== "undefined" && typeof navigator !== "undefined") {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                // Initialize RecordRTC
                const RecordRTCModule = await import('recordrtc');
                const RecordRTCDefault = RecordRTCModule.default || RecordRTCModule;
                
                recorder.current = new RecordRTCDefault(stream, {
                    type: 'audio',
                    mimeType: 'audio/webm;codecs=pcm',
                    recorderType: RecordRTCDefault.StereoAudioRecorder,
                    timeSlice: 250,
                    desiredSampRate: 16000,
                    numberOfAudioChannels: 1,
                    bufferSize: 4096,
                    audioBitsPerSecond: 128000,
                    ondataavailable: async (blob) => {
                        if (!realtimeTranscriber.current) return;
                        clearTimeout(silenceTimeout.current);
                        const buffer = await blob.arrayBuffer();
                        realtimeTranscriber.current.sendAudio(buffer);
                        silenceTimeout.current = setTimeout(() => {
                            console.log('User stopped talking');
                        }, 2000);
                    },
                });

                recorder.current.startRecording();
            }

            setLoading(false);
            toast.success('Connected and recording started');
        } catch (error) {
            console.error("Error connecting to server:", error);
            setLoading(false);
            setEnableMic(false);
            
            // Clean up resources
            if (realtimeTranscriber.current) {
                await realtimeTranscriber.current.close().catch(console.error);
            }
            if (recorder.current) {
                recorder.current.stopRecording().catch(console.error);
            }
            
            toast.error(`Connection failed: ${error.message}`);
        }
    };

    // AI Response Processing
    const processAIResponse = useCallback(async () => {
        // Create a new abort controller for each request
        const controller = new AbortController();
        setAbortController(controller);

        try {
            setLoading(true);

            const userMessages = conversation.filter(msg => msg.role === 'user');
            const aiMessages = conversation.filter(msg => msg.role === 'assistant');
            
            if (userMessages.length <= aiMessages.length) return;

            const lastUserMessage = userMessages[userMessages.length - 1];
            if (!lastUserMessage) return;

            const aiResp = await AIModel(
                discussionRoomData.topic,
                discussionRoomData.coachingOption,
                conversation
            );

            if (controller.signal.aborted) return;

            if (aiResp?.content) {
                const url = aiResp.content.length > 20 
                    ? await ConvertTextToSpeech(aiResp.content)
                    : null;

                if (url) {
                    setAudioUrl(url);
                }

                setTimeout(() => {
                    setConversation(prev => [...prev, aiResp]);
                    updateUserTokenMethod(aiResp.content);
                }, 500);
            } else {
                toast.warning('Could not generate a complete response.');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Response Generation Failed:', error);
                toast.error('Unable to generate a response. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [conversation, discussionRoomData, updateUserTokenMethod]);

    // AI Response Effect
    useEffect(() => {
        let processingTimeout;
        if (!discussionRoomData) return;

        processingTimeout = setTimeout(processAIResponse, 500);

        return () => {
            clearTimeout(processingTimeout);
            if (abortController) {
                abortController.abort();
            }
        };
    }, [conversation, discussionRoomData, processAIResponse]);

    // Disconnect Method
    const disconnect = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Abort any ongoing AI response generation
            if (abortController) {
                abortController.abort();
            }

            // Stop transcription and recording
            if (realtimeTranscriber.current) {
                await realtimeTranscriber.current.close();
            }

            if (recorder.current) {
                await recorder.current.stopRecording();
                recorder.current.stream?.getTracks().forEach(track => track.stop());
                recorder.current = null;
            }
            
            setEnableMic(false);
            toast.success('Disconnected successfully');
            
            if (discussionRoomData?._id) {
                await UpdateConversation({
                    id: discussionRoomData._id,
                    conversation: conversation
                });
            }
            
            setEnableFeedbackNotes(true);
        } catch (error) {
            console.error("Error disconnecting:", error);
            toast.error('Error during disconnection');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='-mt-12'>
            <h2 className='text-lg font-bold'>{discussionRoomData?.coachingOption}</h2>
            <div className='mt-5 grid grid-cols-1 lg:grid-cols-4 gap-10'>
                <div className='lg:col-span-2 h-[60vh] bg-secondary border rounded-4xl flex flex-col items-center justify-center relative'>
                    {expert?.avatar &&
                        <Image 
                            src={expert.avatar} 
                            alt='Avatar' 
                            width={200} 
                            height={200} 
                            className='h-[80px] w-[80px] rounded-full object-cover animate-pulse' 
                        />
                    }
                    <h2 className='text-gray-500'>{expert?.name}</h2>
                    <audio src={audioUrl} type="audio/mp3" autoPlay controls />
                    <div className='p-5 bg-gray-200 px-10 rounded-lg absolute bottom-10 right-10'>
                        <UserButton />
                    </div>
                </div>
                <div className='lg:col-span-2'>
                    <div className='mt-5 flex items-center justify-center relative'>
                        {!enableMic ? 
                            <Button onClick={connectToServer} disabled={loading}>
                                {loading && <Loader2Icon className='animate-spin mr-2'/>}
                                Connect
                            </Button>
                        : 
                            <Button variant="destructive" onClick={disconnect} disabled={loading}>
                                {loading && <Loader2Icon className='animate-spin mr-2'/>}
                                Disconnect
                            </Button>
                        }
                    </div>
                    <div>
                        <ChatBox 
                            conversation={conversation}
                            enableFeedbackNotes={enableFeedbackNotes}
                            coachingOption={discussionRoomData?.coachingOption}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiscussionRoom;