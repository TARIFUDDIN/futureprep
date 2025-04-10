import React, { useState, useRef, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { AIModelToGenerateFeedbackAndNotes } from '@/services/GlobalServices';
import { useMutation } from 'convex/react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { LoaderCircle, Send } from 'lucide-react';
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

      toast.success('Feedback/Notes Saved!', {
        style: {
          background: '#2C3E50',
          color: '#E0E0E0',
          border: '1px solid #FFD700'
        }
      });
    } catch(e) {
      console.error('Error generating feedback:', e);
      toast.error('Internal server error. Please try again.', {
        style: {
          background: '#2C3E50',
          color: '#E0E0E0',
          border: '1px solid #FF6B6B'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1E2430] rounded-xl overflow-hidden shadow-lg">
      <div className='h-[60vh] bg-[#121212] rounded-t-xl flex flex-col relative p-6 overflow-auto custom-scrollbar'>
        {conversation && conversation.length > 0 ? (
          <div className="flex flex-col space-y-4">
            {conversation.map((item, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex max-w-[85%]", 
                  item.role === 'user' ? 'justify-end ml-auto' : 'justify-start mr-auto'
                )}
              >
                <div
                  className={cn(
                    "p-4 rounded-2xl text-sm shadow-md transition-all duration-300 ease-in-out",
                    item.role === 'assistant'
                      ? 'bg-gradient-to-br from-[#2C3E50] to-[#34495E] text-gray-200 rounded-bl-none'
                      : 'bg-gradient-to-br from-[#3498DB] to-[#2980B9] text-white rounded-br-none'
                  )}
                >
                  {item.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 text-sm">No conversation yet. Start by saying hello!</p>
          </div>
        )}
      </div>

      {!enableFeedbackNotes ? (
        <div className="p-4 bg-[#1E2430] text-center">
          <p className="text-gray-400 text-xs">
            At the end of your conversation, we will automatically generate feedback/notes
          </p>
        </div>
      ) : (
        <div className="p-4 bg-[#1E2430]">
          <Button
            onClick={GenerateFeedbackNotes}
            disabled={loading || (userData?.credit ?? 0) <= 0}
            className='w-full flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-600 text-black'
          >
            {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            Generate Feedback/Notes
          </Button>
        </div>
      )}
    </div>
  );
}

export default ChatBox