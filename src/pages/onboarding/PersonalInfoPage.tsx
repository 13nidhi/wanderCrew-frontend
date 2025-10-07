import type { OnboardingStepProps } from '@types/onboarding';
import React, { useState } from 'react';

const PersonalInfoPage: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
  isLoading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState({
    firstName: data.personalInfo.firstName,
    lastName: data.personalInfo.lastName,
    phoneNumber: data.personalInfo.phoneNumber || '',
    bio: data.personalInfo.bio || '',
  });

  const handleInputChange = (field: string, value: string) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    
    // Update the onboarding data
    onUpdate({
      personalInfo: {
        ...data.personalInfo,
        [field]: value,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName.trim() && formData.lastName.trim()) {
      onNext();
    }
  };

  return (
    <div className="personal-info-page">
      <form onSubmit={handleSubmit} className="personal-info-form">
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="form-input"
            placeholder="Enter your first name"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName" className="form-label">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="form-input"
            placeholder="Enter your last name"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber" className="form-label">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            className="form-input"
            placeholder="Enter your phone number"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio" className="form-label">
            Bio
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className="form-textarea"
            placeholder="Tell us a bit about yourself..."
            rows={4}
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
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !formData.firstName.trim() || !formData.lastName.trim()}
          >
            {isLoading ? 'Loading...' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfoPage;
