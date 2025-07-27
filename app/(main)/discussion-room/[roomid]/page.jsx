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
import { 
  Loader2Icon, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Wifi, 
  WifiOff,
  Clock,
  Zap,
  User,
  Bot,
  Signal,
  Activity,
  Settings,
  Pause,
  Play
} from 'lucide-react';
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
    const [sessionDuration, setSessionDuration] = useState(0);
    const [audioLevel, setAudioLevel] = useState(0);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);

    // Refs
    const recorder = useRef(null);
    const realtimeTranscriber = useRef(null);
    const texts = useRef({});
    const silenceTimeout = useRef(null);
    const audioRef = useRef(null);
    const sessionStartRef = useRef(null);

    // Initialize expert data
    useEffect(() => {
        if (discussionRoomData) {
            const selectedExpert = CoachingExpert.find(item => item.name === discussionRoomData.expertName);
            setExpert(selectedExpert);
        }
    }, [discussionRoomData]);

    // Session timer
    useEffect(() => {
        let interval;
        if (enableMic && sessionStartRef.current) {
            interval = setInterval(() => {
                const now = Date.now();
                const elapsed = Math.floor((now - sessionStartRef.current) / 1000);
                setSessionDuration(elapsed);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [enableMic]);

    // Format session duration
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

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
            sessionStartRef.current = Date.now();
            
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
                        
                        // Simulate audio level for visualization
                        setAudioLevel(Math.random() * 100);
                        
                        silenceTimeout.current = setTimeout(() => {
                            setAudioLevel(0);
                        }, 2000);
                    },
                });

                recorder.current.startRecording();
            }

            setLoading(false);
            toast.success('Connected and recording started', {
                description: 'Your AI coaching session is now active'
            });
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
                    setIsAudioPlaying(true);
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
            if (abortController) {
                abortController.abort();
            }

            if (realtimeTranscriber.current) {
                await realtimeTranscriber.current.close();
            }

            if (recorder.current) {
                await recorder.current.stopRecording();
                recorder.current.stream?.getTracks().forEach(track => track.stop());
                recorder.current = null;
            }
            
            setEnableMic(false);
            setAudioLevel(0);
            toast.success('Session ended successfully', {
                description: `Duration: ${formatDuration(sessionDuration)}`
            });
            
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
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="modern-card p-6 bg-white/90 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold text-slate-900">
                                {discussionRoomData?.coachingOption}
                            </h1>
                            <p className="text-slate-600">
                                Topic: <span className="font-medium text-indigo-600">{discussionRoomData?.topic}</span>
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {/* Session Duration */}
                            <div className="flex items-center space-x-2 px-3 py-2 bg-slate-100 rounded-lg">
                                <Clock className="w-4 h-4 text-slate-600" />
                                <span className="text-sm font-mono text-slate-700">
                                    {formatDuration(sessionDuration)}
                                </span>
                            </div>
                            
                            {/* Connection Status */}
                            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                                enableMic ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                                {enableMic ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                                <span className="text-sm font-medium">
                                    {enableMic ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* AI Avatar Section */}
                <div className="xl:col-span-5">
                    <div className="modern-card p-8 h-[70vh] bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center relative overflow-hidden">
                        {/* Background Animation */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 animate-pulse-gentle"></div>
                        
                        {/* AI Avatar */}
                        <div className="relative z-10 flex flex-col items-center space-y-6">
                            <div className={`relative ${enableMic ? 'animate-pulse' : ''}`}>
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                {expert?.avatar ? (
                                    <Image 
                                        src={expert.avatar} 
                                        alt='AI Expert Avatar' 
                                        width={150} 
                                        height={150} 
                                        className='relative z-10 h-32 w-32 rounded-full object-cover border-4 border-white shadow-xl' 
                                    />
                                ) : (
                                    <div className="relative z-10 h-32 w-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                                        <Bot className="w-16 h-16 text-white" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-slate-900">
                                    {expert?.name || 'AI Learning Assistant'}
                                </h3>
                                <p className="text-slate-600">Your Personal Learning Coach</p>
                            </div>

                            {/* Audio Visualization */}
                            {enableMic && (
                                <div className="flex items-center space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-full animate-pulse"
                                            style={{
                                                height: `${Math.max(8, audioLevel * 0.6 + Math.random() * 20)}px`,
                                                animationDelay: `${i * 0.1}s`
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Current Transcription */}
                            {transcribe && (
                                <div className="max-w-md p-4 bg-white/80 backdrop-blur-md rounded-xl border border-indigo-200">
                                    <p className="text-sm text-slate-700 italic">"{transcribe}"</p>
                                </div>
                            )}
                        </div>

                        {/* Audio Player */}
                        {audioUrl && (
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-indigo-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                            {isAudioPlaying ? (
                                                <Volume2 className="w-5 h-5 text-white" />
                                            ) : (
                                                <VolumeX className="w-5 h-5 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <audio 
                                                ref={audioRef}
                                                src={audioUrl} 
                                                autoPlay 
                                                controls 
                                                className="w-full"
                                                onPlay={() => setIsAudioPlaying(true)}
                                                onPause={() => setIsAudioPlaying(false)}
                                                onEnded={() => setIsAudioPlaying(false)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User Button */}
                        <div className="absolute top-6 right-6">
                            <div className="bg-white/90 backdrop-blur-md rounded-xl p-2 border border-indigo-200">
                                <UserButton />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat and Controls Section */}
                <div className="xl:col-span-7 space-y-6">
                    {/* Control Panel */}
                    <div className="modern-card p-6 bg-white/90 backdrop-blur-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <h3 className="text-lg font-semibold text-slate-900">Voice Controls</h3>
                                {enableMic && (
                                    <div className="flex items-center space-x-2 text-green-600">
                                        <Activity className="w-4 h-4 animate-pulse" />
                                        <span className="text-sm font-medium">Recording Active</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                {/* Credits Display */}
                                <div className="flex items-center space-x-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                                    <Zap className="w-4 h-4 text-amber-600" />
                                    <span className="text-sm font-medium text-amber-700">
                                        {userData?.credit || 0} credits
                                    </span>
                                </div>

                                {/* Main Control Button */}
                                {!enableMic ? (
                                    <Button 
                                        onClick={connectToServer} 
                                        disabled={loading}
                                        className="btn-gradient px-6 py-3 rounded-xl font-semibold hover-lift"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2Icon className='animate-spin w-5 h-5 mr-2'/>
                                                Connecting...
                                            </>
                                        ) : (
                                            <>
                                                <Mic className="w-5 h-5 mr-2" />
                                                Start Session
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="destructive" 
                                        onClick={disconnect} 
                                        disabled={loading}
                                        className="px-6 py-3 rounded-xl font-semibold hover-lift bg-red-500 hover:bg-red-600"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2Icon className='animate-spin w-5 h-5 mr-2'/>
                                                Ending...
                                            </>
                                        ) : (
                                            <>
                                                <MicOff className="w-5 h-5 mr-2" />
                                                End Session
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chat Interface */}
                    <ChatBox 
                        conversation={conversation}
                        enableFeedbackNotes={enableFeedbackNotes}
                        coachingOption={discussionRoomData?.coachingOption}
                    />
                </div>
            </div>
        </div>
    );
};

export default DiscussionRoom;