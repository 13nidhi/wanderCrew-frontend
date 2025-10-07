import { useAuth } from '@contexts/AuthContext';
import { UserProfileService } from '@services/userProfile';
import type {
    ProfileBackup,
    ProfileExport,
    ProfilePictureResponse,
    ProfileSearchFilters,
    ProfileSearchResult,
    ProfileStatistics,
    ProfileUpdate,
    ProfileValidationError,
    UserProfile,
    UseUserProfileReturn
} from '@types/profile';
import { calculateProfileCompletion, validateProfileUpdate } from '@utils/profileValidation';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Custom hook for managing user profile state and operations
 */
export const useUserProfile = (userId?: string): UseUserProfileReturn => {
  // Get current user from auth context if no userId provided
  const { user: authUser } = useAuth();
  const targetUserId = userId || authUser?.id;

  // State management
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Refs for cleanup
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);

  /**
   * Load user profile
   */
  const loadProfile = useCallback(async () => {
    if (!targetUserId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await UserProfileService.getUserProfile(targetUserId);
      
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.error || 'Failed to load profile');
        setProfile(null);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setProfile(null);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [targetUserId]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (updates: ProfileUpdate) => {
    if (!targetUserId) {
      throw new Error('No user ID available');
    }

    try {
      setUpdating(true);
      setError(null);

      // Validate updates
      const validation = validateProfileUpdate(updates, profile || undefined);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      const response = await UserProfileService.updateUserProfile(targetUserId, updates);
      
      if (response.success) {
        // Profile will be updated via real-time listener
        // But we can optimistically update local state
        if (profile) {
          const updatedProfile = {
            ...profile,
            ...updates,
            updatedAt: new Date() as any, // Will be replaced by server timestamp
            profileCompletion: calculateProfileCompletion({ ...profile, ...updates }),
          };
          setProfile(updatedProfile);
        }
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      if (mountedRef.current) {
        setUpdating(false);
      }
    }
  }, [targetUserId, profile]);

  /**
   * Upload profile picture
   */
  const uploadProfilePicture = useCallback(async (file: File): Promise<ProfilePictureResponse> => {
    if (!targetUserId) {
      throw new Error('No user ID available');
    }

    try {
      setUpdating(true);
      setError(null);

      const response = await UserProfileService.uploadProfilePicture(targetUserId, file);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to upload profile picture');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile picture');
      throw err;
    } finally {
      if (mountedRef.current) {
        setUpdating(false);
      }
    }
  }, [targetUserId]);

  /**
   * Delete profile picture
   */
  const deleteProfilePicture = useCallback(async (): Promise<void> => {
    if (!targetUserId) {
      throw new Error('No user ID available');
    }

    try {
      setUpdating(true);
      setError(null);

      const response = await UserProfileService.deleteProfilePicture(targetUserId);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete profile picture');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete profile picture');
      throw err;
    } finally {
      if (mountedRef.current) {
        setUpdating(false);
      }
    }
  }, [targetUserId]);

  /**
   * Refresh profile data
   */
  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  /**
   * Validate current profile
   */
  const validateProfile = useCallback((): ProfileValidationError[] => {
    if (!profile) return [];
    
    const validation = validateProfileUpdate(profile);
    return validation.errors;
  }, [profile]);

  /**
   * Get profile completion percentage
   */
  const getProfileCompletion = useCallback((): number => {
    if (!profile) return 0;
    return profile.profileCompletion;
  }, [profile]);

  // Set up real-time listener
  useEffect(() => {
    if (!targetUserId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Set up real-time listener
    const unsubscribe = UserProfileService.listenToProfile(targetUserId, (updatedProfile) => {
      if (mountedRef.current) {
        setProfile(updatedProfile);
        setLoading(false);
        setError(null);
      }
    });

    unsubscribeRef.current = unsubscribe;

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [targetUserId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    profile,
    loading,
    error,
    updating,
    updateProfile,
    uploadProfilePicture,
    deleteProfilePicture,
    refreshProfile,
    validateProfile,
    getProfileCompletion,
  };
};

/**
 * Hook for profile search functionality
 */
export const useProfileSearch = () => {
  const [results, setResults] = useState<ProfileSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProfiles = useCallback(async (
    filters: ProfileSearchFilters,
    limitCount: number = 20
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await UserProfileService.searchProfiles(filters, limitCount);
      
      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setError(response.error || 'Search failed');
        setResults([]);
      }
    } catch (err: any) {
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    searchProfiles,
    clearResults,
  };
};

/**
 * Hook for profile statistics
 */
export const useProfileStatistics = (userId?: string) => {
  const [statistics, setStatistics] = useState<ProfileStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = useCallback(async () => {
    if (!userId) {
      setStatistics(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await UserProfileService.getProfileStatistics(userId);
      
      if (response.success && response.data) {
        setStatistics(response.data);
      } else {
        setError(response.error || 'Failed to load statistics');
        setStatistics(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load statistics');
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  return {
    statistics,
    loading,
    error,
    refreshStatistics: loadStatistics,
  };
};

/**
 * Hook for profile export functionality
 */
export const useProfileExport = () => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportProfile = useCallback(async (
    userId: string,
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<ProfileExport | null> => {
    try {
      setExporting(true);
      setError(null);

      const response = await UserProfileService.exportProfileData(userId, format);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Export failed');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Export failed');
      return null;
    } finally {
      setExporting(false);
    }
  }, []);

  const downloadExport = useCallback(async (
    userId: string,
    format: 'json' | 'csv' | 'pdf' = 'json'
  ) => {
    const exportData = await exportProfile(userId, format);
    
    if (exportData) {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `profile-export-${userId}-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [exportProfile]);

  return {
    exporting,
    error,
    exportProfile,
    downloadExport,
  };
};

/**
 * Hook for profile backup functionality
 */
export const useProfileBackup = () => {
  const [backingUp, setBackingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBackup = useCallback(async (userId: string): Promise<ProfileBackup | null> => {
    try {
      setBackingUp(true);
      setError(null);

      const response = await UserProfileService.createProfileBackup(userId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Backup failed');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Backup failed');
      return null;
    } finally {
      setBackingUp(false);
    }
  }, []);

  return {
    backingUp,
    error,
    createBackup,
  };
};

/**
 * Hook for profile completion tracking
 */
export const useProfileCompletion = (profile: UserProfile | null) => {
  const [completion, setCompletion] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    if (!profile) {
      setCompletion(0);
      setMissingFields([]);
      return;
    }

    const completionPercentage = profile.profileCompletion;
    setCompletion(completionPercentage);

    // Calculate missing fields
    const fields = [
      { key: 'name', label: 'Full Name', value: profile.name },
      { key: 'bio', label: 'Bio', value: profile.bio },
      { key: 'dateOfBirth', label: 'Date of Birth', value: profile.dateOfBirth },
      { key: 'phoneNumber', label: 'Phone Number', value: profile.phoneNumber },
      { key: 'location', label: 'Location', value: profile.location },
      { key: 'profilePicture', label: 'Profile Picture', value: profile.profilePicture },
      { key: 'interests', label: 'Travel Interests', value: profile.travelPreferences.interests },
      { key: 'destinations', label: 'Preferred Destinations', value: profile.travelPreferences.destinations },
    ];

    const missing = fields
      .filter(field => !field.value || (Array.isArray(field.value) && field.value.length === 0))
      .map(field => field.label);

    setMissingFields(missing);
  }, [profile]);

  const getCompletionMessage = useCallback(() => {
    if (completion >= 90) return 'Your profile is almost complete!';
    if (completion >= 70) return 'Your profile is looking good!';
    if (completion >= 50) return 'Your profile is partially complete.';
    if (completion >= 25) return 'Your profile needs more information.';
    return 'Your profile is just getting started!';
  }, [completion]);

  const getCompletionColor = useCallback(() => {
    if (completion >= 90) return '#10b981'; // green
    if (completion >= 70) return '#3b82f6'; // blue
    if (completion >= 50) return '#f59e0b'; // yellow
    if (completion >= 25) return '#f97316'; // orange
    return '#ef4444'; // red
  }, [completion]);

  return {
    completion,
    missingFields,
    getCompletionMessage,
    getCompletionColor,
  };
};
