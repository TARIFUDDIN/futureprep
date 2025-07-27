"use client"

import React, { useState, useRef, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserButton } from "@stackframe/stack";
import {
  Mic,
  Brain,
  BookOpen,
  Globe,
  Languages,
  MessageCircleQuestion,
  ArrowRight,
  VolumeX,
  Cpu,
  Cloud,
  Sparkles,
  Bot,
  Zap,
  Code,
  LineChart,
  PaintBucket,
  BookText,
  Server,
  Heart,
  Coffee,
  Mail,
  Github,
  Linkedin,
  Twitter,
  Star,
  Send,
  Play,
  Users,
  Award,
  TrendingUp,
  CheckCircle,
  Target,
  Lightbulb,
  Rocket,
  Shield,
  Clock
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { cleanupAnimationObserver, setupAnimationObserver } from "@/lib/animationObserver";
import { Input } from "@/components/ui/input";

const Index = () => {
  const typingRef = useRef(null);
  const techSectionRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const chatContainerRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! I'm your AI learning assistant. How can I help you today?", isUser: false, timestamp: new Date() }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const observer = setupAnimationObserver();
    return () => {
      if (observer) cleanupAnimationObserver(observer);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    
    const newUserMessage = {
      id: messages.length + 1,
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);
    
    setTimeout(() => {
      const responses = [
        "I can help you practice for interviews in various tech fields. What specific area are you interested in?",
        "Would you like to try our AI voice learning feature? It's great for language practice.",
        "I can explain complex topics in a simple way. What would you like to learn about?",
        "Let me know what skills you're looking to improve and I'll suggest some learning paths for you."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const newAiMessage = {
        id: messages.length + 2,
        text: randomResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setIsTyping(false);
      setMessages(prev => [...prev, newAiMessage]);
    }, 1500);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  }

  const features = [
    {
      icon: <Mic className="w-8 h-8 text-white" />,
      title: "AI Voice Interviews",
      description: "Practice with realistic mock interviews powered by advanced AI across various industries and roles.",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: <MessageCircleQuestion className="w-8 h-8 text-white" />,
      title: "Smart Q&A Sessions",
      description: "Interactive learning through AI-powered question and answer modules with instant feedback.",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-white" />,
      title: "Personalized Lectures",
      description: "AI-led lectures tailored to your learning goals, pace, and preferred learning style.",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      icon: <Languages className="w-8 h-8 text-white" />,
      title: "Language Mastery",
      description: "Immersive language practice with AI conversation agents for natural fluency development.",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  const howItWorks = [
    {
      title: "Create Your Profile",
      description: "Set up your personalized learning objectives and preferences",
      icon: <Target className="w-8 h-8 text-indigo-600" />,
      step: "01"
    },
    {
      title: "Choose Your Path",
      description: "Select from interviews, topics, or language skills tailored to you",
      icon: <Lightbulb className="w-8 h-8 text-indigo-600" />,
      step: "02"
    },
    {
      title: "AI-Powered Learning",
      description: "Engage with intelligent voice agents in real-time conversations",
      icon: <Rocket className="w-8 h-8 text-indigo-600" />,
      step: "03"
    },
    {
      title: "Track & Improve",
      description: "Monitor progress with detailed analytics and personalized insights",
      icon: <TrendingUp className="w-8 h-8 text-indigo-600" />,
      step: "04"
    }
  ];

  const aiTechnologies = [
    {
      name: "Assembly AI",
      icon: <Mic className="w-12 h-12 text-indigo-600" />,
      description: "Industry-leading speech-to-text technology with 95%+ accuracy, supporting real-time transcription with minimal latency.",
      features: ["Real-time transcription", "Multi-language support", "Accent recognition", "Noise filtering"],
      gradient: "from-blue-50 to-indigo-50"
    },
    {
      name: "Gemini AI Flash 2.0",
      icon: <Sparkles className="w-12 h-12 text-purple-600" />,
      description: "Next-generation AI model for contextual understanding and personalized content generation at lightning speed.",
      features: ["Contextual responses", "Personalized content", "Multi-format generation", "Advanced reasoning"],
      gradient: "from-purple-50 to-pink-50"
    },
    {
      name: "Amazon Polly",
      icon: <VolumeX className="w-12 h-12 text-emerald-600" />,
      description: "Neural text-to-speech service that creates lifelike human speech in multiple languages and voices.",
      features: ["Natural prosody", "Multiple voices", "Emotional tones", "SSML support"],
      gradient: "from-emerald-50 to-teal-50"
    }
  ];

  const faqs = [
    {
      question: "How accurate are the AI voice agents?",
      answer: "Our AI agents use cutting-edge speech recognition and natural language processing with 95%+ accuracy. They provide context-aware conversations tailored to your learning goals and adapt to your speaking style and pace."
    },
    {
      question: "What types of interviews can I practice?",
      answer: "We offer comprehensive mock interviews across 50+ industries including tech, finance, healthcare, consulting, creative fields, and more. Each interview is customized based on your role, experience level, and target company."
    },
    {
      question: "How is AI language learning different?",
      answer: "Our AI provides real-time conversation practice with instant pronunciation feedback, cultural context, and adaptive difficulty. It's like having a native speaker available 24/7 who never gets tired or impatient."
    },
    {
      question: "Is my personal data secure?",
      answer: "Absolutely. We use enterprise-grade encryption, SOC 2 compliance, and follow strict data privacy protocols. Your conversations are encrypted end-to-end, and you maintain full control over your data."
    },
    {
      question: "Can I track my learning progress?",
      answer: "Yes! Our advanced analytics dashboard shows detailed progress metrics, skill improvements, learning streaks, time spent, and personalized recommendations for continued growth."
    }
  ];

  const testimonials = [
    {
      quote: "FuturePrep transformed my interview confidence completely. The AI feedback was incredibly detailed and helped me land my dream role at Google. The voice agents feel so natural!",
      author: "Jishan Ali",
      role: "Software Engineer at Google",
      avatar: "/api/placeholder/150/150",
      rating: 5
    },
    {
      quote: "As someone learning Spanish, the AI conversation practice is phenomenal. It's patient, corrects my pronunciation gently, and adapts to my learning pace perfectly.",
      author: "Deep Ghosal",
      role: "Graduate Student at MIT",
      avatar: "/api/placeholder/150/150",
      rating: 5
    },
    {
      quote: "I recommend FuturePrep to all my students. The personalized learning paths and instant feedback are revolutionizing how we approach education in the digital age.",
      author: "Dr. Soumya Sen",
      role: "Professor at Stanford University",
      avatar: "/api/placeholder/150/150",
      rating: 5
    },
    {
      quote: "The mock interviews were crucial for my career transition. I practiced data science scenarios I'd never encountered and felt completely prepared for anything.",
      author: "Wazib Ansar",
      role: "Senior Data Scientist",
      avatar: "/api/placeholder/150/150",
      rating: 5
    }
  ];

  const subjectAreas = [
    { name: "Artificial Intelligence", icon: <Brain className="w-8 h-8 text-indigo-600" />, color: "from-indigo-100 to-purple-100" },
    { name: "Data Science", icon: <LineChart className="w-8 h-8 text-blue-600" />, color: "from-blue-100 to-cyan-100" },
    { name: "Web Development", icon: <Code className="w-8 h-8 text-emerald-600" />, color: "from-emerald-100 to-green-100" },
    { name: "Java Development", icon: <Coffee className="w-8 h-8 text-orange-600" />, color: "from-orange-100 to-amber-100" },
    { name: "Creative Design", icon: <PaintBucket className="w-8 h-8 text-pink-600" />, color: "from-pink-100 to-rose-100" },
    { name: "Business Analytics", icon: <TrendingUp className="w-8 h-8 text-violet-600" />, color: "from-violet-100 to-purple-100" },
    { name: "Cloud Computing", icon: <Cloud className="w-8 h-8 text-sky-600" />, color: "from-sky-100 to-blue-100" },
    { name: "Backend Systems", icon: <Server className="w-8 h-8 text-slate-600" />, color: "from-slate-100 to-gray-100" },
    { name: "Literature & Writing", icon: <BookText className="w-8 h-8 text-amber-600" />, color: "from-amber-100 to-yellow-100" }
  ];

  const teamMembers = [
    {
      name: "Syed Tarifuddin Ahmed",
      role: "Founder & AI Research Lead",
      bio: "Full-stack developer and AI enthusiast with deep expertise in Machine Learning, AI Automation, and Natural Language Processing technologies.",
      avatar: "/api/placeholder/150/150",
      social: { linkedin: "#", twitter: "#", github: "#" }
    },
    {
      name: "Koulik Jana",
      role: "Chief Technology Officer",
      bio: "Former engineering lead at top tech companies, specializing in speech synthesis, voice AI, and scalable distributed systems architecture.",
      avatar: "/api/placeholder/150/150",
      social: { linkedin: "#", twitter: "#", github: "#" }
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Learners", icon: <Users className="w-6 h-6" /> },
    { number: "95%", label: "Success Rate", icon: <Award className="w-6 h-6" /> },
    { number: "100K+", label: "Sessions Completed", icon: <CheckCircle className="w-6 h-6" /> },
    { number: "24/7", label: "AI Availability", icon: <Clock className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50">
      {/* Modern Navigation */}
      <header className="fixed top-0 w-full z-50 nav-modern">
        <nav className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-3xl font-bold">
            Future<span className="text-gradient">Prep</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">How it Works</Link>
            <Link href="#testimonials" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Reviews</Link>
            <Link href="#pricing" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Pricing</Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button className="btn-gradient px-6 py-2 rounded-xl font-semibold hover-lift hidden md:inline-flex">
                Dashboard
              </Button>
            </Link>
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10 border-2 border-indigo-200",
                  userButtonOuter: "hover:scale-105 transition-transform"
                }
              }}
            />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center relative z-10">
          {/* Left Content */}
          <div className="lg:w-1/2 space-y-8 animate-fade-in">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-200">
                <Sparkles className="w-4 h-4 text-indigo-600 mr-2" />
                <span className="text-sm font-medium text-indigo-700">Powered by Advanced AI</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Master Skills with 
                <span className="block text-gradient">AI-Powered Learning</span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                Transform your career with personalized AI coaching. Practice interviews, learn languages, 
                and master new topics with our intelligent voice agents available 24/7.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="btn-gradient px-8 py-4 text-lg font-semibold rounded-xl hover-lift group">
                  Start Learning Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold rounded-xl border-2 hover-lift">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2 text-indigo-600">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{stat.number}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Content - Interactive Chat Demo */}
          <div className="lg:w-1/2 mt-12 lg:mt-0 flex justify-center">
            <div className="w-full max-w-md">
              <div className="modern-card p-6 bg-white/90 backdrop-blur-md overflow-hidden">
                {/* Chat Header */}
                <div className="flex items-center border-b border-slate-200 pb-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">FuturePrep AI</h3>
                    <p className="text-sm text-emerald-600 flex items-center">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                      Online
                    </p>
                  </div>
                </div>
                
                {/* Messages */}
                <div 
                  ref={chatContainerRef}
                  className="h-80 overflow-y-auto mb-4 space-y-3 custom-scrollbar"
                >
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!message.isUser && (
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                          <Bot className="h-4 w-4 text-indigo-600" />
                        </div>
                      )}
                      <div className={message.isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-70 text-right mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <Bot className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="chat-bubble-ai">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    type="text" 
                    placeholder="Ask me anything about learning..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="input-modern flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    className="btn-gradient p-3 rounded-xl"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-200 text-center">
                  <p className="text-xs text-slate-500">
                    Experience our AI • Try voice commands
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Powerful Learning Features
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our comprehensive AI-powered platform provides everything you need to accelerate your learning journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="modern-card p-8 text-center hover-lift animate-on-scroll group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Your Learning Journey</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Get started in minutes and begin transforming your skills with our intuitive platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div 
                key={index} 
                className="text-center animate-on-scroll"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto hover-scale">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Technologies */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Cutting-Edge AI Technologies
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We leverage the most advanced AI technologies to provide you with an unparalleled learning experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aiTechnologies.map((tech, index) => (
              <div 
                key={index} 
                className={`modern-card p-8 bg-gradient-to-br ${tech.gradient} hover-lift animate-on-scroll`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="text-center mb-6">
                  <div className="inline-flex p-4 bg-white rounded-2xl shadow-lg mb-4">
                    {tech.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{tech.name}</h3>
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">{tech.description}</p>
                <ul className="space-y-3">
                  {tech.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What Our Learners Say</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join thousands who have transformed their careers with our AI-powered learning platform
            </p>
          </div>
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent className="p-2">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="modern-card p-8 h-full hover-lift">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-slate-700 mb-6 leading-relaxed italic">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 border-2 border-indigo-200 mr-4">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100">
                          {testimonial.author[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-slate-900">{testimonial.author}</div>
                        <div className="text-sm text-indigo-600">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-8">
              <CarouselPrevious className="relative left-0 hover:bg-indigo-100" />
              <CarouselNext className="relative right-0 hover:bg-indigo-100" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Subject Areas */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-slate-100 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Master Any Subject</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our AI agents are trained across diverse disciplines to help you excel in any field
            </p>
          </div>
          
          <div className="relative">
            <div className="flex animate-scroll overflow-hidden py-8">
              <div className="flex space-x-8 animate-scroll-infinite">
                {[...subjectAreas, ...subjectAreas].map((subject, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center space-y-4 min-w-[180px] hover-scale group"
                  >
                    <div className={`w-24 h-24 bg-gradient-to-br ${subject.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                      {subject.icon}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 text-center">{subject.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Passionate innovators dedicated to transforming education through AI technology
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2 animate-on-scroll">
              <h3 className="text-3xl font-bold text-slate-900 mb-6">About FuturePrep</h3>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Founded in 2024, FuturePrep is revolutionizing education through cutting-edge AI technology. 
                  Our mission is to democratize access to high-quality, personalized learning experiences.
                </p>
                <p>
                  We combine advanced speech recognition, natural language processing, and neural voice synthesis 
                  to create immersive learning environments that adapt to each learner's unique needs and goals.
                </p>
                <p>
                  Our team of AI researchers, educators, and technologists are committed to pushing the boundaries 
                  of educational technology, creating tools that inspire curiosity and accelerate growth.
                </p>
              </div>
              
              <div className="flex items-center space-x-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">50K+</div>
                  <div className="text-sm text-slate-600">Students Helped</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">95%</div>
                  <div className="text-sm text-slate-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">24/7</div>
                  <div className="text-sm text-slate-600">AI Support</div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-8">
              {teamMembers.map((member, index) => (
                <div 
                  key={index} 
                  className="modern-card p-6 text-center hover-lift animate-on-scroll"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-indigo-200">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-xl">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-sm text-indigo-600 font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{member.bio}</p>
                  <div className="flex justify-center space-x-3">
                    <a href={member.social.linkedin} className="text-slate-400 hover:text-indigo-600 transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a href={member.social.twitter} className="text-slate-400 hover:text-indigo-600 transition-colors">
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a href={member.social.github} className="text-slate-400 hover:text-indigo-600 transition-colors">
                      <Github className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to know about our AI-powered learning platform
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`} 
                  className="modern-card p-6 border-0 animate-on-scroll"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <AccordionTrigger className="text-lg font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="modern-card p-12 text-center bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white animate-on-scroll">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-5xl font-bold mb-6">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of learners who are already accelerating their careers with AI-powered education
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/dashboard">
                  <Button 
                    size="lg" 
                    className="bg-white text-indigo-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-xl hover-lift"
                  >
                    Start Learning Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4 text-lg font-semibold rounded-xl hover-lift"
                >
                  Schedule Demo
                </Button>
              </div>
              
              <div className="flex items-center justify-center space-x-8 mt-8 text-sm opacity-75">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Free to start
                </div>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Secure & private
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  24/7 available
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">
                Future<span className="text-indigo-400">Prep</span>
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Transforming education through AI-powered voice technology. 
                Experience learning reimagined for the digital age.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  <Github className="h-6 w-6" />
                </a>
              </div>
            </div>
            
            {/* Features */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Features</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-300 hover:text-indigo-400 transition-colors">AI Voice Interviews</a></li>
                <li><a href="#" className="text-slate-300 hover:text-indigo-400 transition-colors">Language Learning</a></li>
                <li><a href="#" className="text-slate-300 hover:text-indigo-400 transition-colors">Smart Q&A Sessions</a></li>
                <li><a href="#" className="text-slate-300 hover:text-indigo-400 transition-colors">Topic Lectures</a></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-300 hover:text-indigo-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="text-slate-300 hover:text-indigo-400 transition-colors">API Access</a></li>
                <li><a href="#" className="text-slate-300 hover:text-indigo-400 transition-colors">Community</a></li>
                <li><a href="#" className="text-slate-300 hover:text-indigo-400 transition-colors">Support Center</a></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center text-slate-300">
                  <Mail className="h-4 w-4 text-indigo-400 mr-2" />
                  <span>hello@futureprep.ai</span>
                </li>
                <li className="flex items-center text-slate-300">
                  <Globe className="h-4 w-4 text-indigo-400 mr-2" />
                  <span>Global Support</span>
                </li>
                <li className="flex items-center text-slate-300">
                  <Heart className="h-4 w-4 text-indigo-400 mr-2" />
                  <span>Made with AI</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Footer */}
          <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-400 text-sm">
              © 2024 FuturePrep AI. All rights reserved.
            </div>
            
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-slate-400 hover:text-indigo-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-slate-400 hover:text-indigo-400 transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="text-slate-400 hover:text-indigo-400 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;