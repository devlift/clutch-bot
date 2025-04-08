"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  employerId: string | null;
  candidateId: string | null;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [candidateId, setCandidateId] = useState<string | null>(null);

  // Function to fetch employer and candidate IDs for the current user
  const fetchUserRelatedData = async (userId: string) => {
    try {
      // Check if user is an employer
      const { data: employerData } = await supabase
        .from('Employer')
        .select('id')
        .eq('userId', userId)
        .single();
      
      if (employerData) {
        setEmployerId(employerData.id);
      } else {
        setEmployerId(null);
      }

      // Check if user is a candidate
      const { data: candidateData } = await supabase
        .from('Candidate')
        .select('id')
        .eq('userId', userId)
        .single();
      
      if (candidateData) {
        setCandidateId(candidateData.id);
      } else {
        setCandidateId(null);
      }
    } catch (error) {
      console.error('Error fetching user related data:', error);
    }
  };

  // Function to refresh user data on demand
  const refreshUserData = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        await fetchUserRelatedData(data.session.user.id);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setEmployerId(null);
    setCandidateId(null);
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        // Get initial session
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);

        // If user exists, fetch related data
        if (data.session?.user) {
          await fetchUserRelatedData(data.session.user.id);
        }

        // Set up auth state change listener
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          setSession(newSession);
          setUser(newSession?.user || null);

          if (event === 'SIGNED_IN' && newSession?.user) {
            await fetchUserRelatedData(newSession.user.id);
          } else if (event === 'SIGNED_OUT') {
            setEmployerId(null);
            setCandidateId(null);
          }
        });

        // Cleanup function
        return () => {
          if (authListener && authListener.subscription) {
            authListener.subscription.unsubscribe();
          }
        };
      } catch (error) {
        console.error('Error in auth initialization:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const value = {
    user,
    session,
    loading,
    employerId,
    candidateId,
    signOut,
    refreshUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 