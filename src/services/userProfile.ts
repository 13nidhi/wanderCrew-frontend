import {
  calculateProfileCompletion,
  sanitizeProfileData,
  validateProfileUpdate,
  validateUserProfile
} from '@utils/profileValidation';
import type { Unsubscribe } from 'firebase/firestore';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  ref,
  uploadBytes
} from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type {
  ProfileActivity,
  ProfileBackup,
  ProfileExport,
  ProfilePictureResponse,
  ProfileSearchFilters,
  ProfileSearchResult,
  ProfileServiceConfig,
  ProfileServiceResponse,
  ProfileStatistics,
  ProfileUpdate,
  UserProfile
} from '../types/profile';
import { DEFAULT_PROFILE_CONFIG } from '../types/profile';

// Service Configuration
const config: ProfileServiceConfig = DEFAULT_PROFILE_CONFIG;

// Collection Names
const COLLECTIONS = {
  PROFILES: 'profiles',
  PROFILE_ACTIVITIES: 'profile_activities',
  PROFILE_BACKUPS: 'profile_backups',
} as const;

// Cache for profile data
const profileCache = new Map<string, { data: UserProfile; timestamp: number }>();

/**
 * User Profile Service Class
 */
export class UserProfileService {
  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<ProfileServiceResponse<UserProfile>> {
    try {
      // Check cache first
      const cached = profileCache.get(userId);
      if (cached && Date.now() - cached.timestamp < config.caching.ttl * 1000) {
        return {
          success: true,
          data: cached.data,
        };
      }

      const profileRef = doc(db, COLLECTIONS.PROFILES, userId);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        return {
          success: false,
          error: 'Profile not found',
        };
      }

      const profileData = profileSnap.data() as UserProfile;

      // Update cache
      if (config.caching.enabled) {
        profileCache.set(userId, { data: profileData, timestamp: Date.now() });
      }

      return {
        success: true,
        data: profileData,
      };
    } catch (error: any) {
      console.error('Error getting user profile:', error);
      return {
        success: false,
        error: `Failed to get user profile: ${error.message}`,
      };
    }
  }

  /**
   * Create or update user profile
   */
  static async updateUserProfile(
    userId: string, 
    updates: ProfileUpdate
  ): Promise<ProfileServiceResponse<void>> {
    try {
      // Sanitize and validate the update data
      const sanitizedUpdates = sanitizeProfileData(updates);
      const validation = validateProfileUpdate(sanitizedUpdates);

      if (!validation.isValid) {
        return {
          success: false,
          error: 'Validation failed',
          validationErrors: validation.errors,
        };
      }

      // Get current profile for validation context
      const currentProfileResponse = await this.getUserProfile(userId);
      const currentProfile = currentProfileResponse.data;

      // Prepare update data with timestamps
      const updateData = {
        ...sanitizedUpdates,
        updatedAt: serverTimestamp(),
        profileCompletion: currentProfile 
          ? calculateProfileCompletion({ ...currentProfile, ...sanitizedUpdates })
          : 0,
      };

      // Update profile in Firestore
      const profileRef = doc(db, COLLECTIONS.PROFILES, userId);
      await updateDoc(profileRef, updateData);

      // Log profile activity
      await this.logProfileActivity(userId, 'profile_update', 'Profile updated', {
        updatedFields: Object.keys(sanitizedUpdates),
        validationWarnings: validation.warnings,
      });

      // Clear cache
      profileCache.delete(userId);

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      return {
        success: false,
        error: `Failed to update user profile: ${error.message}`,
      };
    }
  }

  /**
   * Create new user profile
   */
  static async createUserProfile(
    userId: string, 
    profileData: Partial<UserProfile>
  ): Promise<ProfileServiceResponse<UserProfile>> {
    try {
      // Validate the profile data
      const validation = validateUserProfile(profileData);

      if (!validation.isValid) {
        return {
          success: false,
          error: 'Validation failed',
          validationErrors: validation.errors,
        };
      }

      // Prepare profile data with required fields
      const newProfile: UserProfile = {
        id: userId,
        email: profileData.email || '',
        name: profileData.name || '',
        travelPreferences: profileData.travelPreferences || {
          destinations: [],
          budgetRange: { min: 0, max: 1000, currency: 'USD' },
          groupSizePreference: 'medium',
          travelStyle: 'relaxed',
          interests: [],
          accommodationPreference: 'any',
          transportationPreference: 'any',
          languages: ['en'],
          travelFrequency: 'occasionally',
        },
        privacySettings: profileData.privacySettings || {
          profileVisibility: 'public',
          showEmail: false,
          showPhone: false,
          showLocation: true,
          showTravelHistory: true,
          allowFriendRequests: true,
          allowTripInvitations: true,
          dataSharing: {
            analytics: true,
            marketing: false,
            thirdParty: false,
          },
        },
        notificationSettings: profileData.notificationSettings || {
          email: {
            tripUpdates: true,
            friendRequests: true,
            tripInvitations: true,
            marketing: false,
            security: true,
          },
          push: {
            tripUpdates: true,
            friendRequests: true,
            tripInvitations: true,
            messages: true,
          },
          sms: {
            tripUpdates: false,
            security: true,
          },
        },
        accountSettings: profileData.accountSettings || {
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          currency: 'USD',
          units: 'metric',
          theme: 'auto',
          twoFactorAuth: false,
          loginNotifications: true,
          sessionTimeout: 30,
        },
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        lastLoginAt: serverTimestamp() as Timestamp,
        isVerified: false,
        isActive: true,
        profileCompletion: calculateProfileCompletion(profileData),
        ...profileData,
      };

      // Create profile in Firestore
      const profileRef = doc(db, COLLECTIONS.PROFILES, userId);
      await setDoc(profileRef, newProfile);

      // Log profile activity
      await this.logProfileActivity(userId, 'profile_update', 'Profile created', {
        profileCompletion: newProfile.profileCompletion,
      });

      return {
        success: true,
        data: newProfile,
      };
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      return {
        success: false,
        error: `Failed to create user profile: ${error.message}`,
      };
    }
  }

  /**
   * Delete user profile
   */
  static async deleteUserProfile(userId: string): Promise<ProfileServiceResponse<void>> {
    try {
      // Get profile to check for profile picture
      const profileResponse = await this.getUserProfile(userId);
      if (profileResponse.success && profileResponse.data?.profilePicture) {
        // Delete profile picture from storage
        await this.deleteProfilePicture(userId);
      }

      // Delete profile from Firestore
      const profileRef = doc(db, COLLECTIONS.PROFILES, userId);
      await deleteDoc(profileRef);

      // Log profile activity
      await this.logProfileActivity(userId, 'profile_update', 'Profile deleted');

      // Clear cache
      profileCache.delete(userId);

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Error deleting user profile:', error);
      return {
        success: false,
        error: `Failed to delete user profile: ${error.message}`,
      };
    }
  }

  /**
   * Upload profile picture
   */
  static async uploadProfilePicture(
    userId: string, 
    file: File
  ): Promise<ProfileServiceResponse<ProfilePictureResponse>> {
    try {
      // Validate file
      if (!config.allowedFileTypes.includes(file.type)) {
        return {
          success: false,
          error: `File type not allowed. Allowed types: ${config.allowedFileTypes.join(', ')}`,
        };
      }

      if (file.size > config.maxFileSize) {
        return {
          success: false,
          error: `File too large. Maximum size: ${config.maxFileSize / (1024 * 1024)}MB`,
        };
      }

      // Delete existing profile picture if any
      const existingProfile = await this.getUserProfile(userId);
      if (existingProfile.success && existingProfile.data?.profilePicture) {
        await this.deleteProfilePicture(userId);
      }

      // Compress image if enabled
      let processedFile = file;
      if (config.imageCompression.enabled) {
        processedFile = await this.compressImage(file);
      }

      // Upload to Firebase Storage
      const fileName = `profile-pictures/${userId}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, fileName);
      const uploadResult = await uploadBytes(storageRef, processedFile);

      // Get download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // Get file metadata
      const metadata = await getMetadata(uploadResult.ref);

      // Update profile with new picture URL
      await this.updateUserProfile(userId, {
        profilePicture: downloadURL,
      });

      // Log profile activity
      await this.logProfileActivity(userId, 'picture_upload', 'Profile picture uploaded', {
        fileSize: metadata.size,
        fileType: metadata.contentType,
      });

      const response: ProfilePictureResponse = {
        url: downloadURL,
        metadata: {
          size: metadata.size,
          type: metadata.contentType || file.type,
          dimensions: {
            width: 0, // Will be populated by image processing
            height: 0,
          },
          uploadedAt: Timestamp.now(),
        },
      };

      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      return {
        success: false,
        error: `Failed to upload profile picture: ${error.message}`,
      };
    }
  }

  /**
   * Delete profile picture
   */
  static async deleteProfilePicture(userId: string): Promise<ProfileServiceResponse<void>> {
    try {
      const profileResponse = await this.getUserProfile(userId);
      if (!profileResponse.success || !profileResponse.data?.profilePicture) {
        return {
          success: false,
          error: 'No profile picture found',
        };
      }

      // Extract file path from URL
      const url = profileResponse.data.profilePicture;
      const fileName = url.split('/').pop()?.split('?')[0];
      
      if (fileName) {
        const storageRef = ref(storage, `profile-pictures/${userId}/${fileName}`);
        await deleteObject(storageRef);
      }

      // Update profile to remove picture URL
      await this.updateUserProfile(userId, {
        // omit field to remove; service should handle cleanup if needed
      });

      // Log profile activity
      await this.logProfileActivity(userId, 'picture_upload', 'Profile picture deleted');

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Error deleting profile picture:', error);
      return {
        success: false,
        error: `Failed to delete profile picture: ${error.message}`,
      };
    }
  }

  /**
   * Search user profiles
   */
  static async searchProfiles(
    filters: ProfileSearchFilters,
    limitCount: number = 20
  ): Promise<ProfileServiceResponse<ProfileSearchResult[]>> {
    try {
      let q = query(collection(db, COLLECTIONS.PROFILES));

      // Apply filters
      if (filters.name) {
        q = query(q, where('name', '>=', filters.name), where('name', '<=', filters.name + '\uf8ff'));
      }

      if (filters.location) {
        q = query(q, where('location.country', '==', filters.location));
      }

      if (filters.verifiedOnly) {
        q = query(q, where('isVerified', '==', true));
      }

      if (filters.hasProfilePicture) {
        q = query(q, where('profilePicture', '!=', null));
      }

      // Order by relevance (name for now)
      q = query(q, orderBy('name'), limit(limitCount));

      const querySnapshot = await getDocs(q);
      const results: ProfileSearchResult[] = [];

      for (const doc of querySnapshot.docs) {
        const profile = doc.data() as UserProfile;
        const statistics = await this.getProfileStatistics(profile.id);
        
        results.push({
          profile,
          statistics: statistics.success ? statistics.data! : {
            totalTrips: 0,
            totalFriends: 0,
            totalReviews: 0,
            averageRating: 0,
            countriesVisited: 0,
            citiesVisited: 0,
            totalDistanceTraveled: 0,
            memberSince: profile.createdAt,
            upcomingTrips: 0,
          },
          relevanceScore: this.calculateRelevanceScore(profile, filters),
        });
      }

      return {
        success: true,
        data: results,
      };
    } catch (error: any) {
      console.error('Error searching profiles:', error);
      return {
        success: false,
        error: `Failed to search profiles: ${error.message}`,
      };
    }
  }

  /**
   * Get profile statistics
   */
  static async getProfileStatistics(_userId: string): Promise<ProfileServiceResponse<ProfileStatistics>> {
    try {
      // This would typically query multiple collections for statistics
      // For now, return mock data - will be implemented when trip system is ready
      const statistics: ProfileStatistics = {
        totalTrips: 0,
        totalFriends: 0,
        totalReviews: 0,
        averageRating: 0,
        countriesVisited: 0,
        citiesVisited: 0,
        totalDistanceTraveled: 0,
        memberSince: Timestamp.now(),
        upcomingTrips: 0,
      };

      return {
        success: true,
        data: statistics,
      };
    } catch (error: any) {
      console.error('Error getting profile statistics:', error);
      return {
        success: false,
        error: `Failed to get profile statistics: ${error.message}`,
      };
    }
  }

  /**
   * Export profile data
   */
  static async exportProfileData(
    userId: string, 
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<ProfileServiceResponse<ProfileExport>> {
    try {
      const profileResponse = await this.getUserProfile(userId);
      if (!profileResponse.success) {
        return {
          success: false,
          error: 'Profile not found',
        };
      }

      const statisticsResponse = await this.getProfileStatistics(userId);
      const statistics = statisticsResponse.success ? statisticsResponse.data! : null;

      const exportData: ProfileExport = {
        profile: profileResponse.data!,
        statistics: statistics!,
        travelHistory: [], // Will be populated when trip system is ready
        exportedAt: Timestamp.now(),
        format,
      };

      return {
        success: true,
        data: exportData,
      };
    } catch (error: any) {
      console.error('Error exporting profile data:', error);
      return {
        success: false,
        error: `Failed to export profile data: ${error.message}`,
      };
    }
  }

  /**
   * Create profile backup
   */
  static async createProfileBackup(userId: string): Promise<ProfileServiceResponse<ProfileBackup>> {
    try {
      const profileResponse = await this.getUserProfile(userId);
      if (!profileResponse.success) {
        return {
          success: false,
          error: 'Profile not found',
        };
      }

      const backup: ProfileBackup = {
        userId,
        data: profileResponse.data!,
        createdAt: Timestamp.now(),
        version: '1.0.0',
        size: JSON.stringify(profileResponse.data).length,
      };

      // Store backup in Firestore
      const backupRef = doc(collection(db, COLLECTIONS.PROFILE_BACKUPS));
      await setDoc(backupRef, backup);

      return {
        success: true,
        data: backup,
      };
    } catch (error: any) {
      console.error('Error creating profile backup:', error);
      return {
        success: false,
        error: `Failed to create profile backup: ${error.message}`,
      };
    }
  }

  /**
   * Listen to profile changes
   */
  static listenToProfile(
    userId: string, 
    callback: (profile: UserProfile | null) => void
  ): Unsubscribe {
    const profileRef = doc(db, COLLECTIONS.PROFILES, userId);
    
    return onSnapshot(profileRef, (doc) => {
      if (doc.exists()) {
        const profile = doc.data() as UserProfile;
        callback(profile);
        
        // Update cache
        if (config.caching.enabled) {
          profileCache.set(userId, { data: profile, timestamp: Date.now() });
        }
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error listening to profile changes:', error);
      callback(null);
    });
  }

  // Private helper methods

  /**
   * Compress image file
   */
  private static async compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        const maxWidth = config.imageCompression.maxWidth;
        const maxHeight = config.imageCompression.maxHeight;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          config.imageCompression.quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Log profile activity
   */
  private static async logProfileActivity(
    userId: string,
    type: ProfileActivity['type'],
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const base: Omit<ProfileActivity, 'metadata'> = {
        id: `${userId}_${Date.now()}`,
        userId,
        type,
        description,
        timestamp: Timestamp.now(),
      };
      const activity: ProfileActivity = metadata ? { ...base, metadata } : (base as ProfileActivity);

      const activityRef = doc(collection(db, COLLECTIONS.PROFILE_ACTIVITIES));
      await setDoc(activityRef, activity);
    } catch (error) {
      console.error('Error logging profile activity:', error);
    }
  }

  /**
   * Calculate relevance score for search results
   */
  private static calculateRelevanceScore(
    profile: UserProfile,
    filters: ProfileSearchFilters
  ): number {
    let score = 0;

    // Name match
    if (filters.name && profile.name.toLowerCase().includes(filters.name.toLowerCase())) {
      score += 10;
    }

    // Location match
    if (filters.location && profile.location?.country === filters.location) {
      score += 5;
    }

    // Interest match
    if (filters.interests && profile.travelPreferences.interests) {
      const matchingInterests = filters.interests.filter((interest: string) =>
        profile.travelPreferences.interests.includes(interest)
      );
      score += matchingInterests.length * 2;
    }

    // Travel style match
    if (filters.travelStyle && profile.travelPreferences.travelStyle) {
      if (filters.travelStyle.includes(profile.travelPreferences.travelStyle)) {
        score += 3;
      }
    }

    // Profile completeness bonus
    score += profile.profileCompletion / 10;

    return Math.min(score, 100); // Cap at 100
  }
}

// Export individual functions for convenience
export const {
  getUserProfile,
  updateUserProfile,
  createUserProfile,
  deleteUserProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  searchProfiles,
  getProfileStatistics,
  exportProfileData,
  createProfileBackup,
  listenToProfile,
} = UserProfileService;
