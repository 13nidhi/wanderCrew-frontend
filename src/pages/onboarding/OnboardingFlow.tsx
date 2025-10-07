import { ProgressIndicator } from '@components/onboarding';
import { useAuth } from '@contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  clearError,
  clearProgressFromStorage,
  completeOnboarding as completeOnboardingAction,
  loadProgressFromStorage,
  nextStep as nextStepAction,
  previousStep as previousStepAction,
  resetOnboarding as resetOnboardingAction,
  saveProgressToStorage,
  selectCurrentStep,
  selectError,
  selectIsLoading,
  selectOnboardingData,
  selectOnboardingState,
  selectTotalSteps,
  setError,
  setLoading,
  updateData,
} from '@store/slices/onboardingSlice';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  OnboardingContextType,
  OnboardingData,
  OnboardingStep,
  OnboardingValidationError
} from '../../types/onboarding';
import { DEFAULT_ONBOARDING_CONFIG } from '../../types/onboarding';

// Create OnboardingContext for backward compatibility
const OnboardingContext = React.createContext<OnboardingContextType | undefined>(undefined);

// Onboarding Steps Configuration
const onboardingSteps: OnboardingStep[] = [
  {
    id: 'personal-info',
    title: 'Personal Information',
    description: 'Tell us a bit about yourself',
    component: React.lazy(() => import('./PersonalInfoPage')),
    validation: (data) => {
      const errors: OnboardingValidationError[] = [];
      if (!data.personalInfo.firstName.trim()) {
        errors.push({ field: 'firstName', message: 'First name is required', code: 'REQUIRED' });
      }
      if (!data.personalInfo.lastName.trim()) {
        errors.push({ field: 'lastName', message: 'Last name is required', code: 'REQUIRED' });
      }
      return errors.map(error => error.message);
    },
  },
  {
    id: 'travel-preferences',
    title: 'Travel Preferences',
    description: 'Help us understand your travel style',
    component: React.lazy(() => import('./TravelPreferencesPage')),
    validation: (data) => {
      const errors: OnboardingValidationError[] = [];
      if (data.travelPreferences.destinations.length === 0) {
        errors.push({ field: 'destinations', message: 'Please select at least one destination', code: 'REQUIRED' });
      }
      if (data.travelPreferences.interests.length === 0) {
        errors.push({ field: 'interests', message: 'Please select at least one interest', code: 'REQUIRED' });
      }
      return errors.map(error => error.message);
    },
  },
  {
    id: 'profile-setup',
    title: 'Profile Setup',
    description: 'Complete your profile with a photo and preferences',
    component: React.lazy(() => import('./ProfileSetupPage')),
    validation: (_data) => {
      const errors: OnboardingValidationError[] = [];
      // Profile setup is optional, so no required validations
      return errors.map(error => error.message);
    },
    isOptional: true,
  },
];

// Main OnboardingFlow Component
const OnboardingFlow: React.FC = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectOnboardingState);
  const currentStep = useAppSelector(selectCurrentStep);
  const totalSteps = useAppSelector(selectTotalSteps);
  const onboardingData = useAppSelector(selectOnboardingData);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Auto-save functionality
  const saveProgress = useCallback(() => {
    dispatch(saveProgressToStorage());
  }, [dispatch]);

  // Load saved progress
  const loadProgress = useCallback((): OnboardingData | null => {
    dispatch(loadProgressFromStorage());
    return null; // Return type compatibility
  }, [dispatch]);

  // Clear saved progress
  const clearProgress = useCallback(() => {
    dispatch(clearProgressFromStorage());
  }, [dispatch]);

  // Update onboarding data
  const handleUpdateData = useCallback((updates: Partial<OnboardingData>) => {
    dispatch(updateData(updates));
  }, [dispatch]);

  // Navigate to next step
  const handleNextStep = useCallback(() => {
    const currentStepConfig = onboardingSteps[currentStep];
    if (currentStepConfig?.validation) {
      const validationErrors = currentStepConfig.validation(onboardingData);
      if (validationErrors.length > 0) {
        dispatch(setError(validationErrors[0] ?? 'Validation error'));
        return;
      }
    }

    if (currentStep < totalSteps - 1) {
      dispatch(nextStepAction());
    } else {
      handleCompleteOnboarding();
    }
  }, [dispatch, currentStep, totalSteps, onboardingData]);

  // Navigate to previous step
  const handlePreviousStep = useCallback(() => {
    if (currentStep > 0) {
      dispatch(previousStepAction());
    }
  }, [dispatch, currentStep]);

  // Skip current step (if optional)
  const handleSkipStep = useCallback(() => {
    const currentStepConfig = onboardingSteps[currentStep];
    if (currentStepConfig?.isOptional) {
      handleNextStep();
    }
  }, [currentStep, handleNextStep]);

  // Complete onboarding process
  const handleCompleteOnboarding = useCallback(async () => {
    if (!user) {
      dispatch(setError('No user found. Please sign in again.'));
      return;
    }

    dispatch(setLoading(true));

    try {
      // Transform onboarding data to user profile format (only allowed fields)
      const travelPreferences = {
        ...onboardingData.travelPreferences,
        groupSizePreference: onboardingData.travelPreferences.groupSizePreference as 'small' | 'medium' | 'large',
        travelStyle: onboardingData.travelPreferences.travelStyle as 'adventure' | 'relaxed' | 'cultural' | 'budget',
      };

      const profileUpdates: Partial<import('../../types/firebase').FirebaseUserProfile> = {
        name: `${onboardingData.personalInfo.firstName} ${onboardingData.personalInfo.lastName}`.trim(),
        travelPreferences,
        isOnboardingComplete: true,
        ...(onboardingData.profileSetup.profilePictureUrl
          ? { profilePicture: onboardingData.profileSetup.profilePictureUrl }
          : {}),
      };

      await updateProfile(profileUpdates);

      // Clear saved progress
      clearProgress();

      // Mark onboarding as completed
      dispatch(completeOnboardingAction());

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (e: any) {
      dispatch(setError(e?.message ?? 'Failed to complete onboarding'));
    }
  }, [user, onboardingData, updateProfile, navigate, clearProgress, dispatch]);

  // Reset onboarding
  const handleResetOnboarding = useCallback(() => {
    dispatch(resetOnboardingAction());
    clearProgress();
  }, [dispatch, clearProgress]);

  // Auto-save effect
  useEffect(() => {
    if (DEFAULT_ONBOARDING_CONFIG.autoSave) {
      // Clear existing timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        saveProgress();
      }, DEFAULT_ONBOARDING_CONFIG.autoSaveInterval);

      setAutoSaveTimeout(timeout);

      return () => {
        if (timeout) {
          clearTimeout(timeout);
        }
      };
    }
    return undefined;
  }, [onboardingData, saveProgress, autoSaveTimeout]);

  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Keyboard navigation
  useEffect(() => {
    if (!DEFAULT_ONBOARDING_CONFIG.enableKeyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && currentStep > 0) {
        handlePreviousStep();
      } else if (event.key === 'ArrowRight' && currentStep < totalSteps - 1) {
        handleNextStep();
      } else if (event.key === 'Escape') {
        navigate('/dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, totalSteps, handleNextStep, handlePreviousStep, navigate]);

  // Context value for backward compatibility
  const contextValue: OnboardingContextType = {
    state,
    updateData: handleUpdateData,
    nextStep: handleNextStep,
    previousStep: handlePreviousStep,
    skipStep: handleSkipStep,
    completeOnboarding: handleCompleteOnboarding,
    resetOnboarding: handleResetOnboarding,
    saveProgress,
    loadProgress,
    clearProgress,
  };

  // Get current step component
  const currentStepConfig = onboardingSteps[currentStep];
  const CurrentStepComponent = currentStepConfig?.component;

  // Don't render if no current step
  if (!currentStepConfig || !CurrentStepComponent) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-error">
          <h2>Error</h2>
          <p>Unable to load onboarding step. Please refresh the page.</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <OnboardingContext.Provider value={contextValue}>
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h1>Welcome to WanderCrew!</h1>
          <p>Let's set up your profile to get started</p>
        </div>

        {DEFAULT_ONBOARDING_CONFIG.showProgress && (
          <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
        )}

        <div className="onboarding-content">
          <div className="step-header">
            <h2>{currentStepConfig.title}</h2>
            <p>{currentStepConfig.description}</p>
          </div>

          <React.Suspense fallback={<div className="loading-spinner">Loading...</div>}>
            <CurrentStepComponent
              data={onboardingData}
              onUpdate={handleUpdateData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
              onSkip={currentStepConfig.isOptional ? handleSkipStep : undefined}
              isLoading={isLoading}
              error={error}
            />
          </React.Suspense>
        </div>

        <div className="onboarding-navigation">
          <button
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
            className="btn btn-secondary"
          >
            Previous
          </button>
          
          <div className="navigation-center">
            {currentStepConfig.isOptional && (
              <button
                onClick={handleSkipStep}
                className="btn btn-link"
              >
                Skip
              </button>
            )}
          </div>

          <button
            onClick={handleNextStep}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {currentStep === totalSteps - 1 ? 'Complete' : 'Next'}
          </button>
        </div>

        {error && (
          <div className="onboarding-error-message">
            <p>{error}</p>
            <button
              onClick={() => dispatch(clearError())}
              className="btn btn-link"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </OnboardingContext.Provider>
  );
};

// Custom hook to use OnboardingContext
export const useOnboarding = (): OnboardingContextType => {
  const context = React.useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingFlow component');
  }
  return context;
};

export default OnboardingFlow;
