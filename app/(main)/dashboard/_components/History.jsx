"use client"

import { UserContext } from '@/app/_context/UserContext';
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import React, { useContext, useEffect, useState } from 'react';
import { ArrowRight, Clock, BookOpen } from 'lucide-react';
import { CoachingOptions } from '@/services/Options';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import moment from 'moment';
import Link from 'next/link';

const History = () => {
  const convex = useConvex();
  const { userData } = useContext(UserContext);
  const [discussionRoomList, setDiscussionRoomList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      getDiscussionRooms();
    }
  }, [userData]);

  const getDiscussionRooms = async () => {
    try {
      setIsLoading(true);
      const result = await convex.query(api.DiscussionRoom.GetAllDiscussionRoom, {
        uid: userData?._id
      });
      console.log(result);
      setDiscussionRoomList(result);
    } catch (error) {
      console.error("Failed to fetch discussion rooms:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const GetAbstractImages = (option) => {
    const coachingOption = CoachingOptions.find((item) => item.name == option);
    return coachingOption?.abstract ?? '/ab1.png';
  }
  
  const getRelativeTime = (timestamp) => {
    return moment(timestamp).fromNow();
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className='font-bold text-xl text-white flex items-center gap-2'>
          <Clock size={20} className="text-[#ffb700]" />
          Your Previous Lectures
        </h2>
        {discussionRoomList?.length > 0 && (
          <button className="text-sm text-[#ffb700] hover:underline flex items-center">
            View all <ArrowRight size={16} className="ml-1" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse h-6 w-24 bg-[#252525] rounded"></div>
        </div>
      ) : discussionRoomList?.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-400">You don't have any previous lectures yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2"> {/* Added max height and scroll */}
          {discussionRoomList
            ?.filter(item => item.coachingOption === 'Topic Base Lecture' || item.coachingOption === 'Learn Language')
            .map((item, index) => (
              <div key={index} className="p-4 bg-[#252525] rounded-lg border border-[#333] hover:border-[#555] transition-all cursor-pointer group">
                <div className='flex justify-between items-center'>
                  <div className='flex gap-4 items-center w-full'>
                    <Image 
                      src={GetAbstractImages(item.coachingOption)} 
                      alt='abstract'
                      width={60} 
                      height={60} 
                      className='rounded-full h-[50px] w-[50px]'
                    />
                    <div className="flex-grow">
                      <h4 className='font-bold text-white group-hover:text-[#ffb700] transition-colors'>{item.topic}</h4>
                      <div className="flex flex-col">
                        <div className="flex items-center text-gray-400">
                          <BookOpen size={14} className="mr-1" />
                          <span className='text-sm'>{item.coachingOption}</span>
                        </div>
                        <span className='text-gray-400 text-sm'>{getRelativeTime(item._creationTime)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                  <Link href={'/view-summery/'+item._id}>
                    <Button 
                      variant={'outline'} 
                      className='hidden group-hover:block transition-all'
                    >
                      View Notes
                    </Button>
                    </Link>
                    <ArrowRight size={16} className="text-gray-500 group-hover:text-[#ffb700] transition-colors" />
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
};

export default History;