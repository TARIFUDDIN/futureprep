"use client"
import React, { useEffect, useRef, useState } from "react";
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
  Send
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
  const chatContainerRef = useRef(null);  // Remove <HTMLDivElement>
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
    
    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue("");
    
    // Simulate AI typing
    setIsTyping(true);
    
    // Simulate AI response after delay
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
      icon: <Mic className="w-10 h-10 text-primary" />,
      title: "AI Voice Interviews",
      description: "Realistic mock interviews with AI agents across various industries and roles."
    },
    {
      icon: <MessageCircleQuestion className="w-10 h-10 text-primary" />,
      title: "Q&A Sessions",
      description: "Interactive learning through AI-powered question and answer modules."
    },
    {
      icon: <BookOpen className="w-10 h-10 text-primary" />,
      title: "Topic-Based Lectures",
      description: "Personalized AI-led lectures tailored to your learning goals."
    },
    {
      icon: <Languages className="w-10 h-10 text-primary" />,
      title: "Language Learning",
      description: "Immersive language practice with AI conversation agents."
    }
  ];

  const howItWorks = [
    {
      title: "Personalized Setup",
      description: "Create your profile and set learning objectives",
      icon: <Brain className="w-8 h-8 text-primary" />
    },
    {
      title: "Choose Your Path",
      description: "Select interview types, topics, or language skills",
      icon: <Globe className="w-8 h-8 text-primary" />
    },
    {
      title: "AI-Powered Learning",
      description: "Engage with intelligent voice agents",
      icon: <Mic className="w-8 h-8 text-primary" />
    },
    {
      title: "Track Progress",
      description: "Monitor improvements and get personalized insights",
      icon: <BookOpen className="w-8 h-8 text-primary" />
    }
  ];

  const aiTechnologies = [
    {
      name: "Assembly AI",
      icon: <Mic className="tech-icon" />,
      description: "Advanced speech-to-text technology that accurately transcribes your voice input with minimal latency.",
      features: ["Real-time transcription", "Multi-language support", "Accent recognition"]
    },
    {
      name: "Gemini AI Flash 2.0",
      icon: <Sparkles className="tech-icon" />,
      description: "State-of-the-art content generation model that creates personalized educational material on demand.",
      features: ["Contextual responses", "Personalized content", "Multi-format generation"]
    },
    {
      name: "Amazon Polly",
      icon: <VolumeX className="tech-icon" />,
      description: "Lifelike speech synthesis that converts text to natural-sounding voice in multiple languages and accents.",
      features: ["Natural prosody", "Multiple voices", "Emotional tones"]
    }
  ];

  const faqs = [
    {
      question: "How do the AI voice agents work?",
      answer: "Our AI agents use advanced speech recognition and natural language processing to provide interactive, context-aware conversations tailored to your learning goals."
    },
    {
      question: "Can I practice different types of interviews?",
      answer: "Yes! We offer mock interviews across various industries, from tech and finance to healthcare and creative fields."
    },
    {
      question: "How is the language learning different?",
      answer: "Our AI agents provide real-time conversation practice, pronunciation feedback, and contextual learning across multiple languages."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use industry-standard encryption and privacy protocols to protect your personal information."
    },
    {
      question: "What AI technologies power the platform?",
      answer: "We utilize Assembly AI for speech-to-text conversion, Gemini AI Flash 2.0 for intelligent content generation, and Amazon Polly for natural-sounding voice responses."
    }
  ];

  const testimonials = [
    {
      quote: "This AI learning platform transformed my interview skills. After just a month of practice, I landed my dream job in tech!",
      author: "Jishan Ali",
      role: "Software Engineer",
      avatar: "/placeholder.svg"
    },
    {
      quote: "The AI voice agents sound incredibly natural. I use it daily to practice my Spanish - my conversation skills have improved dramatically.",
      author: "Deep Ghosal",
      role: "Graduate Student",
      avatar: "/placeholder.svg"
    },
    {
      quote: "As a teacher, I recommend this to all my students. The personalized learning paths and instant feedback are game-changers in education.",
      author: "Dr. Soumya sen",
      role: "University Professor",
      avatar: "/placeholder.svg"
    },
    {
      quote: "The mock interviews were crucial for my confidence. I practiced technical scenarios I'd never encountered before and felt prepared for anything.",
      author: "Wazib Ansar",
      role: "Data Scientist",
      avatar: "/placeholder.svg"
    }
  ];

  const subjectAreas = [
    { name: "Artificial Intelligence", icon: <Brain className="w-10 h-10 text-primary" /> },
    { name: "Data Science", icon: <LineChart className="w-10 h-10 text-primary" /> },
    { name: "Web Development", icon: <Code className="w-10 h-10 text-primary" /> },
    { name: "Java Development", icon: <Coffee className="w-10 h-10 text-primary" /> },
    { name: "Creative Arts", icon: <PaintBucket className="w-10 h-10 text-primary" /> },
    { name: "Economics", icon: <LineChart className="w-10 h-10 text-primary" /> },
    { name: "Cloud Computing", icon: <Cloud className="w-10 h-10 text-primary" /> },
    { name: "Backend Services", icon: <Server className="w-10 h-10 text-primary" /> },
    { name: "Literature", icon: <BookText className="w-10 h-10 text-primary" /> }
  ];

  const teamMembers = [
    {
      name: "Syed Tarifuddin Ahmed",
      role: "Founder & AI Research Lead",
      bio: "Fullstack developer , AI enthusiast ,expertise in Machine Learning,Ai Automation and NLP technologies.",
      avatar: "/placeholder.svg"
    },
    {
      name: "Koulik Jana",
      role: "Chief Technology Officer",
      bio: "Led engineering teams at PannaLabs LLC, specializing in speech synthesis and voice AI.",
      avatar: "/placeholder.svg"
    },
    
  ];

  return (
    <div className="min-h-screen flex flex-col">
     <header className="fixed top-0 w-full border-b nav-blur z-50">
  <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
    <Link href="/" className="text-2xl font-bold text-white">
      Future<span className="text-primary">Prep</span>
    </Link>
    
    <div className="flex items-center space-x-4">
      <Link href="/dashboard">
        <Button
          variant="default" 
          className="hidden md:inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-300 violet-glow"
        >
          Dashboard
        </Button>
        <Button 
          variant="default" 
          size="icon"
          className="md:hidden w-10 h-10 p-0 bg-primary hover:bg-primary/90 text-primary-foreground violet-glow"
        >
          <span className="sr-only">Dashboard</span>
        </Button>
      </Link>
      <UserButton 
        appearance={{
          elements: {
            userButtonAvatarBox: "w-9 h-9",
            userButtonOuter: "text-white"
          }
        }}
      />
    </div>
  </nav>
</header>

      <section className="w-full pt-36 md:pt-44 pb-20 bg-gradient-to-b from-accent/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-5"></div>
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center relative z-10">
          <div className="space-y-6 animate-fade-in md:w-3/5">
            <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl gradient-title leading-tight mb-6 animate-pulse-glow">
              Your AI-Powered Learning Companion
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Transform your learning experience with AI voice agents. 
              Mock interviews, language practice, and personalized education.
            </p>
            <div className="flex space-x-4 mt-8">
            <Link href="/dashboard">
  <Button
    size="lg"
    className="px-8 bg-violet-gradient text-white font-medium hover:bg-violet-dark-gradient transition-all duration-300 hover:shadow-[0_0_15px_rgba(139,92,246,0.7)] hover:scale-[1.02] group"
  >
    Start Learning
    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
  </Button>
</Link>
              <Link href="/demo">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 border-primary/50 hover:bg-primary/20 hover:text-white transition-colors duration-300"
                >
                  Watch Demo
                </Button>
              </Link>
            </div>
            <div className="mt-16 py-4 neo-glass max-w-2xl">
              <h3 ref={typingRef} className="typing-text text-lg md:text-xl text-white">
                Powered by advanced AI voice technologies
              </h3>
            </div>
           </div>
          
           <div className="md:w-2/5 mt-12 md:mt-0 flex justify-center items-center">
  <div className="w-full max-w-md neo-glass p-4 rounded-xl overflow-hidden animate-on-scroll bg-[#2b1e52]/90 backdrop-blur-md border border-primary/30">
    <div className="flex items-center border-b border-primary/30 pb-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-[#3d2a6c] flex items-center justify-center mr-3">
        <Bot className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-medium text-white">FuturePrep</h3>
        <p className="text-xs text-muted-foreground">Always online</p>
      </div>
      <div className="ml-auto flex gap-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
      </div>
    </div>
    
    <div 
      ref={chatContainerRef}
      className="h-72 overflow-y-auto px-2 mb-3 flex flex-col space-y-3 custom-scrollbar"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
        >
          {!message.isUser && (
            <div className="w-8 h-8 rounded-full bg-[#3d2a6c] flex items-center justify-center mr-2 flex-shrink-0">
              <Bot className="h-4 w-4 text-primary" />
            </div>
          )}
          <div
            className={`max-w-[80%] rounded-xl py-2 px-4 ${
              message.isUser
                ? 'bg-primary text-white rounded-tr-none'
                : 'bg-[#221640] text-foreground rounded-tl-none'
            }`}
          >
            <p className="text-sm">{message.text}</p>
            <p className="text-[10px] opacity-70 text-right mt-1">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          {message.isUser && (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-2 flex-shrink-0">
              <p className="text-sm font-bold text-white">You</p>
            </div>
          )}
        </div>
      ))}
      
      {isTyping && (
        <div className="flex justify-start">
          <div className="w-8 h-8 rounded-full bg-[#3d2a6c] flex items-center justify-center mr-2 flex-shrink-0">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div className="bg-[#221640] text-foreground rounded-xl rounded-tl-none py-2 px-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary/70 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-primary/70 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-primary/70 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
    
    <div className="flex items-center gap-2">
      <Input
        type="text" 
        placeholder="Ask me anything..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        className="bg-[#171530] border-primary/30 text-sm focus-visible:ring-primary text-white placeholder:text-gray-400"
      />
      <Button 
        size="icon"
        onClick={handleSendMessage}
        className="bg-[#8b5cf6] hover:bg-[#7c3aed] h-10 w-10"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
    
    <div className="mt-3 pt-2 border-t border-primary/20 text-center">
      <p className="text-xs text-muted-foreground">
        Powered by <span className="text-primary">FuturePrep</span> • Try voice commands
      </p>
    </div>
  </div>
</div>
        </div>
      </section>

      <section className="w-full py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 gradient-title animate-on-scroll">
            Powerful Learning Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border border-primary/20 bg-card card-hover animate-on-scroll glow-effect"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="pt-6 text-center flex flex-col items-center">
                  <div className="feature-icon-container mb-6 animate-pulse-glow">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-20 bg-background" ref={techSectionRef}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6 gradient-title animate-on-scroll">
            Cutting-Edge AI Technologies
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-16 animate-on-scroll">
            Our platform leverages the most advanced AI technologies to provide you with a seamless and effective learning experience.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aiTechnologies.map((tech, index) => (
              <div 
                key={index} 
                className="tech-card animate-on-scroll"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="text-center mb-4 floating-element">
                  {tech.icon}
                  <h3 className="text-xl font-bold text-primary">{tech.name}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{tech.description}</p>
                <ul className="space-y-2">
                  {tech.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center animate-on-scroll">
          <Link href="/demo">
  <Button
    className="bg-violet-gradient text-white font-medium hover:bg-violet-dark-gradient transition-all duration-300 violet-glow hover:shadow-[0_0_35px_rgba(139,92,246,0.7)] hover:scale-[1.02] group"
  >
    Experience our AI in action
    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
  </Button>
</Link>
          </div>
        </div>
      </section>

      <section className="w-full py-20 bg-accent/5 overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6 gradient-title animate-on-scroll">
            What Our Users Say
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-16 animate-on-scroll">
            Discover how our AI-powered learning platform is transforming education and career preparation
          </p>
          
          <div className="relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full max-w-5xl mx-auto"
            >
              <CarouselContent className="p-2">
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="relative p-6 bg-card rounded-2xl border border-primary/20 h-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:-translate-y-1">
                      <div className="absolute -top-2 -left-2">
                        <Star className="h-6 w-6 text-primary fill-primary" />
                      </div>
                      <div className="mb-4 flex justify-center">
                        <Avatar className="h-14 w-14 border-2 border-primary">
                          <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                          <AvatarFallback className="bg-primary/20">{testimonial.author[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      <blockquote className="text-center mb-4">
                        <p className="text-muted-foreground italic">&ldquo;{testimonial.quote}&rdquo;</p>
                      </blockquote>
                      <div className="text-center">
                        <div className="font-semibold">{testimonial.author}</div>
                        <div className="text-sm text-primary">{testimonial.role}</div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-2 mt-6">
                <CarouselPrevious className="relative left-0 hover:bg-primary hover:text-white" />
                <CarouselNext className="relative right-0 hover:bg-primary hover:text-white" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      <section className="w-full py-16 bg-secondary/30 overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 gradient-title animate-on-scroll">
            Explore Subject Areas
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12 animate-on-scroll">
            Our AI voice agents are trained across a wide range of disciplines to help you master any subject
          </p>
          
          <div className="flex animate-scroll overflow-hidden py-8">
            <div className="flex space-x-12 animate-scroll-infinite">
              {[...subjectAreas, ...subjectAreas].map((subject, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center space-y-3 min-w-[150px] hover:scale-110 transition-transform duration-300"
                >
                  <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all duration-300">
                    {subject.icon}
                  </div>
                  <span className="text-sm font-medium text-center">{subject.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-20">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-16 gradient-title animate-on-scroll">
      Your Learning Journey
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {howItWorks.map((item, index) => (
        <div 
          key={index} 
          className="flex flex-col items-center text-center space-y-4 animate-on-scroll"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group transition-all duration-300 hover:bg-primary/30 glow-effect">
              <div className="animate-float relative z-10">
                {React.cloneElement(item.icon, {
                  className: "w-8 h-8 text-primary group-hover:text-white transition-colors duration-300"
                })}
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <h3 className="font-semibold text-xl">{item.title}</h3>
          <p className="text-muted-foreground">{item.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>

      <section className="w-full py-20 bg-secondary/50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2 animate-on-scroll">
              <h2 className="text-3xl font-bold mb-6 gradient-title">
                About KnowledgeVibe
              </h2>
              <p className="text-muted-foreground mb-6">
                Founded in 2025, KnowledgeVibe is revolutionizing education through AI-powered voice technology. 
                Our mission is to make high-quality, personalized learning accessible to everyone.
              </p>
              <p className="text-muted-foreground mb-6">
                We combine cutting-edge speech recognition, natural language processing, and voice synthesis 
                to create immersive learning experiences that adapt to your unique needs and goals.
              </p>
              <p className="text-muted-foreground">
                Our team of AI researchers, educators, and technologists are dedicated to pushing the boundaries 
                of what's possible in educational technology, creating tools that inspire curiosity and foster growth.
              </p>
            </div>
            
            <div className="md:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamMembers.map((member, index) => (
                <Card 
                  key={index} 
                  className="border border-primary/20 bg-card shadow-lg animate-on-scroll"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center mb-4">
                      <Avatar className="h-20 w-20 mb-4 border-2 border-primary">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-primary/20">{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-lg text-center">{member.name}</h3>
                      <p className="text-sm text-primary text-center">{member.role}</p>
                    </div>
                    <p className="text-muted-foreground text-sm text-center">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 gradient-title animate-on-scroll">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto bg-card rounded-xl p-6 border border-primary/10 shadow-lg animate-on-scroll">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-primary/10 py-2">
                  <AccordionTrigger className="text-lg font-medium hover:text-primary transition-colors">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section className="w-full py-16">
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl p-12 text-center overflow-hidden">
            <div className="absolute inset-0 cta-gradient animate-pulse-glow opacity-90"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4 text-white text-shadow animate-on-scroll">
                Ready to Revolutionize Your Learning?
              </h2>
              <p className="text-xl mb-8 text-white/90 animate-on-scroll">
                Join thousands of learners transforming their skills with AI
              </p>
              <Link href="/dashboard">
  <Button 
    size="lg" 
    className="bg-violet-gradient text-white font-medium hover:bg-violet-dark-gradient transition-all duration-300 hover:shadow-[0_0_35px_rgba(139,92,246,0.7)] hover:scale-[1.02] group"
  >
    Get Started Now 
    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
  </Button>
</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full py-16 border-t border-border/30 mt-auto bg-secondary/80">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Future<span className="text-primary">Prep</span></h3>
              <p className="text-muted-foreground">
                Transforming learning through AI-powered voice technology. 
                Experience education reimagined for the digital age.
              </p>
              <div className="flex space-x-4 pt-2">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Features</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">AI Interviews</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Language Learning</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Q&A Sessions</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Topic Lectures</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">API Access</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Community</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Contact Us</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>rafiuddin.tarif@gmail.com</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Heart className="h-4 w-4 text-primary" />
                  <span>Made with AI in San Francisco</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 KnowledgeVibe AI. All rights reserved.
            </div>
            
            <div className="flex space-x-6">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;