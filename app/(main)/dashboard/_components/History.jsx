"use client"

import { UserContext } from '@/app/_context/UserContext';
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import React, { useContext, useEffect, useState } from 'react';
import { ArrowRight, Clock, BookOpen, GraduationCap, FileText, Calendar, Play } from 'lucide-react';
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

  const lectureHistory = discussionRoomList?.filter(item => 
    item.coachingOption === 'Topic Base Lecture' || item.coachingOption === 'Learn Language'
  ) || [];

  const totalLearningTime = lectureHistory.length * 15; // Estimate 15 mins per session

  return (
    <div className="modern-card p-6 bg-white/80 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="feature-icon">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className='font-bold text-xl text-slate-900'>Learning History</h2>
            <p className="text-sm text-slate-600">Track your educational journey</p>
          </div>
        </div>
        
        {lectureHistory.length > 0 && (
          <Button 
            variant="ghost" 
            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium"
          >
            View all 
            <ArrowRight size={16} className="ml-1" />
          </Button>
        )}
      </div>

      {/* Learning Stats */}
      {lectureHistory.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">{lectureHistory.length}</div>
            <div className="text-xs text-slate-600">Lectures</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalLearningTime}m</div>
            <div className="text-xs text-slate-600">Time Spent</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">
              {Math.min(lectureHistory.length, 7)}/7
            </div>
            <div className="text-xs text-slate-600">This Week</div>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="space-y-3 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : lectureHistory.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No learning sessions yet</h3>
          <p className="text-slate-600 mb-6">Start your first lecture or language learning session to build your history</p>
          <Button className="btn-gradient px-6 py-2 rounded-lg text-white font-medium">
            <Play className="w-4 h-4 mr-2" />
            Start Learning
          </Button>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
          {lectureHistory.map((item, index) => (
            <div key={index} className="group p-4 bg-gradient-to-r from-white to-slate-50 rounded-xl border border-slate-200/60 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4 flex-1'>
                  {/* Icon */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                      <Image 
                        src={GetAbstractImages(item.coachingOption)} 
                        alt='session type'
                        width={24} 
                        height={24} 
                        className='w-6 h-6'
                      />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-2 h-2 text-white" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className='font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors duration-300 truncate'>
                      {item.topic}
                    </h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center text-slate-500">
                        <BookOpen size={14} className="mr-1" />
                        <span className='text-sm'>{item.coachingOption}</span>
                      </div>
                      <div className="flex items-center text-slate-500">
                        <Calendar size={14} className="mr-1" />
                        <span className='text-sm'>{getRelativeTime(item._creationTime)}</span>
                      </div>
                    </div>
                    
                    {/* Learning Progress Indicator */}
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="progress-modern h-2 flex-1">
                        <div 
                          className="progress-fill h-full bg-gradient-to-r from-emerald-400 to-green-500"
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                      <span className="text-xs text-emerald-600 font-medium">Completed</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Button */}
                <div className="flex items-center space-x-3 ml-4">
                  <Link href={'/view-summery/' + item._id}>
                    <Button 
                      size="sm"
                      className='opacity-0 group-hover:opacity-100 transition-all duration-300 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-0 px-4 py-2 rounded-lg font-medium'
                    >
                      <FileText size={14} className="mr-2" />
                      View Notes
                    </Button>
                  </Link>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Learning Streak Footer */}
      {lectureHistory.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-600">
                {lectureHistory.length >= 3 ? `${lectureHistory.length} day learning streak! 🔥` : 'Keep learning to build your streak!'}
              </span>
            </div>
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
              Continue Learning
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;