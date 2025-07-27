"use client"

import { BlurFade } from "@/components/magicui/blur-fade";
import { Button } from "@/components/ui/button";
import { CoachingOptions } from "@/services/Options";
import { useUser } from '@stackframe/stack'
import Image from "next/image";
import React from 'react'
import UserInputDialog from "./UserInputDialog";
import ProfileDialog from "./Profile";
import { Sparkles, BookOpen, Users, TrendingUp, Clock, Award, Play, ArrowRight, Target, Zap } from "lucide-react";

const FeatureAssistant = () => {
  const user = useUser();
  
  const stats = [
    { icon: <BookOpen className="w-5 h-5" />, label: "Courses", value: "50+" },
    { icon: <Users className="w-5 h-5" />, label: "Students", value: "10K+" },
    { icon: <Award className="w-5 h-5" />, label: "Success Rate", value: "95%" },
    { icon: <Clock className="w-5 h-5" />, label: "Hours Saved", value: "1000+" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50 p-6">
      {/* Header Section */}
      <div className="relative">
        {/* Welcome Header */}
        <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 space-y-6 lg:space-y-0'>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                <h2 className='text-slate-600 text-sm font-medium tracking-wide uppercase'>My Learning Workspace</h2>
              </div>
            </div>
            <h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight'>
              Welcome back, {user?.displayName || 'Learner'}
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl">
              Ready to enhance your skills with AI-powered learning? Choose your path and let's get started!
            </p>
          </div>
          
          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            <ProfileDialog>
              <Button className="bg-white/80 backdrop-blur-md hover:bg-white text-slate-700 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-xl font-medium hover-lift">
                <div className="flex items-center space-x-3">
                  {user?.profileImageUrl && (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full border-2 border-indigo-200"
                    />
                  )}
                  <span>Profile & Credits</span>
                </div>
              </Button>
            </ProfileDialog>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <BlurFade key={index} delay={0.1 + index * 0.1} inView>
                <div className="modern-card p-6 text-center hover-lift">
                  <div className="feature-icon mx-auto mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>

        {/* Learning Options Section */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-slate-900">Choose Your Learning Path</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Explore our comprehensive AI-powered learning modules designed to accelerate your growth
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6'>
            {CoachingOptions.map((option, index) => (
              <BlurFade key={option.icon} delay={0.2 + index * 0.1} inView>
                <UserInputDialog CoachingOptions={option}>
                  <div className='group modern-card p-6 cursor-pointer hover-lift transition-all duration-300'>
                    <div className='flex flex-col items-center text-center space-y-4'>
                      {/* Icon Container */}
                      <div className="relative">
                        <div className="feature-icon group-hover:scale-110 transition-transform duration-300">
                          <Image
                            src={option.icon}
                            alt={option.name}
                            width={32}
                            height={32}
                            className='w-8 h-8 filter brightness-0 invert'
                          />
                        </div>
                        {/* Floating Animation Indicator */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                      </div>
                      
                      {/* Content */}
                      <div className="space-y-2">
                        <h3 className='text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors duration-300'>
                          {option.name}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {option.description || "Enhance your skills with AI-powered learning"}
                        </p>
                      </div>
                      
                      {/* Action Indicator */}
                      <div className="flex items-center text-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <span className="text-sm font-medium mr-2">Get Started</span>
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </UserInputDialog>
              </BlurFade>
            ))}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mt-16 p-8 modern-card bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-slate-900">Ready to Start Learning?</h3>
            <p className="text-slate-600 max-w-lg mx-auto">
              Join thousands of learners who have transformed their careers with our AI-powered platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button className="btn-gradient px-8 py-3 rounded-xl text-white font-semibold hover-lift">
                Explore All Courses
              </Button>
              <Button variant="outline" className="px-8 py-3 rounded-xl border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold hover-lift">
                View Progress
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeatureAssistant