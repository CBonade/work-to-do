import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Check if we're on localhost for development
const isLocalhost = () => {
  return window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname === '';
};

// Mock user for localhost development
const mockUser = {
  id: 'mock-user-id-123',
  email: 'dev@localhost.com',
  user_metadata: {
    full_name: 'Local Dev User',
    avatar_url: 'https://github.com/github.png'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLocalhost()) {
      // Mock authentication for localhost
      console.log('🔧 Development mode: Using mock authentication');
      setTimeout(() => {
        setUser(mockUser);
        setLoading(false);
      }, 500); // Simulate a brief loading time
      return;
    }

    // Real authentication for production
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGitHub = async () => {
    if (isLocalhost()) {
      // Mock sign in for localhost
      console.log('🔧 Development mode: Mock sign in');
      setUser(mockUser);
      return;
    }

    // Real GitHub OAuth for production
    const redirectUrl = process.env.NODE_ENV === 'production'
      ? `${window.location.origin}/work-to-do/`
      : window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: redirectUrl
      }
    });
    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (isLocalhost()) {
      // Mock sign out for localhost
      console.log('🔧 Development mode: Mock sign out');
      setUser(null);
      return;
    }

    // Real sign out for production
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGitHub,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};