// Main type definitions for WanderGroup application
// Following React/TypeScript best practices

// Re-export all types from other files for easy access
export * from './api';
export * from './components';

// User related types
export interface User {
  readonly id: string;
  email: string;
  name: string;
  profilePicture?: string;
  travelPreferences: TravelPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface TravelPreferences {
  destinations: string[];
  budgetRange: {
    readonly min: number;
    readonly max: number;
  };
  groupSizePreference: 'small' | 'medium' | 'large';
  travelStyle: 'adventure' | 'relaxed' | 'cultural' | 'budget';
}

// Trip related types
export interface Trip {
  readonly id: string;
  title: string;
  destination: string;
  description: string;
  startDate: Date;
  endDate: Date;
  budget: {
    readonly min: number;
    readonly max: number;
    currency: string;
  };
  maxGroupSize: number;
  currentGroupSize: number;
  status: TripStatus;
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  requirements: string[];
  itinerary?: Itinerary;
  members: TripMember[];
  joinRequests: string[]; // JoinRequest IDs
}

export type TripStatus = 'open' | 'full' | 'ongoing' | 'completed' | 'cancelled';

export interface TripMember {
  readonly userId: string;
  joinedAt: Date;
  role: 'admin' | 'member';
  status: 'active' | 'left' | 'removed';
}

export interface JoinRequest {
  readonly id: string;
  readonly tripId: string;
  readonly userId: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface TripFilters {
  destination?: string;
  startDate?: Date;
  endDate?: Date;
  budgetRange?: {
    readonly min: number;
    readonly max: number;
  };
  maxGroupSize?: number;
  tags?: string[];
  status?: TripStatus[];
}

// Itinerary related types
export interface Itinerary {
  readonly id: string;
  readonly tripId: string;
  generatedAt: Date;
  lastModified: Date;
  days: ItineraryDay[];
  totalEstimatedBudget: number;
  accommodationSuggestions: AccommodationSuggestion[];
  transportationTips: string[];
  packingTips: string[];
  localTips: string[];
  status: 'draft' | 'published' | 'finalized';
  version: number;
}

export interface ItineraryDay {
  readonly day: number;
  date: Date;
  activities: ItineraryItem[];
  totalEstimatedCost: number;
  notes?: string;
}

export interface ItineraryItem {
  readonly id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  coordinates?: {
    readonly latitude: number;
    readonly longitude: number;
  };
  estimatedCost: number;
  duration: string;
  category: ItineraryCategory;
  votes: VoteData;
  status: 'suggested' | 'approved' | 'rejected' | 'modified';
  alternatives?: ItineraryItem[];
  lastModified: Date;
}

export type ItineraryCategory = 
  | 'sightseeing' 
  | 'food' 
  | 'transport' 
  | 'accommodation' 
  | 'entertainment';

export interface VoteData {
  upvotes: number;
  downvotes: number;
  userVotes: Record<string, 'up' | 'down'>;
}

export interface AccommodationSuggestion {
  name: string;
  type: 'hotel' | 'hostel' | 'airbnb' | 'guesthouse';
  priceRange: string;
  location: string;
  amenities: string[];
  rating?: number;
}

// Chat related types
export interface ChatMessage {
  readonly id: string;
  readonly tripId: string;
  readonly senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  readBy: string[]; // User IDs who have read this message
  reactions: Record<string, string[]>; // emoji -> array of user IDs
  replyTo?: string; // Message ID this is replying to
  edited?: boolean;
  editedAt?: Date;
}

export type MessageType = 'text' | 'image' | 'location' | 'system';

export interface TypingIndicator {
  readonly userId: string;
  userName: string;
  timestamp: Date;
}

// Rating related types
export interface UserRating {
  readonly id: string;
  readonly tripId: string;
  readonly raterId: string; // Person giving the rating
  readonly rateeId: string; // Person being rated
  ratings: {
    reliability: number; // 1-5 stars
    friendliness: number; // 1-5 stars
    organization: number; // 1-5 stars (for trip organizers)
    communication: number; // 1-5 stars
  };
  overallRating: number; // Average of individual ratings
  review?: string;
  isAnonymous: boolean;
  createdAt: Date;
  tripTitle: string;
}

export interface TripRating {
  readonly id: string;
  readonly tripId: string;
  readonly userId: string;
  ratings: {
    overallExperience: number;
    itineraryQuality: number;
    groupDynamics: number;
    valueForMoney: number;
  };
  overallRating: number;
  review?: string;
  wouldRecommend: boolean;
  createdAt: Date;
}

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Environment types
export interface EnvironmentConfig {
  readonly NODE_ENV: 'development' | 'production' | 'test';
  readonly VITE_APP_NAME: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_OPENAI_API_KEY?: string;
}