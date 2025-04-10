"use client"

import React from 'react';
import { api } from '@/convex/_generated/api';
import { CoachingOptions } from '@/services/Options';
import { useQuery } from 'convex/react';
import { BookOpen, Copy, CheckCircle } from 'lucide-react';
import moment from 'moment';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ChatBox from '../../discussion-room/[roomid]/_components/ChatBox';

// Improved SummaryBox Component
function SummaryBox({ summery }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-[#1E2430] rounded-xl p-6 shadow-lg">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4 text-gray-400 hover:text-amber-500"
        onClick={handleCopy}
      >
        {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
      </Button>
      <div className='h-[60vh] overflow-auto custom-scrollbar pr-4'>
        <ReactMarkdown 
          components={{
            code: ({node, inline, className, children, ...props}) => (
              <code 
                className={cn(
                  "bg-[#2C3342] text-[#E0E0E0] px-2 py-1 rounded-md text-sm",
                  className
                )} 
                {...props}
              >
                {children}
              </code>
            ),
            pre: ({node, ...props}) => (
              <pre 
                className="bg-[#2C3342] p-4 rounded-lg overflow-x-auto my-4"
                {...props} 
              />
            )
          }}
          className='text-base/8 text-gray-200'
        >
          {summery}
        </ReactMarkdown>
      </div>
    </div>
  );
}

// Improved ViewSummary Component
function ViewSummary() {
  const { roomid } = useParams();
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, { id: roomid });

  if (!DiscussionRoomData) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#121212]">
        <div className="animate-pulse w-16 h-16 bg-[#1E2430] rounded-full"></div>
      </div>
    );
  }

  const getRelativeTime = (timestamp) => {
    return moment(timestamp).fromNow();
  };

  const GetAbstractImages = (option) => {
    const coachingOption = CoachingOptions.find((item) => item.name == option);
    return coachingOption?.abstract ?? '/ab1.png';
  };

  return (
    <div className="bg-[#121212] min-h-screen p-8 text-white">
      <div className='flex justify-between items-center mb-8 bg-[#1E2430] p-6 rounded-xl shadow-md'>
        <div className='flex gap-6 items-center'>
          <Image
            src={GetAbstractImages(DiscussionRoomData.coachingOption)}
            alt="abstract"
            width={100}
            height={100}
            className="w-20 h-20 rounded-full border-4 border-amber-500"
          />
          <div>
            <h4 className='font-bold text-2xl text-amber-500 mb-2'>
              {DiscussionRoomData.topic}
            </h4>
            <div className="flex items-center text-gray-400 space-x-3">
              <BookOpen size={18} className="text-amber-500" />
              <span className='text-base'>{DiscussionRoomData.coachingOption}</span>
            </div>
          </div>
        </div>
        <span className='text-gray-500 text-sm'>
          {getRelativeTime(DiscussionRoomData._creationTime)}
        </span>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8'>
        <div className='lg:col-span-2'>
          <h2 className='text-2xl font-bold mb-6 text-amber-500'>Summary of Your Conversation</h2>
          <SummaryBox summery={DiscussionRoomData?.summery}/>
        </div>
        <div className='lg:col-span-1'>
          <h2 className='text-2xl font-bold mb-6 text-amber-500'>Your Conversation</h2>
          {DiscussionRoomData?.conversation && (
            <ChatBox
              conversation={DiscussionRoomData?.conversation}
              coachingOption={DiscussionRoomData?.coachingOption}
              enableFeedbackNotes={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewSummary;