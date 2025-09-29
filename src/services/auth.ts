import {
  createUserWithEmailAndPassword,
  type User as FirebaseUser,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { FirebaseUserProfile } from '../types/firebase';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<void> => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    throw new Error(`Sign in failed: ${error.message}`);
  }
};

// Sign up with email and password
export const signUpWithEmail = async (
  email: string,
  password: string,
  userData: Partial<FirebaseUserProfile>
): Promise<void> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update Firebase Auth profile
    await updateProfile(user, {
      displayName: userData.name || null,
    });

    // Create user profile in Firestore
    const userProfile: FirebaseUserProfile = {
      id: user.uid,
      email: user.email!,
      name: userData.name || '',
      profilePicture: userData.profilePicture || '',
      travelPreferences: userData.travelPreferences || {
        destinations: [],
        budgetRange: { min: 0, max: 1000, currency: 'USD' },
        groupSizePreference: 'medium',
        travelStyle: 'relaxed',
        interests: [],
      },
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
      isVerified: false,
      lastLoginAt: new Date() as any,
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
  } catch (error: any) {
    throw new Error(`Sign up failed: ${error.message}`);
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<void> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user profile exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create user profile for new Google users
      const userProfile: FirebaseUserProfile = {
        id: user.uid,
        email: user.email!,
        name: user.displayName || '',
        profilePicture: user.photoURL || '',
        travelPreferences: {
          destinations: [],
          budgetRange: { min: 0, max: 1000, currency: 'USD' },
          groupSizePreference: 'medium',
          travelStyle: 'relaxed',
          interests: [],
        },
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
        isVerified: true,
        lastLoginAt: new Date() as any,
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
    } else {
      // Update last login time
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: new Date(),
      });
    }
  } catch (error: any) {
    throw new Error(`Google sign in failed: ${error.message}`);
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(`Sign out failed: ${error.message}`);
  }
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<FirebaseUserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as FirebaseUserProfile;
    }
    return null;
  } catch (error: any) {
    throw new Error(`Failed to get user profile: ${error.message}`);
  }
};

// Update user profile
export const updateUserProfile = async (uid: string, updates: Partial<FirebaseUserProfile>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(`Password reset failed: ${error.message}`);
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};
