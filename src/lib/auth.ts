import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Set loading to true when the component mounts
    setAuthState((prev) => ({ ...prev, loading: true }));
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setAuthState({
          user: session?.user ?? null,
          session: session,
          loading: false,
        });
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session: session,
        loading: false,
      });
    }).catch(error => {
      console.error('Error getting session:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setAuthState(prev => ({ ...prev, loading: false }));
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { error: error.message };
    }
  };

  const signUp = async (email: string, password: string, userData?: { full_name?: string }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      setAuthState(prev => ({ ...prev, loading: false }));
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { error: error.message };
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const { error } = await supabase.auth.signOut();
      setAuthState(prev => ({ ...prev, loading: false }));
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { error: error.message };
    }
  };

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    signIn,
    signUp,
    signOut,
  };
}