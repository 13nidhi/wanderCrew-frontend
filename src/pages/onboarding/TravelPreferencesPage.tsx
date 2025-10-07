import type { OnboardingStepProps } from '@types/onboarding';
import { POPULAR_DESTINATIONS, TRAVEL_INTERESTS } from '@types/onboarding';
import React, { useState } from 'react';

const TravelPreferencesPage: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
  isLoading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState({
    destinations: data.travelPreferences.destinations,
    interests: data.travelPreferences.interests,
    travelStyle: data.travelPreferences.travelStyle,
    groupSizePreference: data.travelPreferences.groupSizePreference,
    budgetMin: data.travelPreferences.budgetRange.min,
    budgetMax: data.travelPreferences.budgetRange.max,
    currency: data.travelPreferences.budgetRange.currency,
  });

  const handleMultiSelect = (field: 'destinations' | 'interests', value: string) => {
    const currentValues = formData[field];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    
    const updatedFormData = { ...formData, [field]: newValues };
    setFormData(updatedFormData);
    
    // Update the onboarding data
    onUpdate({
      travelPreferences: {
        ...data.travelPreferences,
        [field]: newValues,
      },
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    
    // Update the onboarding data
    onUpdate({
      travelPreferences: {
        ...data.travelPreferences,
        [field]: value,
      },
    });
  };

  const handleBudgetChange = (field: 'budgetMin' | 'budgetMax', value: number) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    
    // Update the onboarding data
    onUpdate({
      travelPreferences: {
        ...data.travelPreferences,
        budgetRange: {
          min: field === 'budgetMin' ? value : formData.budgetMin,
          max: field === 'budgetMax' ? value : formData.budgetMax,
          currency: formData.currency,
        },
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.destinations.length > 0 && formData.interests.length > 0) {
      onNext();
    }
  };

  return (
    <div className="travel-preferences-page">
      <form onSubmit={handleSubmit} className="travel-preferences-form">
        {/* Destinations */}
        <div className="form-group">
          <label className="form-label">
            Where would you like to travel? *
          </label>
          <div className="multi-select-container">
            {POPULAR_DESTINATIONS.slice(0, 10).map((destination) => (
              <label key={destination} className="multi-select-item">
                <input
                  type="checkbox"
                  checked={formData.destinations.includes(destination)}
                  onChange={() => handleMultiSelect('destinations', destination)}
                  disabled={isLoading}
                />
                <span>{destination}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="form-group">
          <label className="form-label">
            What are your travel interests? *
          </label>
          <div className="multi-select-container">
            {TRAVEL_INTERESTS.map((interest) => (
              <label key={interest} className="multi-select-item">
                <input
                  type="checkbox"
                  checked={formData.interests.includes(interest)}
                  onChange={() => handleMultiSelect('interests', interest)}
                  disabled={isLoading}
                />
                <span>{interest.charAt(0).toUpperCase() + interest.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Travel Style */}
        <div className="form-group">
          <label htmlFor="travelStyle" className="form-label">
            Travel Style
          </label>
          <select
            id="travelStyle"
            value={formData.travelStyle}
            onChange={(e) => handleSelectChange('travelStyle', e.target.value)}
            className="form-select"
            disabled={isLoading}
          >
            <option value="relaxed">Relaxed</option>
            <option value="adventure">Adventure</option>
            <option value="cultural">Cultural</option>
            <option value="budget">Budget</option>
            <option value="luxury">Luxury</option>
            <option value="business">Business</option>
          </select>
        </div>

        {/* Group Size Preference */}
        <div className="form-group">
          <label htmlFor="groupSizePreference" className="form-label">
            Group Size Preference
          </label>
          <select
            id="groupSizePreference"
            value={formData.groupSizePreference}
            onChange={(e) => handleSelectChange('groupSizePreference', e.target.value)}
            className="form-select"
            disabled={isLoading}
          >
            <option value="solo">Solo Travel</option>
            <option value="small">Small Group (2-4 people)</option>
            <option value="medium">Medium Group (5-8 people)</option>
            <option value="large">Large Group (9+ people)</option>
          </select>
        </div>

        {/* Budget Range */}
        <div className="form-group">
          <label className="form-label">
            Budget Range (USD)
          </label>
          <div className="budget-range">
            <div className="budget-input-group">
              <label htmlFor="budgetMin">Min</label>
              <input
                type="number"
                id="budgetMin"
                value={formData.budgetMin}
                onChange={(e) => handleBudgetChange('budgetMin', parseInt(e.target.value) || 0)}
                className="form-input"
                min="0"
                disabled={isLoading}
              />
            </div>
            <div className="budget-separator">-</div>
            <div className="budget-input-group">
              <label htmlFor="budgetMax">Max</label>
              <input
                type="number"
                id="budgetMax"
                value={formData.budgetMax}
                onChange={(e) => handleBudgetChange('budgetMax', parseInt(e.target.value) || 0)}
                className="form-input"
                min="0"
                disabled={isLoading}
              />
            </div>
          </div>
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
            disabled={isLoading || formData.destinations.length === 0 || formData.interests.length === 0}
          >
            {isLoading ? 'Loading...' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TravelPreferencesPage;
