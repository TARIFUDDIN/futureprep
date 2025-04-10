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
import { LoaderCircle } from 'lucide-react'
import { api } from '@/convex/_generated/api'
import { useRouter } from 'next/navigation'
import { UserContext } from '@/app/_context/UserContext'

const UserInputDialog = ({ children, CoachingOptions }) => {
  const [selectedExpert, setSelectedExpert] = useState();
  const [topic, setTopic] = useState();
  const CreateDiscussionRoom = useMutation(api.DiscussionRoom.CreateNewRoom);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();
  const { userData } = useContext(UserContext);

  const onClickNext = async () => {
    setLoading(true);
    const result = await CreateDiscussionRoom({
      topic: topic,
      coachingOption: CoachingOptions?.name,
      expertName: selectedExpert,
      uid: userData?._id
    })
    console.log(result);
    setLoading(false);
    setOpenDialog(false);
    router.push(`/discussion-room/${result}`);
  }

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <div className="cursor-pointer">{children}</div>
      </DialogTrigger>
      <DialogOverlay className="bg-black/80 backdrop-blur-sm fixed inset-0 z-40 transition-all duration-300" />
      <DialogContent className="bg-[#1a1a1a] border border-[#333] shadow-xl rounded-xl text-white w-full max-w-xl z-50">
        <div className="absolute right-4 top-4">
          <DialogClose className="rounded-full p-1 hover:bg-[#333] transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </DialogClose>
        </div>
        
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold text-white">{CoachingOptions.name}</DialogTitle>
        </DialogHeader>
        
        <DialogDescription asChild>
          <div className="mt-4 space-y-6">
            <div>
              <h2 className="text-white font-medium mb-3 text-lg">Enter a topic to master your skills in {CoachingOptions.name}</h2>
              <textarea
                placeholder="Enter your topic here..."
                className="w-full min-h-[100px] p-4 bg-[#252525] border border-[#444] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb700] resize-none placeholder-gray-500"
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            
            <div>
              <h2 className="text-white font-medium mb-4 text-lg">Choose an expert for {CoachingOptions.name}</h2>
              <div className="grid grid-cols-3 gap-4">
                {CoachingExpert.map((expert, index) => (
                  <div 
                    key={index} 
                    onClick={() => setSelectedExpert(expert.name)} 
                    className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-2 rounded-lg ${selectedExpert === expert.name ? 'bg-[#252525] ring-2 ring-[#ffb700]' : 'hover:bg-[#252525]'}`}
                  >
                    <div className="relative mb-2">
                      <Image
                        src={expert.avatar}
                        alt={expert.name}
                        width={80}
                        height={80}
                        className="rounded-full object-cover"
                      />
                      {selectedExpert === expert.name && (
                        <div className="absolute -right-1 -bottom-1 bg-[#ffb700] rounded-full p-1">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h2 className="text-sm font-medium text-center">{expert.name}</h2>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <DialogClose asChild>
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-[#333] border border-[#444]">
                  Cancel
                </Button>
              </DialogClose>

              <Button
                disabled={!topic || !selectedExpert || loading}
                onClick={onClickNext}
                className={`bg-[#ffb700] hover:bg-[#ffcc40] text-black font-medium px-6 ${!topic || !selectedExpert || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <LoaderCircle className="animate-spin mr-2 h-4 w-4" />
                    Processing...
                  </span>
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

export default UserInputDialog