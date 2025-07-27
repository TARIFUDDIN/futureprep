"use client"

import React, { useState, useContext } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay
} from "@/components/ui/dialog"
import { CoachingExpert } from '@/services/Options'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useMutation } from 'convex/react'
import { 
  LoaderCircle, 
  X, 
  ArrowRight, 
  Sparkles, 
  Target, 
  Users, 
  CheckCircle2,
  Lightbulb,
  Play,
  Star,
  Clock,
  Zap
} from 'lucide-react'
import { api } from '@/convex/_generated/api'
import { useRouter } from 'next/navigation'
import { UserContext } from '@/app/_context/UserContext'

const UserInputDialog = ({ children, CoachingOptions }) => {
  const [selectedExpert, setSelectedExpert] = useState('');
  const [topic, setTopic] = useState('');
  const CreateDiscussionRoom = useMutation(api.DiscussionRoom.CreateNewRoom);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();
  const { userData, isLoading: userLoading } = useContext(UserContext);

  // Debug logging
  console.log('Current state:', {
    topic,
    selectedExpert,
    userData,
    userLoading,
    buttonEnabled: !!(topic && selectedExpert && userData?._id && !loading && !userLoading)
  });

  const onClickNext = async () => {
    console.log('Start Learning button clicked!');
    
    // Additional validation
    if (!userData?._id) {
      console.error('User data not loaded yet');
      alert('Please wait for user data to load');
      return;
    }

    if (!topic || !selectedExpert) {
      console.error('Missing required fields:', { topic, selectedExpert });
      alert('Please fill in all required fields');
      return;
    }

    console.log('Creating discussion room with:', {
      topic,
      coachingOption: CoachingOptions?.name,
      expertName: selectedExpert,
      uid: userData._id
    });

    setLoading(true);
    try {
      const result = await CreateDiscussionRoom({
        topic: topic,
        coachingOption: CoachingOptions?.name,
        expertName: selectedExpert,
        uid: userData._id
      });
      
      console.log('Discussion room created with ID:', result);
      
      if (result) {
        setOpenDialog(false);
        // Reset form
        setTopic('');
        setSelectedExpert('');
        // Navigate to discussion room
        router.push(`/discussion-room/${result}`);
      } else {
        throw new Error('No room ID returned');
      }
    } catch (error) {
      console.error('Error creating discussion room:', error);
      alert(`Error creating discussion room: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleReset = () => {
    setTopic('');
    setSelectedExpert('');
  }

  // Check if button should be enabled
  const isButtonEnabled = !!(topic && selectedExpert && userData?._id && !loading && !userLoading);

  // Show loading state if user data is still loading
  if (userLoading) {
    return (
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <div className="cursor-pointer">{children}</div>
        </DialogTrigger>
        
        <DialogOverlay className="bg-black/50 backdrop-blur-md fixed inset-0 z-40 transition-all duration-300" />
        
        <DialogContent className="bg-white/95 backdrop-blur-md border border-slate-200/50 shadow-2xl rounded-2xl text-slate-900 w-full max-w-2xl z-50">
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center space-x-3">
              <LoaderCircle className="animate-spin w-6 h-6 text-indigo-500" />
              <span className="text-slate-600">Loading user data...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <div className="cursor-pointer">{children}</div>
      </DialogTrigger>
      
      <DialogOverlay className="bg-black/50 backdrop-blur-md fixed inset-0 z-40 transition-all duration-300" />
      
      <DialogContent className="bg-white/95 backdrop-blur-md border border-slate-200/50 shadow-2xl rounded-2xl text-slate-900 w-full max-w-2xl z-50 max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header Section */}
        <div className="relative p-6 pb-4 border-b border-slate-200 flex-shrink-0">
          <DialogClose className="absolute right-4 top-4 rounded-full p-2 hover:bg-slate-100 transition-colors z-10">
            <X className="w-5 h-5 text-slate-600" />
          </DialogClose>
          
          <DialogHeader className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-slate-900">
                  {CoachingOptions?.name}
                </DialogTitle>
                <p className="text-slate-600 text-sm">Start your AI-powered learning journey</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto">
          <DialogDescription asChild>
            <div className="p-6 space-y-6">
              
              {/* Topic Input Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <Target className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    What would you like to learn?
                  </h3>
                </div>
                
                <div className="relative">
                  <textarea
                    placeholder={`Enter your ${CoachingOptions?.name.toLowerCase()} topic here...`}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full min-h-[100px] p-4 bg-white border-2 border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 resize-none placeholder-slate-400 transition-all duration-300"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                    {topic?.length || 0}/500
                  </div>
                </div>
                
                {/* Topic Suggestions */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-slate-500 font-medium">Quick suggestions:</span>
                  {['Interview Preparation', 'JavaScript Basics', 'Communication Skills', 'Data Structures'].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setTopic(suggestion)}
                      className="px-3 py-1 text-xs bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 rounded-full transition-colors duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expert Selection Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                      <Users className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Choose Your AI Expert
                    </h3>
                  </div>
                  <div className="text-sm text-slate-500">
                    {selectedExpert ? '1 selected' : 'Select one'}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {CoachingExpert.map((expert, index) => (
                    <div 
                      key={index} 
                      onClick={() => setSelectedExpert(expert.name)} 
                      className={`group relative flex flex-col items-center cursor-pointer transition-all duration-300 p-3 rounded-2xl border-2 hover:shadow-lg ${
                        selectedExpert === expert.name 
                          ? 'border-indigo-400 bg-indigo-50 shadow-lg' 
                          : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                      }`}
                    >
                      {/* Expert Avatar */}
                      <div className="relative mb-2">
                        <div className={`relative rounded-xl overflow-hidden transition-transform duration-300 ${
                          selectedExpert === expert.name ? 'scale-105' : 'group-hover:scale-105'
                        }`}>
                          <Image
                            src={expert.avatar}
                            alt={expert.name}
                            width={60}
                            height={60}
                            className="w-15 h-15 object-cover"
                          />
                        </div>
                        
                        {/* Selection Indicator */}
                        {selectedExpert === expert.name && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Expert Info */}
                      <div className="text-center">
                        <h4 className="font-semibold text-slate-900 text-sm mb-1">{expert.name}</h4>
                        <div className="flex items-center justify-center space-x-1">
                          <Star className="w-3 h-3 text-amber-400 fill-current" />
                          <span className="text-xs text-slate-500">Expert</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features Preview */}
              {topic && selectedExpert && (
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-900 text-sm">Your Learning Session Preview</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2 text-xs text-slate-600">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          <span>15-30 min</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-600">
                          <Zap className="w-3 h-3 text-indigo-500" />
                          <span>AI feedback</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-600">
                          <Users className="w-3 h-3 text-indigo-500" />
                          <span>{selectedExpert}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-600">
                          <Target className="w-3 h-3 text-indigo-500" />
                          <span>{topic.slice(0, 15)}...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* User Info Debug (Remove this in production) */}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                <strong>Debug:</strong> 
                <br />Topic: {topic || 'Empty'} 
                <br />Expert: {selectedExpert || 'None'} 
                <br />User ID: {userData?._id || 'Missing'}
                <br />User Email: {userData?.email || 'Missing'}
                <br />Button Enabled: {isButtonEnabled ? 'Yes' : 'No'}
              </div>
            </div>
          </DialogDescription>
        </div>

        {/* Fixed Footer Actions */}
        <div className="border-t border-slate-200 p-4 bg-gradient-to-r from-slate-50 to-blue-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Reset Button */}
            <Button 
              variant="ghost" 
              onClick={handleReset}
              className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-sm"
              disabled={loading}
            >
              Reset
            </Button>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <DialogClose asChild>
                <Button 
                  variant="outline" 
                  className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button
                disabled={!isButtonEnabled}
                onClick={onClickNext}
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  !isButtonEnabled
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <LoaderCircle className="animate-spin w-4 h-4" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Start Learning</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="mt-3 flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              topic ? 'bg-indigo-500' : 'bg-slate-300'
            }`} />
            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              selectedExpert ? 'bg-indigo-500' : 'bg-slate-300'
            }`} />
            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              userData?._id ? 'bg-indigo-500' : 'bg-slate-300'
            }`} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UserInputDialog