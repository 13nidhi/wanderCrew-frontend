import type { BaseComponentProps } from '@types/components';
import React from 'react';

interface RightSidebarProps extends BaseComponentProps {
  hidden?: boolean;
}

interface FeaturedTraveler {
  readonly id: string;
  readonly name: string;
  readonly location: string;
  readonly specialty: string;
  readonly verified: boolean;
  readonly avatar: string;
  readonly photos: string[];
}

const featuredTravelers: FeaturedTraveler[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    location: 'United States',
    specialty: 'Adventure',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face',
    photos: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=60&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=80&h=60&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=80&h=60&fit=crop',
    ],
  },
  {
    id: '2',
    name: 'Marco Silva',
    location: 'Brazil',
    specialty: 'Culture',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
    photos: [
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=80&h=60&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=60&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=80&h=60&fit=crop',
    ],
  },
  {
    id: '3',
    name: 'Yuki Tanaka',
    location: 'Japan',
    specialty: 'Nature',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
    photos: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=60&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=80&h=60&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=80&h=60&fit=crop',
    ],
  },
];

const RightSidebar: React.FC<RightSidebarProps> = ({
  hidden = false,
  className = '',
}) => {
  return (
    <aside className={`right-sidebar ${hidden ? 'hidden' : ''} ${className}`}>
      <div className="right-sidebar-content">
        {/* Featured Travelers Section */}
        <div className="right-sidebar-section">
          <h2 className="right-sidebar-title">
            Top 3 Popular Travelers
            <span className="right-sidebar-info" title="Based on trip ratings and community engagement">
              i
            </span>
          </h2>

          {featuredTravelers.map((traveler) => (
            <div key={traveler.id} className="featured-traveler">
              <div className="traveler-header">
                <div className="avatar avatar-md">
                  <img src={traveler.avatar} alt={traveler.name} />
                </div>
                <div className="traveler-info">
                  <div className="traveler-name">
                    {traveler.name}
                    {traveler.verified && (
                      <span className="traveler-verified" title="Verified traveler">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="traveler-location">
                    {traveler.location} · {traveler.specialty}
                  </div>
                </div>
                <button className="traveler-hire-btn">
                  Connect
                </button>
              </div>
              <div className="traveler-photos">
                {traveler.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`${traveler.name}'s travel photo ${index + 1}`}
                    className="traveler-photo"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats Section */}
        <div className="right-sidebar-section">
          <h2 className="right-sidebar-title">Community Stats</h2>
          <div className="card">
            <div className="card-body">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-secondary">Active Trips</span>
                <span className="font-semibold text-primary">1,247</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-secondary">Travelers</span>
                <span className="font-semibold text-primary">3,891</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-secondary">Countries</span>
                <span className="font-semibold text-primary">67</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">Success Rate</span>
                <span className="font-semibold text-success">94%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Destinations */}
        <div className="right-sidebar-section">
          <h2 className="right-sidebar-title">Trending Destinations</h2>
          <div className="space-y-3">
            {[
              { name: 'Bali, Indonesia', travelers: 156, trend: '+12%' },
              { name: 'Santorini, Greece', travelers: 134, trend: '+8%' },
              { name: 'Kyoto, Japan', travelers: 98, trend: '+15%' },
              { name: 'Reykjavik, Iceland', travelers: 87, trend: '+22%' },
            ].map((destination, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-background-secondary rounded-lg">
                <div>
                  <div className="font-medium text-sm">{destination.name}</div>
                  <div className="text-xs text-secondary">{destination.travelers} travelers</div>
                </div>
                <div className="text-xs font-medium text-success">{destination.trend}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
