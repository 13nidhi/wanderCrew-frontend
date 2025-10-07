import { LoadingOverlay, LoadingSpinner } from '@components/common';
import ProfileForm from '@components/profile/ProfileForm';
import ProfilePicture from '@components/profile/ProfilePicture';
import { useAuth } from '@contexts/AuthContext';
import { useProfileCompletion, useProfileStatistics, useUserProfile } from '@hooks/useUserProfile';
import type { ProfileUpdate } from '@types/profile';
import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  
  // Determine if this is the current user's profile
  const isCurrentUser = !userId || userId === authUser?.id;
  const targetUserId = userId || authUser?.id;

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Hooks
  const {
    profile,
    loading,
    error,
    updating,
    updateProfile,
    uploadProfilePicture,
    deleteProfilePicture,
    refreshProfile,
  } = useUserProfile(targetUserId);

  const {
    statistics,
    loading: statsLoading,
  } = useProfileStatistics(targetUserId);

  const {
    completion,
    missingFields,
    getCompletionMessage,
    getCompletionColor,
  } = useProfileCompletion(profile);

  // Handle profile update
  const handleProfileUpdate = useCallback(async (updates: ProfileUpdate) => {
    try {
      await updateProfile(updates);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Error is handled by the hook
    }
  }, [updateProfile]);

  // Handle profile picture upload
  const handlePictureUpload = useCallback(async (file: File) => {
    try {
      await uploadProfilePicture(file);
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      // Error is handled by the hook
    }
  }, [uploadProfilePicture]);

  // Handle profile picture removal
  const handlePictureRemove = useCallback(async () => {
    try {
      await deleteProfilePicture();
    } catch (error) {
      console.error('Failed to remove profile picture:', error);
      // Error is handled by the hook
    }
  }, [deleteProfilePicture]);

  // Handle edit mode toggle
  const handleEditToggle = useCallback(() => {
    setIsEditing(!isEditing);
  }, [isEditing]);

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    refreshProfile();
  }, [refreshProfile]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-page-loading">
          <LoadingSpinner message="Loading profile..." />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-page-error">
          <div className="error-content">
            <h2>Error Loading Profile</h2>
            <p>{error}</p>
            <button onClick={refreshProfile} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No profile found
  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-page-not-found">
          <div className="not-found-content">
            <h2>Profile Not Found</h2>
            <p>The profile you're looking for doesn't exist or has been removed.</p>
            <button onClick={handleBack} className="back-button">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <LoadingOverlay isLoading={updating} message="Saving changes..." />
      
      {/* Profile Header */}
      <div className="profile-page-header">
        <div className="profile-header-content">
          <button onClick={handleBack} className="profile-back-button">
            <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <div className="profile-header-info">
            <h1 className="profile-page-title">
              {isCurrentUser ? 'My Profile' : `${profile.name}'s Profile`}
            </h1>
            <p className="profile-page-subtitle">
              {isCurrentUser ? 'Manage your profile and preferences' : 'View profile information'}
            </p>
          </div>

          {isCurrentUser && (
            <div className="profile-header-actions">
              <button
                onClick={handleEditToggle}
                className={`profile-edit-button ${isEditing ? 'editing' : ''}`}
                disabled={updating}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-page-content">
        <div className="profile-content-grid">
          {/* Profile Picture Section */}
          <div className="profile-picture-section">
            <ProfilePicture
              userId={profile.id}
              profilePicture={profile.profilePicture}
              size="large"
              editable={isCurrentUser && isEditing}
              onUpload={handlePictureUpload}
              onRemove={handlePictureRemove}
              loading={updating}
            />
            
            {isCurrentUser && (
              <div className="profile-completion">
                <div className="completion-header">
                  <h3>Profile Completion</h3>
                  <span className="completion-percentage">{completion}%</span>
                </div>
                <div className="completion-bar">
                  <div 
                    className="completion-fill"
                    style={{ 
                      width: `${completion}%`,
                      backgroundColor: getCompletionColor()
                    }}
                  />
                </div>
                <p className="completion-message">{getCompletionMessage()}</p>
                {missingFields.length > 0 && (
                  <div className="missing-fields">
                    <p>Complete your profile by adding:</p>
                    <ul>
                      {missingFields.slice(0, 3).map((field, index) => (
                        <li key={index}>{field}</li>
                      ))}
                      {missingFields.length > 3 && (
                        <li>and {missingFields.length - 3} more...</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Information Section */}
          <div className="profile-info-section">
            {isEditing ? (
              <ProfileForm
                initialData={profile}
                onSubmit={handleProfileUpdate}
                loading={updating}
                onCancel={handleCancelEdit}
                showAdvanced={showAdvanced}
                className="profile-edit-form"
              />
            ) : (
              <div className="profile-view">
                {/* Basic Information */}
                <div className="profile-section">
                  <h2 className="profile-section-title">Basic Information</h2>
                  <div className="profile-info-grid">
                    <div className="profile-info-item">
                      <label>Name</label>
                      <span>{profile.name}</span>
                    </div>
                    {profile.firstName && (
                      <div className="profile-info-item">
                        <label>First Name</label>
                        <span>{profile.firstName}</span>
                      </div>
                    )}
                    {profile.lastName && (
                      <div className="profile-info-item">
                        <label>Last Name</label>
                        <span>{profile.lastName}</span>
                      </div>
                    )}
                    {profile.bio && (
                      <div className="profile-info-item full-width">
                        <label>Bio</label>
                        <p>{profile.bio}</p>
                      </div>
                    )}
                    {profile.dateOfBirth && (
                      <div className="profile-info-item">
                        <label>Date of Birth</label>
                        <span>{new Date(profile.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                    )}
                    {profile.phoneNumber && (
                      <div className="profile-info-item">
                        <label>Phone Number</label>
                        <span>{profile.phoneNumber}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="profile-info-item">
                        <label>Location</label>
                        <span>
                          {[profile.location.city, profile.location.country]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Travel Preferences */}
                <div className="profile-section">
                  <h2 className="profile-section-title">Travel Preferences</h2>
                  <div className="profile-info-grid">
                    <div className="profile-info-item">
                      <label>Travel Style</label>
                      <span className="capitalize">{profile.travelPreferences.travelStyle}</span>
                    </div>
                    <div className="profile-info-item">
                      <label>Group Size</label>
                      <span className="capitalize">{profile.travelPreferences.groupSizePreference}</span>
                    </div>
                    <div className="profile-info-item">
                      <label>Accommodation</label>
                      <span className="capitalize">{profile.travelPreferences.accommodationPreference}</span>
                    </div>
                    <div className="profile-info-item">
                      <label>Transportation</label>
                      <span className="capitalize">{profile.travelPreferences.transportationPreference}</span>
                    </div>
                    <div className="profile-info-item">
                      <label>Travel Frequency</label>
                      <span className="capitalize">{profile.travelPreferences.travelFrequency}</span>
                    </div>
                    <div className="profile-info-item">
                      <label>Budget Range</label>
                      <span>
                        {profile.travelPreferences.budgetRange.currency} {profile.travelPreferences.budgetRange.min} - {profile.travelPreferences.budgetRange.max}
                      </span>
                    </div>
                    {profile.travelPreferences.interests.length > 0 && (
                      <div className="profile-info-item full-width">
                        <label>Interests</label>
                        <div className="interests-list">
                          {profile.travelPreferences.interests.map((interest, index) => (
                            <span key={index} className="interest-tag">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.travelPreferences.destinations.length > 0 && (
                      <div className="profile-info-item full-width">
                        <label>Preferred Destinations</label>
                        <div className="destinations-list">
                          {profile.travelPreferences.destinations.map((destination, index) => (
                            <span key={index} className="destination-tag">
                              {destination}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                {profile.socialLinks && (
                  <div className="profile-section">
                    <h2 className="profile-section-title">Social Links</h2>
                    <div className="profile-info-grid">
                      {profile.socialLinks.website && (
                        <div className="profile-info-item">
                          <label>Website</label>
                          <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer">
                            {profile.socialLinks.website}
                          </a>
                        </div>
                      )}
                      {profile.socialLinks.instagram && (
                        <div className="profile-info-item">
                          <label>Instagram</label>
                          <a href={`https://instagram.com/${profile.socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                            {profile.socialLinks.instagram}
                          </a>
                        </div>
                      )}
                      {profile.socialLinks.twitter && (
                        <div className="profile-info-item">
                          <label>Twitter</label>
                          <a href={`https://twitter.com/${profile.socialLinks.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                            {profile.socialLinks.twitter}
                          </a>
                        </div>
                      )}
                      {profile.socialLinks.linkedin && (
                        <div className="profile-info-item">
                          <label>LinkedIn</label>
                          <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Statistics */}
                {isCurrentUser && statistics && (
                  <div className="profile-section">
                    <h2 className="profile-section-title">Statistics</h2>
                    <div className="profile-stats-grid">
                      <div className="stat-item">
                        <span className="stat-value">{statistics.totalTrips}</span>
                        <span className="stat-label">Total Trips</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{statistics.countriesVisited}</span>
                        <span className="stat-label">Countries Visited</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{statistics.citiesVisited}</span>
                        <span className="stat-label">Cities Visited</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{statistics.totalFriends}</span>
                        <span className="stat-label">Friends</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
