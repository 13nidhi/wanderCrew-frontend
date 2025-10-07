import { LoadingButton } from '@components/common';
import type {
    ProfileFormProps,
    ProfileUpdate
} from '@types/profile';
import { validateProfileUpdate } from '@utils/profileValidation';
import React, { useCallback, useEffect, useState } from 'react';

// Form field configuration
const PROFILE_FIELDS = {
  // Basic Information
  name: {
    name: 'name',
    type: 'text' as const,
    label: 'Full Name',
    placeholder: 'Enter your full name',
    required: true,
    autoComplete: 'name',
    validation: {
      minLength: 2,
      maxLength: 50,
    },
  },
  firstName: {
    name: 'firstName',
    type: 'text' as const,
    label: 'First Name',
    placeholder: 'Enter your first name',
    autoComplete: 'given-name',
    validation: {
      minLength: 1,
      maxLength: 25,
    },
  },
  lastName: {
    name: 'lastName',
    type: 'text' as const,
    label: 'Last Name',
    placeholder: 'Enter your last name',
    autoComplete: 'family-name',
    validation: {
      minLength: 1,
      maxLength: 25,
    },
  },
  bio: {
    name: 'bio',
    type: 'text' as const,
    label: 'Bio',
    placeholder: 'Tell us about yourself...',
    autoComplete: 'off',
    validation: {
      maxLength: 500,
    },
  },
  dateOfBirth: {
    name: 'dateOfBirth',
    type: 'date' as const,
    label: 'Date of Birth',
    placeholder: 'Select your birth date',
    autoComplete: 'bday',
    validation: {
      minAge: 13,
      maxAge: 120,
    },
  },
  phoneNumber: {
    name: 'phoneNumber',
    type: 'tel' as const,
    label: 'Phone Number',
    placeholder: '+1 (555) 123-4567',
    autoComplete: 'tel',
    validation: {
      pattern: /^\+?[\d\s\-\(\)]+$/,
    },
  },
  // Location
  country: {
    name: 'country',
    type: 'text' as const,
    label: 'Country',
    placeholder: 'Enter your country',
    autoComplete: 'country-name',
    validation: {
      minLength: 2,
      maxLength: 50,
    },
  },
  city: {
    name: 'city',
    type: 'text' as const,
    label: 'City',
    placeholder: 'Enter your city',
    autoComplete: 'address-level2',
    validation: {
      minLength: 1,
      maxLength: 50,
    },
  },
  timezone: {
    name: 'timezone',
    type: 'text' as const,
    label: 'Timezone',
    placeholder: 'Select your timezone',
    autoComplete: 'off',
    validation: {},
  },
  // Social Links
  website: {
    name: 'website',
    type: 'url' as const,
    label: 'Website',
    placeholder: 'https://yourwebsite.com',
    autoComplete: 'url',
    validation: {},
  },
  instagram: {
    name: 'instagram',
    type: 'text' as const,
    label: 'Instagram',
    placeholder: '@yourusername',
    autoComplete: 'off',
    validation: {},
  },
  twitter: {
    name: 'twitter',
    type: 'text' as const,
    label: 'Twitter',
    placeholder: '@yourusername',
    autoComplete: 'off',
    validation: {},
  },
  linkedin: {
    name: 'linkedin',
    type: 'url' as const,
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/yourprofile',
    autoComplete: 'url',
    validation: {},
  },
};

// Travel preferences options
const TRAVEL_STYLES = [
  { value: 'adventure', label: 'Adventure' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'budget', label: 'Budget' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'business', label: 'Business' },
];

const GROUP_SIZES = [
  { value: 'solo', label: 'Solo' },
  { value: 'small', label: 'Small (2-4 people)' },
  { value: 'medium', label: 'Medium (5-8 people)' },
  { value: 'large', label: 'Large (9+ people)' },
];

const ACCOMMODATION_TYPES = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'airbnb', label: 'Airbnb' },
  { value: 'camping', label: 'Camping' },
  { value: 'any', label: 'Any' },
];

const TRANSPORTATION_TYPES = [
  { value: 'flight', label: 'Flight' },
  { value: 'train', label: 'Train' },
  { value: 'bus', label: 'Bus' },
  { value: 'car', label: 'Car' },
  { value: 'any', label: 'Any' },
];

const TRAVEL_FREQUENCIES = [
  { value: 'rarely', label: 'Rarely' },
  { value: 'occasionally', label: 'Occasionally' },
  { value: 'frequently', label: 'Frequently' },
  { value: 'constantly', label: 'Constantly' },
];

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
];

const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
  readonly = false,
  showAdvanced = false,
  onCancel,
  className = '',
}) => {
  // Form state
  const [formData, setFormData] = useState<ProfileUpdate>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<'basic' | 'travel' | 'privacy' | 'social'>('basic');

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      const data: ProfileUpdate = {
        name: initialData.name,
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        bio: initialData.bio,
        dateOfBirth: initialData.dateOfBirth,
        phoneNumber: initialData.phoneNumber,
        location: initialData.location,
        travelPreferences: initialData.travelPreferences,
        socialLinks: initialData.socialLinks,
        privacySettings: initialData.privacySettings,
        notificationSettings: initialData.notificationSettings,
        accountSettings: initialData.accountSettings,
      };
      setFormData(data);
    }
  }, [initialData]);

  // Handle field changes
  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  }, [errors]);

  // Handle nested object changes
  const handleNestedChange = useCallback((parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof ProfileUpdate],
        [field]: value,
      },
    }));
  }, []);

  // Handle array changes
  const handleArrayChange = useCallback((field: string, value: string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = validateProfileUpdate(formData, initialData);
    if (!validation.isValid) {
      const fieldErrors: Record<string, string> = {};
      validation.errors.forEach(error => {
        fieldErrors[error.field] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error: any) {
      setErrors({ general: error.message || 'Failed to update profile' });
    }
  }, [formData, initialData, onSubmit]);

  // Render basic information section
  const renderBasicSection = () => (
    <div className="profile-form-section">
      <h3 className="profile-form-section-title">Basic Information</h3>
      
      <div className="profile-form-grid">
        <div className="profile-form-field">
          <label htmlFor="name" className="profile-form-label">
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className={`profile-form-input ${errors.name ? 'error' : ''}`}
            placeholder="Enter your full name"
            disabled={loading || readonly}
            required
          />
          {errors.name && <span className="profile-form-error">{errors.name}</span>}
        </div>

        <div className="profile-form-field">
          <label htmlFor="firstName" className="profile-form-label">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName || ''}
            onChange={(e) => handleFieldChange('firstName', e.target.value)}
            className={`profile-form-input ${errors.firstName ? 'error' : ''}`}
            placeholder="Enter your first name"
            disabled={loading || readonly}
          />
          {errors.firstName && <span className="profile-form-error">{errors.firstName}</span>}
        </div>

        <div className="profile-form-field">
          <label htmlFor="lastName" className="profile-form-label">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName || ''}
            onChange={(e) => handleFieldChange('lastName', e.target.value)}
            className={`profile-form-input ${errors.lastName ? 'error' : ''}`}
            placeholder="Enter your last name"
            disabled={loading || readonly}
          />
          {errors.lastName && <span className="profile-form-error">{errors.lastName}</span>}
        </div>

        <div className="profile-form-field">
          <label htmlFor="bio" className="profile-form-label">
            Bio
          </label>
          <textarea
            id="bio"
            value={formData.bio || ''}
            onChange={(e) => handleFieldChange('bio', e.target.value)}
            className={`profile-form-textarea ${errors.bio ? 'error' : ''}`}
            placeholder="Tell us about yourself..."
            rows={4}
            disabled={loading || readonly}
          />
          {errors.bio && <span className="profile-form-error">{errors.bio}</span>}
        </div>

        <div className="profile-form-field">
          <label htmlFor="dateOfBirth" className="profile-form-label">
            Date of Birth
          </label>
          <input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
            onChange={(e) => handleFieldChange('dateOfBirth', e.target.value ? new Date(e.target.value) : undefined)}
            className={`profile-form-input ${errors.dateOfBirth ? 'error' : ''}`}
            disabled={loading || readonly}
          />
          {errors.dateOfBirth && <span className="profile-form-error">{errors.dateOfBirth}</span>}
        </div>

        <div className="profile-form-field">
          <label htmlFor="phoneNumber" className="profile-form-label">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber || ''}
            onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
            className={`profile-form-input ${errors.phoneNumber ? 'error' : ''}`}
            placeholder="+1 (555) 123-4567"
            disabled={loading || readonly}
          />
          {errors.phoneNumber && <span className="profile-form-error">{errors.phoneNumber}</span>}
        </div>
      </div>
    </div>
  );

  // Render travel preferences section
  const renderTravelSection = () => (
    <div className="profile-form-section">
      <h3 className="profile-form-section-title">Travel Preferences</h3>
      
      <div className="profile-form-grid">
        <div className="profile-form-field">
          <label htmlFor="travelStyle" className="profile-form-label">
            Travel Style
          </label>
          <select
            id="travelStyle"
            value={formData.travelPreferences?.travelStyle || ''}
            onChange={(e) => handleNestedChange('travelPreferences', 'travelStyle', e.target.value)}
            className={`profile-form-select ${errors.travelStyle ? 'error' : ''}`}
            disabled={loading || readonly}
          >
            <option value="">Select travel style</option>
            {TRAVEL_STYLES.map(style => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
          {errors.travelStyle && <span className="profile-form-error">{errors.travelStyle}</span>}
        </div>

        <div className="profile-form-field">
          <label htmlFor="groupSize" className="profile-form-label">
            Preferred Group Size
          </label>
          <select
            id="groupSize"
            value={formData.travelPreferences?.groupSizePreference || ''}
            onChange={(e) => handleNestedChange('travelPreferences', 'groupSizePreference', e.target.value)}
            className={`profile-form-select ${errors.groupSize ? 'error' : ''}`}
            disabled={loading || readonly}
          >
            <option value="">Select group size</option>
            {GROUP_SIZES.map(size => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
          {errors.groupSize && <span className="profile-form-error">{errors.groupSize}</span>}
        </div>

        <div className="profile-form-field">
          <label htmlFor="accommodation" className="profile-form-label">
            Accommodation Preference
          </label>
          <select
            id="accommodation"
            value={formData.travelPreferences?.accommodationPreference || ''}
            onChange={(e) => handleNestedChange('travelPreferences', 'accommodationPreference', e.target.value)}
            className={`profile-form-select ${errors.accommodation ? 'error' : ''}`}
            disabled={loading || readonly}
          >
            <option value="">Select accommodation</option>
            {ACCOMMODATION_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.accommodation && <span className="profile-form-error">{errors.accommodation}</span>}
        </div>

        <div className="profile-form-field">
          <label htmlFor="transportation" className="profile-form-label">
            Transportation Preference
          </label>
          <select
            id="transportation"
            value={formData.travelPreferences?.transportationPreference || ''}
            onChange={(e) => handleNestedChange('travelPreferences', 'transportationPreference', e.target.value)}
            className={`profile-form-select ${errors.transportation ? 'error' : ''}`}
            disabled={loading || readonly}
          >
            <option value="">Select transportation</option>
            {TRANSPORTATION_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.transportation && <span className="profile-form-error">{errors.transportation}</span>}
        </div>

        <div className="profile-form-field">
          <label htmlFor="travelFrequency" className="profile-form-label">
            Travel Frequency
          </label>
          <select
            id="travelFrequency"
            value={formData.travelPreferences?.travelFrequency || ''}
            onChange={(e) => handleNestedChange('travelPreferences', 'travelFrequency', e.target.value)}
            className={`profile-form-select ${errors.travelFrequency ? 'error' : ''}`}
            disabled={loading || readonly}
          >
            <option value="">Select frequency</option>
            {TRAVEL_FREQUENCIES.map(freq => (
              <option key={freq.value} value={freq.value}>
                {freq.label}
              </option>
            ))}
          </select>
          {errors.travelFrequency && <span className="profile-form-error">{errors.travelFrequency}</span>}
        </div>

        <div className="profile-form-field">
          <label htmlFor="currency" className="profile-form-label">
            Preferred Currency
          </label>
          <select
            id="currency"
            value={formData.travelPreferences?.budgetRange?.currency || ''}
            onChange={(e) => handleNestedChange('travelPreferences', 'budgetRange', {
              ...formData.travelPreferences?.budgetRange,
              currency: e.target.value,
            })}
            className={`profile-form-select ${errors.currency ? 'error' : ''}`}
            disabled={loading || readonly}
          >
            <option value="">Select currency</option>
            {CURRENCIES.map(currency => (
              <option key={currency.value} value={currency.value}>
                {currency.label}
              </option>
            ))}
          </select>
          {errors.currency && <span className="profile-form-error">{errors.currency}</span>}
        </div>
      </div>
    </div>
  );

  // Render social links section
  const renderSocialSection = () => (
    <div className="profile-form-section">
      <h3 className="profile-form-section-title">Social Links</h3>
      
      <div className="profile-form-grid">
        <div className="profile-form-field">
          <label htmlFor="website" className="profile-form-label">
            Website
          </label>
          <input
            id="website"
            type="url"
            value={formData.socialLinks?.website || ''}
            onChange={(e) => handleNestedChange('socialLinks', 'website', e.target.value)}
            className={`profile-form-input ${errors.website ? 'error' : ''}`}
            placeholder="https://yourwebsite.com"
            disabled={loading || readonly}
          />
          {errors.website && <span className="profile-form-error">{errors.website}</span>}
        </div>

        <div className="profile-form-field">
          <label htmlFor="instagram" className="profile-form-label">
            Instagram
          </label>
          <input
            id="instagram"
            type="text"
            value={formData.socialLinks?.instagram || ''}
            onChange={(e) => handleNestedChange('socialLinks', 'instagram', e.target.value)}
            className={`profile-form-input ${errors.instagram ? 'error' : ''}`}
            placeholder="@yourusername"
            disabled={loading || readonly}
          />
          {errors.instagram && <span className="profile-form-error">{errors.instagram}</span>}
        </div>

        <div className="profile-form-field">
          <label htmlFor="twitter" className="profile-form-label">
            Twitter
          </label>
          <input
            id="twitter"
            type="text"
            value={formData.socialLinks?.twitter || ''}
            onChange={(e) => handleNestedChange('socialLinks', 'twitter', e.target.value)}
            className={`profile-form-input ${errors.twitter ? 'error' : ''}`}
            placeholder="@yourusername"
            disabled={loading || readonly}
          />
          {errors.twitter && <span className="profile-form-error">{errors.twitter}</span>}
        </div>

        <div className="profile-form-field">
          <label htmlFor="linkedin" className="profile-form-label">
            LinkedIn
          </label>
          <input
            id="linkedin"
            type="url"
            value={formData.socialLinks?.linkedin || ''}
            onChange={(e) => handleNestedChange('socialLinks', 'linkedin', e.target.value)}
            className={`profile-form-input ${errors.linkedin ? 'error' : ''}`}
            placeholder="https://linkedin.com/in/yourprofile"
            disabled={loading || readonly}
          />
          {errors.linkedin && <span className="profile-form-error">{errors.linkedin}</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`profile-form-container ${className}`}>
      <form onSubmit={handleSubmit} className="profile-form">
        {/* Section Navigation */}
        <div className="profile-form-navigation">
          <button
            type="button"
            className={`profile-form-nav-button ${activeSection === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveSection('basic')}
            disabled={loading || readonly}
          >
            Basic Info
          </button>
          <button
            type="button"
            className={`profile-form-nav-button ${activeSection === 'travel' ? 'active' : ''}`}
            onClick={() => setActiveSection('travel')}
            disabled={loading || readonly}
          >
            Travel
          </button>
          <button
            type="button"
            className={`profile-form-nav-button ${activeSection === 'social' ? 'active' : ''}`}
            onClick={() => setActiveSection('social')}
            disabled={loading || readonly}
          >
            Social
          </button>
          {showAdvanced && (
            <button
              type="button"
              className={`profile-form-nav-button ${activeSection === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveSection('privacy')}
              disabled={loading || readonly}
            >
              Privacy
            </button>
          )}
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="profile-form-error-general">
            {errors.general}
          </div>
        )}

        {/* Form Sections */}
        <div className="profile-form-content">
          {activeSection === 'basic' && renderBasicSection()}
          {activeSection === 'travel' && renderTravelSection()}
          {activeSection === 'social' && renderSocialSection()}
          {activeSection === 'privacy' && showAdvanced && (
            <div className="profile-form-section">
              <h3 className="profile-form-section-title">Privacy Settings</h3>
              <p className="profile-form-section-description">
                Advanced privacy settings will be implemented in a future update.
              </p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="profile-form-actions">
          {onCancel && (
            <button
              type="button"
              className="profile-form-cancel-button"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          )}
          
          <LoadingButton
            type="submit"
            loading={loading}
            loadingText="Saving..."
            className="profile-form-save-button"
            variant="primary"
            size="md"
          >
            Save Changes
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
