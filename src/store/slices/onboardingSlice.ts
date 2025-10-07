import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type {
  OnboardingData,
  OnboardingState
} from '../../types/onboarding';
import { ONBOARDING_STORAGE_KEY } from '../../types/onboarding';

// Initial Onboarding Data
const initialOnboardingData: OnboardingData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    // dateOfBirth omitted intentionally (optional)
    // location omitted intentionally (optional)
    phoneNumber: '',
    bio: '',
  },
  travelPreferences: {
    destinations: [],
    budgetRange: {
      min: 500,
      max: 2000,
      currency: 'USD',
    },
    groupSizePreference: 'medium',
    travelStyle: 'relaxed',
    interests: [],
    accommodationPreference: 'any',
    transportationPreference: 'any',
    dietaryRestrictions: [],
    accessibilityNeeds: [],
    languages: ['English'],
    travelFrequency: 'occasionally',
  },
  profileSetup: {
    // profilePicture omitted intentionally (optional)
    // profilePictureUrl omitted intentionally (optional)
    // socialLinks omitted intentionally (optional)
    privacySettings: {
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
    notificationSettings: {
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
  },
};

// Initial State
const initialState: OnboardingState = {
  currentStep: 0,
  totalSteps: 3,
  data: initialOnboardingData,
  isCompleted: false,
  isLoading: false,
  error: null,
};

// Onboarding Slice
const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    updateData: (state, action: PayloadAction<Partial<OnboardingData>>) => {
      state.data = { ...state.data, ...action.payload };
      state.error = null;
    },
    nextStep: (state) => {
      if (state.currentStep < state.totalSteps - 1) {
        state.currentStep += 1;
      }
      state.error = null;
    },
    previousStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
      state.error = null;
    },
    setStep: (state, action: PayloadAction<number>) => {
      const step = Math.max(0, Math.min(action.payload, state.totalSteps - 1));
      state.currentStep = step;
      state.error = null;
    },
    completeOnboarding: (state) => {
      state.isCompleted = true;
      state.isLoading = false;
      state.error = null;
    },
    resetOnboarding: (state) => {
      return {
        ...initialState,
        totalSteps: state.totalSteps,
      };
    },
    loadProgress: (state, action: PayloadAction<OnboardingData>) => {
      state.data = action.payload;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setTotalSteps: (state, action: PayloadAction<number>) => {
      state.totalSteps = action.payload;
    },
  },
});

// Export actions
export const {
  setLoading,
  setError,
  updateData,
  nextStep,
  previousStep,
  setStep,
  completeOnboarding,
  resetOnboarding,
  loadProgress,
  clearError,
  setTotalSteps,
} = onboardingSlice.actions;

// Selectors
export const selectOnboardingState = (state: { onboarding: OnboardingState }) => state.onboarding;
export const selectCurrentStep = (state: { onboarding: OnboardingState }) => state.onboarding.currentStep;
export const selectTotalSteps = (state: { onboarding: OnboardingState }) => state.onboarding.totalSteps;
export const selectOnboardingData = (state: { onboarding: OnboardingState }) => state.onboarding.data;
export const selectIsLoading = (state: { onboarding: OnboardingState }) => state.onboarding.isLoading;
export const selectError = (state: { onboarding: OnboardingState }) => state.onboarding.error;
export const selectIsCompleted = (state: { onboarding: OnboardingState }) => state.onboarding.isCompleted;
export const selectProgressPercentage = (state: { onboarding: OnboardingState }) => {
  const { currentStep, totalSteps } = state.onboarding;
  return ((currentStep + 1) / totalSteps) * 100;
};

// Thunks for async operations
export const saveProgressToStorage = () => (_dispatch: any, getState: any) => {
  try {
    const state = getState();
    const progressData = {
      ...state.onboarding.data,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(progressData));
  } catch (error) {
    console.error('Failed to save onboarding progress:', error);
  }
};

export const loadProgressFromStorage = () => (dispatch: any) => {
  try {
    const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Remove the savedAt field as it's not part of OnboardingData
      const { savedAt, ...data } = parsed;
      dispatch(loadProgress(data));
    }
  } catch (error) {
    console.error('Failed to load onboarding progress:', error);
  }
};

export const clearProgressFromStorage = () => (_dispatch: any) => {
  try {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear onboarding progress:', error);
  }
};

export default onboardingSlice.reducer;
