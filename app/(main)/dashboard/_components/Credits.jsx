import { UserContext } from '@/app/_context/UserContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api } from '@/convex/_generated/api';
import { useUser } from '@stackframe/stack';
import axios from 'axios';
import { useMutation } from 'convex/react';
import { Loader2Icon, Wallet2 } from 'lucide-react';
import Image from 'next/image';
import React, { useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
 // Make sure you have this import

function Credits() {
    const { userData } = useContext(UserContext);
    const user = useUser();
    const [loading, setLoading] = useState(false);
    const updateUserOrder = useMutation(api.users.UpdateUserToken);
    
    const CalculateProgress = () => {
        // Make sure credits exists and is a number
        const credits = Number(userData?.credit || 0);
        
        if (userData?.subscriptionId) {
          // For paid plan (50,000 tokens)
          return (credits / 50000) * 100;
        } else {
          // For free plan (5,000 tokens)
          return (credits / 5000) * 100;
        }
    }
    
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => console.log(true); // Ensure script is loaded
        document.body.appendChild(script);
    
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    
    const GenerateSubscriptionId = async () => {
        setLoading(true);
        try {
            const result = await axios.post('/api/create-subscription');
            console.log(result.data);
            if (result?.data?.id) {
                MakePayment(result.data.id);
            } else {
                console.error("No subscription ID received");
            }
        } catch (error) {
            console.error("Error generating subscription:", error);
        } finally {
            setLoading(false);
        }
    };
    
    const MakePayment = (subscriptionId) => {
        // Make sure subscriptionId is defined
        if (!subscriptionId) {
            console.error("No subscription ID provided");
            return;
        }
        
        let options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_LIVE_KEY,
            subscription_id: subscriptionId,
            name: "FuturePrep AI Assistant App",
            description: '',
            image: '/logo.jpg',
            handler: async function(resp) {
              console.log(resp.razorpay_payment_id);
              console.log(resp);
              
              if (resp?.razorpay_payment_id) {
                  try {
                      // Make sure you have a valid ID and current credit value
                      if (!userData?._id) {
                          console.error("User ID not found");
                          return;
                      }
                      
                      // Calculate new credit amount
                      const currentCredit = Number(userData?.credit || 0);
                      const newCredit = currentCredit + 50000; // Add 50k tokens
                      
                      // Call the mutation with the correct parameters
                      await updateUserOrder({
                          id: userData._id,
                          credit: newCredit,
                          orderId: resp.razorpay_subscription_id,
                      });
                      
                      toast('Thank you! Credits added');
                  } catch (error) {
                      console.error("Error updating user tokens:", error);
                      toast.error('Failed to update credits');
                  }
              }
            },
            "prefill": {
                name: user?.displayName,
                email: user?.primaryEmail
            },
            notes: {},
            theme: {
                color: '#000000'
            }
        };
        
        const rzp = new window.Razorpay(options);
        rzp.open();
    };
  

    const cancelSubscription = async () => {
      try {
          setLoading(true);
          
          // Log the actual subscription details
          console.log("User Data Full:", userData);
          console.log("Subscription ID to cancel:", userData?.subscriptionId);
          console.log("Order ID:", user?.orderId);
  
          // Prefer subscriptionId from userData, fall back to orderId if needed
          const subIdToCancel = userData?.subscriptionId || user?.orderId;
  
          if (!subIdToCancel) {
              toast.error('No active subscription found');
              return;
          }
  
          const result = await axios.post('/api/cancel-subscription', {
              subId: subIdToCancel
          });
          
          if (result.data.success) {
              toast.success('Subscription successfully canceled');
              
              // Update user data to remove subscription
              await updateUserOrder({
                  id: userData._id,
                  subscriptionId: null,
                  credit: 5000  // Reset to free plan credits
              });
              
              window.location.reload();
          } else {
              toast.error(result.data.error || 'Failed to cancel subscription');
          }
      } catch (error) {
          console.error("Full error details:", error.response?.data);
          toast.error(
              error.response?.data?.error?.description || 
              error.response?.data?.error || 
              'Error cancelling subscription'
          );
      } finally {
          setLoading(false);
      }
  }
    
    return (
        <div>
            <div className="flex items-center gap-3 p-4 bg-black text-white rounded-lg shadow-lg">
                <Image 
                    src={user?.profileImageUrl} 
                    width={50} 
                    height={50} 
                    className="rounded-full border border-gray-500"
                    alt="User Profile"
                />
                <div className="space-y-1">
                    <h2 className="text-lg font-bold">{user?.displayName}</h2>
                    <p className="text-sm text-gray-400">{user?.primaryEmail}</p>
                </div>
            </div>
            <hr className="my-3" />

            <div>
                <h4 className="text-sm font-semibold">Token Usage</h4>
                <p className="text-xs text-gray-400">
                    {userData?.credit || 0}/{userData?.subscriptionId ? '50,000' : '5,000'}
                </p>
                <progress 
                    value={CalculateProgress()} 
                    max="100"
                    className="w-full my-2 appearance-none [&::-webkit-progress-bar]:bg-green-700 [&::-webkit-progress-value]:bg-green-400 [&::-moz-progress-bar]:bg-green-400"
                />

                <div className="flex justify-between items-center">
                    <h4 className="font-bold">Current Plan</h4>
                    <h4 className="p-1 bg-secondary rounded-lg px-2">{userData?.subscriptionId ? 'Paid Plan' : 'Free Plan'}</h4>
                </div>
            </div>
            {!userData?.subscriptionId ? (
  <div className='mt-5 p-5 border rounded-2xl'>
    <div className='flex justify-between'>
      <div>
        <h4 className='font-bold'>Pro Plan</h4>
        <h4>50,000 Tokens</h4>
      </div>
      <h4 className='font-bold'>$10/Month</h4>
    </div>
    <hr className='my-3' />
    <Button className='w-full' disabled={loading} onClick={GenerateSubscriptionId}>
      {loading ? <Loader2Icon className='animate-spin' /> : <Wallet2 />} Upgrade $10
    </Button>
  </div>
) : (
  <Button className='mt-4 w-full' onClick={cancelSubscription}>Cancel Subscription</Button>
)}
        </div>
    );
}

export default Credits;