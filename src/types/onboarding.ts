
// Onboarding Data Interface
export interface OnboardingData {
  readonly personalInfo: PersonalInfo;
  readonly travelPreferences: TravelPreferences;
  readonly profileSetup: ProfileSetup;
}

// Personal Information Interface
export interface PersonalInfo {
  readonly firstName: string;
  readonly lastName: string;
  readonly dateOfBirth?: Date;
  readonly phoneNumber?: string;
  readonly location?: UserLocation;
  readonly bio?: string;
}

// Travel Preferences Interface (Extended for onboarding)
export interface TravelPreferences {
  readonly destinations: string[];
  readonly budgetRange: {
    readonly min: number;
    readonly max: number;
    readonly currency: string;
  };
  readonly groupSizePreference: 'solo' | 'small' | 'medium' | 'large';
  readonly travelStyle: 'adventure' | 'relaxed' | 'cultural' | 'budget' | 'luxury' | 'business';
  readonly interests: string[];
  readonly accommodationPreference: 'hotel' | 'hostel' | 'airbnb' | 'camping' | 'any';
  readonly transportationPreference: 'flight' | 'train' | 'bus' | 'car' | 'any';
  readonly dietaryRestrictions?: string[];
  readonly accessibilityNeeds?: string[];
  readonly languages: string[];
  readonly travelFrequency: 'rarely' | 'occasionally' | 'frequently' | 'constantly';
}

// Profile Setup Interface
export interface ProfileSetup {
  readonly profilePicture?: File;
  readonly profilePictureUrl?: string;
  readonly socialLinks?: SocialLinks;
  readonly privacySettings: PrivacySettings;
  readonly notificationSettings: NotificationSettings;
}

// User Location Interface
export interface UserLocation {
  readonly country: string;
  readonly state?: string;
  readonly city?: string;
  readonly timezone: string;
  readonly coordinates?: {
    readonly latitude: number;
    readonly longitude: number;
  };
}

// Social Links Interface
export interface SocialLinks {
  readonly website?: string;
  readonly instagram?: string;
  readonly twitter?: string;
  readonly facebook?: string;
  readonly linkedin?: string;
  readonly tiktok?: string;
  readonly youtube?: string;
}

// Privacy Settings Interface
export interface PrivacySettings {
  readonly profileVisibility: 'public' | 'friends' | 'private';
  readonly showEmail: boolean;
  readonly showPhone: boolean;
  readonly showLocation: boolean;
  readonly showTravelHistory: boolean;
  readonly allowFriendRequests: boolean;
  readonly allowTripInvitations: boolean;
  readonly dataSharing: {
    readonly analytics: boolean;
    readonly marketing: boolean;
    readonly thirdParty: boolean;
  };
}

// Notification Settings Interface
export interface NotificationSettings {
  readonly email: {
    readonly tripUpdates: boolean;
    readonly friendRequests: boolean;
    readonly tripInvitations: boolean;
    readonly marketing: boolean;
    readonly security: boolean;
  };
  readonly push: {
    readonly tripUpdates: boolean;
    readonly friendRequests: boolean;
    readonly tripInvitations: boolean;
    readonly messages: boolean;
  };
  readonly sms: {
    readonly tripUpdates: boolean;
    readonly security: boolean;
  };
}

// Onboarding State Interface
export interface OnboardingState {
  readonly currentStep: number;
  readonly totalSteps: number;
  readonly data: OnboardingData;
  readonly isCompleted: boolean;
  readonly isLoading: boolean;
  readonly error: string | null;
}

// Onboarding Step Interface
export interface OnboardingStep {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly component: React.ComponentType<OnboardingStepProps>;
  readonly validation?: (data: OnboardingData) => string[];
  readonly isOptional?: boolean;
}

// Onboarding Step Props Interface
export interface OnboardingStepProps {
  readonly data: OnboardingData;
  readonly onUpdate: (updates: Partial<OnboardingData>) => void;
  readonly onNext: () => void;
  readonly onBack: () => void;
  readonly onSkip?: (() => void) | undefined;
  readonly isLoading?: boolean;
  readonly error?: string | null;
}

// Onboarding Context Interface
export interface OnboardingContextType {
  readonly state: OnboardingState;
  readonly updateData: (updates: Partial<OnboardingData>) => void;
  readonly nextStep: () => void;
  readonly previousStep: () => void;
  readonly skipStep: () => void;
  readonly completeOnboarding: () => Promise<void>;
  readonly resetOnboarding: () => void;
  readonly saveProgress: () => void;
  readonly loadProgress: () => OnboardingData | null;
  readonly clearProgress: () => void;
}

// Onboarding Validation Error Interface
export interface OnboardingValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

// Onboarding Progress Interface
export interface OnboardingProgress {
  readonly currentStep: number;
  readonly totalSteps: number;
  readonly percentage: number;
  readonly completedSteps: number[];
  readonly isCompleted: boolean;
}

// Onboarding Configuration Interface
export interface OnboardingConfig {
  readonly steps: OnboardingStep[];
  readonly autoSave: boolean;
  readonly autoSaveInterval: number; // in milliseconds
  readonly allowSkip: boolean;
  readonly showProgress: boolean;
  readonly enableKeyboardNavigation: boolean;
  readonly validation: {
    readonly realTime: boolean;
    readonly strict: boolean;
  };
}

// Default Onboarding Configuration
export const DEFAULT_ONBOARDING_CONFIG: OnboardingConfig = {
  steps: [],
  autoSave: true,
  autoSaveInterval: 30000, // 30 seconds
  allowSkip: false,
  showProgress: true,
  enableKeyboardNavigation: true,
  validation: {
    realTime: true,
    strict: false,
  },
};

// Onboarding Constants
export const ONBOARDING_STORAGE_KEY = 'wandercrew-onboarding-progress';
export const ONBOARDING_VERSION = '1.0.0';

// Travel Interest Options
export const TRAVEL_INTERESTS = [
  'culture',
  'nature',
  'adventure',
  'food',
  'history',
  'art',
  'photography',
  'nightlife',
  'beach',
  'mountains',
  'cities',
  'wildlife',
  'religion',
  'architecture',
  'music',
  'sports',
  'wellness',
  'shopping',
  'festivals',
  'local experiences'
] as const;

// Popular Destinations
export const POPULAR_DESTINATIONS = [
  'Paris, France',
  'Tokyo, Japan',
  'New York, USA',
  'London, UK',
  'Rome, Italy',
  'Barcelona, Spain',
  'Amsterdam, Netherlands',
  'Sydney, Australia',
  'Dubai, UAE',
  'Bangkok, Thailand',
  'Istanbul, Turkey',
  'Prague, Czech Republic',
  'Vienna, Austria',
  'Berlin, Germany',
  'Madrid, Spain',
  'Athens, Greece',
  'Lisbon, Portugal',
  'Copenhagen, Denmark',
  'Stockholm, Sweden',
  'Zurich, Switzerland'
] as const;

// Currency Options
export const CURRENCY_OPTIONS = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
] as const;

// Language Options
export const LANGUAGE_OPTIONS = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Japanese',
  'Chinese',
  'Korean',
  'Arabic',
  'Hindi',
  'Dutch',
  'Swedish',
  'Norwegian',
  'Danish',
  'Finnish',
  'Polish',
  'Czech',
  'Hungarian'
] as const;
