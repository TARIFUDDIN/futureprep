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

function Credits() {
    const { userData } = useContext(UserContext);
    const user = useUser();
    const [loading, setLoading] = useState(false);
    const updateUserOrder = useMutation(api.users.UpdateUserToken);
    
    const CalculateProgress = () => {
        const credits = Number(userData?.credit || 0);
        
        if (userData?.subscriptionId) {
          return (credits / 50000) * 100;
        } else {
          return (credits / 5000) * 100;
        }
    }
    
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => console.log(true);
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
                      if (!userData?._id) {
                          console.error("User ID not found");
                          return;
                      }
                      
                      const currentCredit = Number(userData?.credit || 0);
                      const newCredit = currentCredit + 50000;
                      
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
          
          console.log("User Data Full:", userData);
          console.log("Subscription ID to cancel:", userData?.subscriptionId);
          console.log("Order ID:", user?.orderId);

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
              
              await updateUserOrder({
                  id: userData._id,
                  subscriptionId: null,
                  credit: 5000
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
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg space-y-4">
            {/* User Profile Section */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg">
                <Image 
                    src={user?.profileImageUrl} 
                    width={50} 
                    height={50} 
                    className="rounded-full border-2 border-white"
                    alt="User Profile"
                />
                <div className="space-y-1">
                    <h2 className="text-lg font-bold">{user?.displayName}</h2>
                    <p className="text-sm text-blue-100">{user?.primaryEmail}</p>
                </div>
            </div>

            {/* Token Usage Section */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Token Usage</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {userData?.credit || 0}/{userData?.subscriptionId ? '50,000' : '5,000'}
                </p>
                <Progress 
                    value={CalculateProgress()} 
                    className="w-full mb-3"
                />

                <div className="flex justify-between items-center">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200">Current Plan</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        userData?.subscriptionId 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                        {userData?.subscriptionId ? 'Pro Plan' : 'Free Plan'}
                    </span>
                </div>
            </div>

            {/* Upgrade/Cancel Section */}
            {!userData?.subscriptionId ? (
                <div className='bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-5 border border-purple-200 dark:border-purple-700 rounded-xl'>
                    <div className='flex justify-between items-start mb-4'>
                        <div>
                            <h4 className='font-bold text-lg text-gray-800 dark:text-gray-200'>Pro Plan</h4>
                            <p className='text-gray-600 dark:text-gray-400'>50,000 Tokens</p>
                        </div>
                        <div className='text-right'>
                            <h4 className='font-bold text-xl text-purple-600 dark:text-purple-400'>$10</h4>
                            <p className='text-sm text-gray-500 dark:text-gray-400'>/Month</p>
                        </div>
                    </div>
                    <hr className='my-3 border-purple-200 dark:border-purple-700' />
                    <Button 
                        className='w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium' 
                        disabled={loading} 
                        onClick={GenerateSubscriptionId}
                    >
                        {loading ? (
                            <Loader2Icon className='animate-spin mr-2' />
                        ) : (
                            <Wallet2 className='mr-2' />
                        )} 
                        Upgrade to Pro
                    </Button>
                </div>
            ) : (
                <Button 
                    variant="destructive" 
                    className='w-full' 
                    disabled={loading}
                    onClick={cancelSubscription}
                >
                    {loading ? <Loader2Icon className='animate-spin mr-2' /> : null}
                    Cancel Subscription
                </Button>
            )}
        </div>
    );
}

export default Credits;