"use client"

import { api } from '@/convex/_generated/api';
import { useUser } from '@stackframe/stack'
import { useMutation } from 'convex/react';
import React, { useEffect, useState } from 'react'
import { UserContext } from './_context/UserContext';

function AuthProvider({ children }) {
    const user = useUser();
    const CreateUser = useMutation(api.users.CreateUser);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('User from Stack:', user);
        if (user) {
            CreateNewUser();
        } else {
            setIsLoading(false);
        }
    }, [user])

    const CreateNewUser = async () => {
        try {
            setIsLoading(true);
            
            // Debug log to see what data we're sending
            console.log('Creating user with data:', {
                name: user?.displayName,
                email: user?.primaryEmail
            });

            const result = await CreateUser({
                name: user?.displayName || 'Unknown User', // Provide fallback
                email: user?.primaryEmail || user?.email || '' // Try different email fields
            });
            
            console.log('User creation result:', result);
            setUserData(result);
        } catch (error) {
            console.error('Error creating user:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <UserContext.Provider value={{ userData, setUserData, isLoading }}>
                {children}
            </UserContext.Provider>
        </div>
    )
}

export default AuthProvider