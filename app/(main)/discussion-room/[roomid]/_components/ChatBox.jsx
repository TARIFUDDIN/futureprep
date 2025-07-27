import React, { useState, useRef, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { AIModelToGenerateFeedbackAndNotes } from '@/services/GlobalServices';
import { useMutation } from 'convex/react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { 
  LoaderCircle, 
  Send, 
  Bot, 
  User, 
  MessageSquare, 
  Sparkles,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Lightbulb,
  Target
} from 'lucide-react';
import { UserContext } from '@/app/_context/UserContext';
import { cn } from '@/lib/utils';

function ChatBox({ conversation, enableFeedbackNotes, coachingOption }) {
  const [loading, setLoading] = useState(false);
  const updateSummery = useMutation(api.DiscussionRoom.UpdateSummery);
  const { roomid } = useParams();
  const messagesEndRef = useRef(null);
  const { userData } = useContext(UserContext);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const GenerateFeedbackNotes = async () => {
    setLoading(true);
    try {
      const result = await AIModelToGenerateFeedbackAndNotes(coachingOption, conversation);

      await updateSummery({
        id: roomid,
        summery: result.content
      });

      toast.success('Feedback generated successfully!', {
        description: 'Your personalized insights are ready to view',
        className: 'bg-green-50 border-green-200'
      });
    } catch(e) {
      console.error('Error generating feedback:', e);
      toast.error('Failed to generate feedback', {
        description: 'Please try again in a moment',
        className: 'bg-red-50 border-red-200'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter out system messages for display
  const displayConversation = conversation.filter(item => item.role !== 'system');

  // Calculate conversation stats
  const userMessages = displayConversation.filter(item => item.role === 'user').length;
  const aiMessages = displayConversation.filter(item => item.role === 'assistant').length;
  const totalMessages = userMessages + aiMessages;

  return (
    <div className="modern-card bg-white/95 backdrop-blur-md overflow-hidden">
      {/* Chat Header */}
      <div className="border-b border-slate-200 p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Learning Conversation</h3>
              <p className="text-sm text-slate-600">
                AI-powered coaching session
              </p>
            </div>
          </div>
          
          {/* Conversation Stats */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1 text-slate-600">
              <User className="w-4 h-4" />
              <span>{userMessages}</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-600">
              <Bot className="w-4 h-4" />
              <span>{aiMessages}</span>
            </div>
            <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
              {totalMessages} exchanges
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className='h-[50vh] bg-gradient-to-b from-slate-50/50 to-white overflow-auto custom-scrollbar p-6'>
        {displayConversation && displayConversation.length > 0 ? (
          <div className="space-y-6">
            {displayConversation.map((item, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex items-start space-x-4 animate-slide-up",
                  item.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Avatar */}
                <div className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md",
                  item.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                )}>
                  {item.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div className={cn(
                  "flex-1 max-w-[80%]",
                  item.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                )}>
                  <div className={cn(
                    "relative p-4 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md",
                    item.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-md'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
                  )}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </p>
                    
                    {/* Message timestamp */}
                    <div className={cn(
                      "flex items-center justify-end mt-2 text-xs opacity-70",
                      item.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                    )}>
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Message decoration */}
                    {item.role === 'assistant' && (
                      <div className="absolute -left-1 top-6 w-2 h-2 bg-emerald-500 rounded-full opacity-60" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900">Ready to Start Learning?</h3>
              <p className="text-slate-600 max-w-md">
                Your AI coach is waiting. Click the microphone button to begin your personalized learning session.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Section */}
      {!enableFeedbackNotes ? (
        <div className="border-t border-slate-200 p-6 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex items-center justify-center space-x-3">
            <div className="flex items-center space-x-2 text-indigo-600">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-medium">AI Analysis in Progress</span>
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <p className="text-sm text-slate-600">
              Continue your conversation for personalized feedback
            </p>
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-200 p-6 space-y-4">
          {/* Session Summary */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <MessageSquare className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-lg font-bold text-blue-600">{totalMessages}</span>
              </div>
              <span className="text-xs text-slate-600">Total Exchanges</span>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Target className="w-4 h-4 text-emerald-600 mr-1" />
                <span className="text-lg font-bold text-emerald-600">
                  {Math.min(Math.round(userMessages * 8.5), 10)}/10
                </span>
              </div>
              <span className="text-xs text-slate-600">Engagement Score</span>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="w-4 h-4 text-purple-600 mr-1" />
                <span className="text-lg font-bold text-purple-600">Ready</span>
              </div>
              <span className="text-xs text-slate-600">For Analysis</span>
            </div>
          </div>

          {/* Generate Feedback Button */}
          <Button
            onClick={GenerateFeedbackNotes}
            disabled={loading || (userData?.credit ?? 0) <= 0}
            className={cn(
              'w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300',
              loading 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'btn-gradient hover-lift hover:shadow-lg'
            )}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <LoaderCircle className="h-6 w-6 animate-spin" />
                <span>Generating Insights...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5" />
                  <span>Generate AI Feedback</span>
                </div>
                <div className="flex items-center space-x-1 text-sm opacity-80">
                  <Sparkles className="h-4 w-4" />
                  <span>Powered by AI</span>
                </div>
              </div>
            )}
          </Button>

          {/* Credit Warning */}
          {(userData?.credit ?? 0) <= 0 && (
            <div className="flex items-center justify-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-amber-700 font-medium">
                Insufficient credits. Please top up to generate feedback.
              </span>
            </div>
          )}

          {/* Tips Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 text-sm">Pro Tip</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your AI feedback will include personalized insights, improvement suggestions, 
                  and actionable recommendations based on your conversation patterns.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBox