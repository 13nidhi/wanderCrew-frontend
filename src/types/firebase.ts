import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

// Firebase User Profile Interface
export interface FirebaseUserProfile {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly profilePicture?: string;
  readonly travelPreferences: TravelPreferences;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly isVerified: boolean;
  readonly lastLoginAt: Timestamp;
}

// Travel Preferences Interface
export interface TravelPreferences {
  readonly destinations: string[];
  readonly budgetRange: {
    readonly min: number;
    readonly max: number;
    readonly currency: string;
  };
  readonly groupSizePreference: 'small' | 'medium' | 'large';
  readonly travelStyle: 'adventure' | 'relaxed' | 'cultural' | 'budget';
  readonly interests: string[];
}

// Trip Interface for Firestore
export interface FirebaseTrip {
  readonly id: string;
  readonly title: string;
  readonly destination: string;
  readonly description: string;
  readonly startDate: Timestamp;
  readonly endDate: Timestamp;
  readonly budget: {
    readonly min: number;
    readonly max: number;
    readonly currency: string;
  };
  readonly maxMembers: number;
  readonly status: 'open' | 'full' | 'completed' | 'cancelled';
  readonly createdBy: string;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly members: FirebaseTripMember[];
  readonly tags: string[];
  readonly image?: string;
  readonly location: {
    readonly latitude: number;
    readonly longitude: number;
    readonly address: string;
  };
}

// Trip Member Interface
export interface FirebaseTripMember {
  readonly userId: string;
  readonly name: string;
  readonly email: string;
  readonly profilePicture?: string;
  readonly joinedAt: Timestamp;
  readonly role: 'organizer' | 'member';
}

// Message Interface for Chat
export interface FirebaseMessage {
  readonly id: string;
  readonly tripId: string;
  readonly senderId: string;
  readonly senderName: string;
  readonly content: string;
  readonly timestamp: Timestamp;
  readonly type: 'text' | 'image' | 'file';
  readonly attachments?: string[];
}

// Authentication Context Interface
export interface AuthContextType {
  readonly user: FirebaseUserProfile | null;
  readonly firebaseUser: FirebaseUser | null;
  readonly isLoading: boolean;
  readonly signIn: (email: string, password: string) => Promise<void>;
  readonly signUp: (email: string, password: string, userData: Partial<FirebaseUserProfile>) => Promise<void>;
  readonly signOut: () => Promise<void>;
  readonly updateProfile: (updates: Partial<FirebaseUserProfile>) => Promise<void>;
}

// Error Interface
export interface FirebaseError {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
}

// Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  TRIPS: 'trips',
  MESSAGES: 'messages',
  REVIEWS: 'reviews',
} as const;

// Document References
export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];
