"use client"

import { BlurFade } from "@/components/magicui/blur-fade";
import { Button } from "@/components/ui/button";
import { CoachingOptions } from "@/services/Options";
import { useUser } from '@stackframe/stack'
import Image from "next/image";
import React from 'react'
import UserInputDialog from "./UserInputDialog";
import ProfileDialog from "./Profile";

const FeatureAssistant = () => {
  const user = useUser();
  
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white p-6">
      <div className='flex justify-between items-center mb-10'>
        <div>
          <h2 className='text-gray-400 text-sm font-medium mb-1'>My Workspace</h2>
          <h1 className='text-3xl md:text-4xl font-bold text-white tracking-tight'>Welcome back, {user?.displayName}</h1>
        </div>
      <ProfileDialog>
      <Button className="bg-[#1a1a1a] hover:bg-[#252525] text-white border border-[#333] px-5 py-2 rounded-lg">
          Profile
        </Button>
      </ProfileDialog>
      </div>
      
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6'>
        {CoachingOptions.map((option, index) => (
          <BlurFade key={option.icon} delay={0.25 + index * 0.05} inView>
            <div className='p-5 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] rounded-xl transition-all duration-300'>
              <UserInputDialog CoachingOptions={option}>
                <div className='flex flex-col justify-center items-center'>
                  <div className="p-3 bg-[#252525] rounded-lg mb-3">
                    <Image
                      src={option.icon}
                      alt={option.name}
                      width={60}
                      height={60}
                      className='h-14 w-14 hover:scale-110 cursor-pointer transition-all duration-300'
                    />
                  </div>
                  <h2 className='text-sm font-medium text-gray-200'>{option.name}</h2>
                </div>
              </UserInputDialog>
            </div>
          </BlurFade>
        ))}
      </div>
    </div>
  )
}

export default FeatureAssistant