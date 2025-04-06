"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";
import UserAvatar from './user-avatar';
import { User } from '@supabase/supabase-js';

interface AuthWrapperProps {
  className?: string;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ className }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        // Get user
        const { data } = await supabase.auth.getUser();
        
        if (data?.user) {
          setUser(data.user);
          
          // Fetch user's name from the User table
          const { data: userData, error } = await supabase
            .from('User')
            .select('name')
            .eq('id', data.user.id)
            .single();
          
          if (!error && userData) {
            setUserName(userData.name);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }

    // Get initial user
    getUser();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        
        // Fetch user's name from the User table
        const { data: userData, error } = await supabase
          .from('User')
          .select('name')
          .eq('id', session.user.id)
          .single();
        
        if (!error && userData) {
          setUserName(userData.name);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserName(undefined);
      }
    });

    return () => {
      // Clean up the subscription when component unmounts
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return <div className={className}></div>; // Empty div while loading
  }

  if (user) {
    return <UserAvatar user={user} userName={userName} />;
  }

  return (
    <a
      href="#"
      className={`login-btn-one ${className || ''}`}
      data-bs-toggle="modal"
      data-bs-target="#loginModal"
    >
      Login
    </a>
  );
};

export default AuthWrapper; 