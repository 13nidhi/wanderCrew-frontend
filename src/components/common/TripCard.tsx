import type { TripCardProps } from '@types/components';
import React from 'react';
import { Link } from 'react-router-dom';

const TripCard: React.FC<TripCardProps> = ({
  trip,
  onJoin,
  onView,
  showActions = true,
  variant = 'grid',
  className = '',
}) => {
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatBudget = (budget: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(budget);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'open':
        return 'trip-card-status-open';
      case 'full':
        return 'trip-card-status-full';
      case 'ongoing':
        return 'trip-card-status-ongoing';
      default:
        return 'trip-card-status-open';
    }
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onJoin?.(trip.id);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onView?.(trip.id);
  };

  return (
    <div className={`trip-card ${variant === 'list' ? 'flex' : ''} ${className}`}>
      <Link to={`/trips/${trip.id}`} className="block">
        {/* Trip Image */}
        <div className={`${variant === 'list' ? 'w-48 h-32' : 'w-full h-48'} relative overflow-hidden`}>
          <img
            src={trip.image || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop'}
            alt={trip.title}
            className="trip-card-image w-full h-full object-cover"
          />
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={`trip-card-status ${getStatusColor(trip.status)}`}>
              {trip.status}
            </span>
          </div>

          {/* Action Buttons Overlay */}
          {showActions && (
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button
                onClick={handleViewClick}
                className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
                aria-label="View trip details"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              
              {trip.status === 'open' && (
                <button
                  onClick={handleJoinClick}
                  className="w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary-hover transition-all"
                  aria-label="Join trip"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Trip Content */}
        <div className={`trip-card-content ${variant === 'list' ? 'flex-1' : ''}`}>
          <h3 className="trip-card-title">{trip.title}</h3>
          <p className="trip-card-destination">
            📍 {trip.destination}
          </p>
          
          <div className="trip-card-meta">
            <span className="trip-card-date">
              📅 {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </span>
            <span className="trip-card-budget">
              {formatBudget(trip.budget)}
            </span>
          </div>

          <div className="trip-card-footer">
            <div className="trip-card-members">
              <div className="flex -space-x-2">
                {trip.members.slice(0, 3).map((member, index) => (
                  <div
                    key={member.id}
                    className="w-6 h-6 rounded-full border-2 border-white bg-background-secondary flex items-center justify-center text-xs font-medium"
                    title={member.name}
                  >
                    {member.profilePicture ? (
                      <img
                        src={member.profilePicture}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      member.name.charAt(0).toUpperCase()
                    )}
                  </div>
                ))}
                {trip.members.length > 3 && (
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-background-secondary flex items-center justify-center text-xs font-medium">
                    +{trip.members.length - 3}
                  </div>
                )}
              </div>
              <span className="text-xs text-secondary">
                {trip.members.length}/{trip.maxMembers} members
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default TripCard;
