import { Timestamp } from 'firebase/firestore';

// Base User Profile Interface
export interface UserProfile {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly profilePicture?: string;
  readonly bio?: string;
  readonly dateOfBirth?: Timestamp;
  readonly phoneNumber?: string;
  readonly location?: UserLocation;
  readonly travelPreferences: TravelPreferences;
  readonly socialLinks?: SocialLinks;
  readonly privacySettings: PrivacySettings;
  readonly notificationSettings: NotificationSettings;
  readonly accountSettings: AccountSettings;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly lastLoginAt: Timestamp;
  readonly isVerified: boolean;
  readonly isActive: boolean;
  readonly profileCompletion: number; // 0-100 percentage
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

// Travel Preferences Interface (Extended from Firebase types)
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

// Account Settings Interface
export interface AccountSettings {
  readonly language: string;
  readonly timezone: string;
  readonly dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  readonly currency: string;
  readonly units: 'metric' | 'imperial';
  readonly theme: 'light' | 'dark' | 'auto';
  readonly twoFactorAuth: boolean;
  readonly loginNotifications: boolean;
  readonly sessionTimeout: number; // in minutes
}

// Profile Update Interface
export interface ProfileUpdate {
  readonly name?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly bio?: string;
  readonly dateOfBirth?: Timestamp;
  readonly phoneNumber?: string;
  readonly location?: Partial<UserLocation>;
  readonly travelPreferences?: Partial<TravelPreferences>;
  readonly socialLinks?: Partial<SocialLinks>;
  readonly privacySettings?: Partial<PrivacySettings>;
  readonly notificationSettings?: Partial<NotificationSettings>;
  readonly accountSettings?: Partial<AccountSettings>;
  readonly profilePicture?: string; // added to allow setting/removing profile picture URL
}

// Profile Picture Upload Interface
export interface ProfilePictureUpload {
  readonly file: File;
  readonly userId: string;
  readonly metadata?: {
    readonly alt?: string;
    readonly caption?: string;
  };
}

// Profile Picture Response Interface
export interface ProfilePictureResponse {
  readonly url: string;
  readonly thumbnailUrl?: string;
  readonly metadata: {
    readonly size: number;
    readonly type: string;
    readonly dimensions: {
      readonly width: number;
      readonly height: number;
    };
    readonly uploadedAt: Timestamp;
  };
}

// Profile Validation Error Interface
export interface ProfileValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

// Profile Service Response Interface
export interface ProfileServiceResponse<T = any> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly validationErrors?: ProfileValidationError[];
}

// Profile Statistics Interface
export interface ProfileStatistics {
  readonly totalTrips: number;
  readonly totalFriends: number;
  readonly totalReviews: number;
  readonly averageRating: number;
  readonly countriesVisited: number;
  readonly citiesVisited: number;
  readonly totalDistanceTraveled: number; // in kilometers
  readonly memberSince: Timestamp;
  readonly lastTripDate?: Timestamp;
  readonly upcomingTrips: number;
}

// Profile Search Interface
export interface ProfileSearchFilters {
  readonly name?: string;
  readonly location?: string;
  readonly interests?: string[];
  readonly travelStyle?: string[];
  readonly groupSizePreference?: string[];
  readonly ageRange?: {
    readonly min: number;
    readonly max: number;
  };
  readonly verifiedOnly?: boolean;
  readonly hasProfilePicture?: boolean;
}

// Profile Search Result Interface
export interface ProfileSearchResult {
  readonly profile: UserProfile;
  readonly statistics: ProfileStatistics;
  readonly relevanceScore: number;
  readonly distance?: number; // in kilometers
}

// Profile Export Interface
export interface ProfileExport {
  readonly profile: UserProfile;
  readonly statistics: ProfileStatistics;
  readonly travelHistory: any[]; // Will be defined when trip system is implemented
  readonly exportedAt: Timestamp;
  readonly format: 'json' | 'csv' | 'pdf';
}

// Profile Import Interface
export interface ProfileImport {
  readonly file: File;
  readonly userId: string;
  readonly options: {
    readonly overwriteExisting: boolean;
    readonly validateData: boolean;
    readonly importTravelHistory: boolean;
  };
}

// Profile Backup Interface
export interface ProfileBackup {
  readonly userId: string;
  readonly data: UserProfile;
  readonly createdAt: Timestamp;
  readonly version: string;
  readonly size: number; // in bytes
}

// Profile Activity Interface
export interface ProfileActivity {
  readonly id: string;
  readonly userId: string;
  readonly type: 'profile_update' | 'picture_upload' | 'preference_change' | 'login' | 'logout';
  readonly description: string;
  readonly metadata?: Record<string, any>;
  readonly timestamp: Timestamp;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

// Profile Hook Return Type
export interface UseUserProfileReturn {
  readonly profile: UserProfile | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly updating: boolean;
  readonly updateProfile: (updates: ProfileUpdate) => Promise<void>;
  readonly uploadProfilePicture: (file: File) => Promise<ProfilePictureResponse>;
  readonly deleteProfilePicture: () => Promise<void>;
  readonly refreshProfile: () => Promise<void>;
  readonly validateProfile: () => ProfileValidationError[];
  readonly getProfileCompletion: () => number;
}

// Profile Form Props Interface
export interface ProfileFormProps {
  readonly initialData?: Partial<UserProfile>;
  readonly onSubmit: (data: ProfileUpdate) => Promise<void>;
  readonly loading?: boolean;
  readonly readonly?: boolean;
  readonly showAdvanced?: boolean;
  readonly onCancel?: () => void;
  readonly className?: string;
}

// Profile Picture Props Interface
export interface ProfilePictureProps {
  readonly userId: string;
  readonly profilePicture?: string;
  readonly size?: 'small' | 'medium' | 'large' | 'xlarge';
  readonly editable?: boolean;
  readonly onUpload?: (file: File) => Promise<void>;
  readonly onRemove?: () => Promise<void>;
  readonly loading?: boolean;
  readonly className?: string;
}

// Profile Page Props Interface
export interface ProfilePageProps {
  readonly userId?: string; // If not provided, shows current user's profile
  readonly editable?: boolean;
  readonly showStatistics?: boolean;
  readonly showActivity?: boolean;
  readonly className?: string;
}

// Profile Service Configuration
export interface ProfileServiceConfig {
  readonly maxFileSize: number; // in bytes
  readonly allowedFileTypes: string[];
  readonly imageCompression: {
    readonly enabled: boolean;
    readonly quality: number; // 0-1
    readonly maxWidth: number;
    readonly maxHeight: number;
  };
  readonly validation: {
    readonly strict: boolean;
    readonly realTime: boolean;
  };
  readonly caching: {
    readonly enabled: boolean;
    readonly ttl: number; // time to live in seconds
  };
}

// Default Profile Service Configuration
export const DEFAULT_PROFILE_CONFIG: ProfileServiceConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
  imageCompression: {
    enabled: true,
    quality: 0.8,
    maxWidth: 1024,
    maxHeight: 1024,
  },
  validation: {
    strict: true,
    realTime: true,
  },
  caching: {
    enabled: true,
    ttl: 300, // 5 minutes
  },
};

// Profile Field Validation Rules
export interface ProfileFieldValidation {
  readonly name: {
    readonly required: boolean;
    readonly minLength: number;
    readonly maxLength: number;
    readonly pattern?: RegExp;
  };
  readonly email: {
    readonly required: boolean;
    readonly pattern: RegExp;
  };
  readonly bio: {
    readonly maxLength: number;
  };
  readonly phoneNumber: {
    readonly pattern?: RegExp;
  };
  readonly dateOfBirth: {
    readonly minAge?: number;
    readonly maxAge?: number;
  };
}

// Default Validation Rules
export const DEFAULT_VALIDATION_RULES: ProfileFieldValidation = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  bio: {
    maxLength: 500,
  },
  phoneNumber: {
    pattern: /^\+?[\d\s\-\(\)]+$/,
  },
  dateOfBirth: {
    minAge: 13,
    maxAge: 120,
  },
};
