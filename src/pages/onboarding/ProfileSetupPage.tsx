import { ImageUpload } from '@components/onboarding';
import React, { useState } from 'react';
import type { OnboardingStepProps } from '../../types/onboarding';

const ProfileSetupPage: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
  onSkip,
  isLoading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState({
    profileVisibility: data.profileSetup.privacySettings.profileVisibility,
    showEmail: data.profileSetup.privacySettings.showEmail,
    showPhone: data.profileSetup.privacySettings.showPhone,
    allowFriendRequests: data.profileSetup.privacySettings.allowFriendRequests,
    emailNotifications: data.profileSetup.notificationSettings.email.tripUpdates,
    pushNotifications: data.profileSetup.notificationSettings.push.tripUpdates,
  });

  const handleCheckboxChange = (field: string, value: boolean) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    
    // Update the onboarding data
    onUpdate({
      profileSetup: {
        ...data.profileSetup,
        privacySettings: {
          ...data.profileSetup.privacySettings,
          [field]: value,
        },
        notificationSettings: {
          ...data.profileSetup.notificationSettings,
          email: {
            ...data.profileSetup.notificationSettings.email,
            [field]: value,
          },
          push: {
            ...data.profileSetup.notificationSettings.push,
            [field]: value,
          },
        },
      },
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    
    // Update the onboarding data
    onUpdate({
      profileSetup: {
        ...data.profileSetup,
        privacySettings: {
          ...data.profileSetup.privacySettings,
          [field]: value,
        },
      },
    });
  };

  const handleImageSelect = async (file: File) => {
    // For onboarding, store a local preview URL; upload happens after completion
    const previewUrl = URL.createObjectURL(file);
    onUpdate({
      profileSetup: {
        ...data.profileSetup,
        profilePictureUrl: previewUrl,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="profile-setup-page">
      <form onSubmit={handleSubmit} className="profile-setup-form">
        {/* Profile Visibility */}
        <div className="form-group">
          <label htmlFor="profileVisibility" className="form-label">
            Profile Visibility
          </label>
          <select
            id="profileVisibility"
            value={formData.profileVisibility}
            onChange={(e) => handleSelectChange('profileVisibility', e.target.value)}
            className="form-select"
            disabled={isLoading}
          >
            <option value="public">Public - Anyone can see your profile</option>
            <option value="friends">Friends - Only friends can see your profile</option>
            <option value="private">Private - Only you can see your profile</option>
          </select>
        </div>

        {/* Privacy Settings */}
        <div className="form-section">
          <h3>Privacy Settings</h3>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.showEmail}
                onChange={(e) => handleCheckboxChange('showEmail', e.target.checked)}
                disabled={isLoading}
              />
              <span>Show email address on profile</span>
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.showPhone}
                onChange={(e) => handleCheckboxChange('showPhone', e.target.checked)}
                disabled={isLoading}
              />
              <span>Show phone number on profile</span>
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.allowFriendRequests}
                onChange={(e) => handleCheckboxChange('allowFriendRequests', e.target.checked)}
                disabled={isLoading}
              />
              <span>Allow friend requests</span>
            </label>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="form-section">
          <h3>Notification Preferences</h3>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={(e) => handleCheckboxChange('emailNotifications', e.target.checked)}
                disabled={isLoading}
              />
              <span>Email notifications for trip updates</span>
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.pushNotifications}
                onChange={(e) => handleCheckboxChange('pushNotifications', e.target.checked)}
                disabled={isLoading}
              />
              <span>Push notifications for trip updates</span>
            </label>
          </div>
        </div>

        {/* Profile Picture Upload */}
        <div className="form-section">
          <h3>Profile Picture</h3>
          <ImageUpload
            onSelect={handleImageSelect}
            initialPreviewUrl={data.profileSetup.profilePictureUrl}
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="form-error">
            <p>{error}</p>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onBack}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Back
          </button>
          
          <div className="actions-center">
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="btn btn-link"
                disabled={isLoading}
              >
                Skip for now
              </button>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Complete Setup'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSetupPage;
