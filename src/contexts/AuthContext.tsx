import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { getUserProfile, signInWithEmail, signOutUser, signUpWithEmail, updateUserProfile } from '../services/auth';
import type { AuthContextType, FirebaseUserProfile } from '../types/firebase';

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    // Check if we're in demo mode
    const isDemoMode = import.meta.env['VITE_FIREBASE_API_KEY'] === 'demo-api-key' || !import.meta.env['VITE_FIREBASE_API_KEY'];
    
    if (isDemoMode) {
      console.warn('Running in demo mode - Firebase authentication disabled');
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore
          const userProfile = await getUserProfile(firebaseUser.uid);
          setUser(userProfile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<void> => {
    const isDemoMode = import.meta.env['VITE_FIREBASE_API_KEY'] === 'demo-api-key' || !import.meta.env['VITE_FIREBASE_API_KEY'];
    
    if (isDemoMode) {
      console.warn('Demo mode: Simulating sign in');
      // Simulate successful sign in with demo user
      const demoUser = {
        id: 'demo-user',
        email: email,
        name: 'Demo User',
        profilePicture: '',
        travelPreferences: {
          destinations: ['Paris', 'Tokyo'],
          budgetRange: { min: 500, max: 2000, currency: 'USD' },
          groupSizePreference: 'medium' as const,
          travelStyle: 'relaxed' as const,
          interests: ['culture', 'food']
        },
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
        isVerified: true,
        lastLoginAt: new Date() as any,
      };
      setUser(demoUser);
      return;
    }

    try {
      await signInWithEmail(email, password);
    } catch (error: any) {
      throw new Error(`Sign in failed: ${error.message}`);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData: Partial<FirebaseUserProfile>): Promise<void> => {
    try {
      await signUpWithEmail(email, password, userData);
    } catch (error: any) {
      throw new Error(`Sign up failed: ${error.message}`);
    }
  };


  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      await signOutUser();
      setUser(null);
      setFirebaseUser(null);
    } catch (error: any) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<FirebaseUserProfile>): Promise<void> => {
    if (!firebaseUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      await updateUserProfile(firebaseUser.uid, updates);
      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error: any) {
      throw new Error(`Profile update failed: ${error.message}`);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
