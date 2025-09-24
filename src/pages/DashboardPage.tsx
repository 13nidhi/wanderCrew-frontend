import TripCard from '@components/common/TripCard';
import type { Trip } from '@types/index';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock data for demonstration
const mockTrips: Trip[] = [
  {
    id: '1',
    title: 'Bali Adventure Getaway',
    destination: 'Bali, Indonesia',
    description: 'Explore the beautiful beaches and cultural sites of Bali',
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-03-22'),
    budget: 1200,
    maxMembers: 8,
    status: 'open',
    createdBy: 'user1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    members: [
      { id: 'user1', name: 'Sarah Johnson', email: 'sarah@example.com', profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face' },
      { id: 'user2', name: 'Mike Chen', email: 'mike@example.com', profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' },
    ],
    tags: ['adventure', 'beach', 'culture'],
    image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    title: 'European City Tour',
    destination: 'Paris, France',
    description: 'Discover the charm of Paris with fellow travelers',
    startDate: new Date('2024-04-10'),
    endDate: new Date('2024-04-17'),
    budget: 1800,
    maxMembers: 6,
    status: 'open',
    createdBy: 'user2',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    members: [
      { id: 'user2', name: 'Mike Chen', email: 'mike@example.com', profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' },
    ],
    tags: ['culture', 'city', 'art'],
    image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    title: 'Mountain Hiking Expedition',
    destination: 'Swiss Alps, Switzerland',
    description: 'Challenge yourself with high-altitude hiking',
    startDate: new Date('2024-05-05'),
    endDate: new Date('2024-05-12'),
    budget: 2200,
    maxMembers: 4,
    status: 'full',
    createdBy: 'user3',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    members: [
      { id: 'user3', name: 'Emma Wilson', email: 'emma@example.com', profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face' },
      { id: 'user4', name: 'David Lee', email: 'david@example.com', profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
      { id: 'user5', name: 'Lisa Park', email: 'lisa@example.com', profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face' },
      { id: 'user6', name: 'Alex Brown', email: 'alex@example.com', profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face' },
    ],
    tags: ['adventure', 'hiking', 'nature'],
    image: 'https://images.unsplash.com/photo-1464822759844-d150baec1b4a?w=400&h=300&fit=crop',
  },
];

const categories = [
  { id: 'all', label: 'All' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'culture', label: 'Culture' },
  { id: 'beach', label: 'Beach' },
  { id: 'city', label: 'City' },
  { id: 'nature', label: 'Nature' },
];

const DashboardPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredTrips = mockTrips.filter(trip => {
    const matchesSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || trip.tags.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleJoinTrip = (tripId: string) => {
    console.log('Joining trip:', tripId);
    // TODO: Implement join trip functionality
  };

  const handleViewTrip = (tripId: string) => {
    console.log('Viewing trip:', tripId);
    // TODO: Implement view trip functionality
  };

  return (
    <div>
      {/* Content Header */}
      <div className="content-header">
        <h1 className="content-title">Welcome Mate!</h1>
        <p className="content-subtitle">
          Explore Some Beautiful Trips Today ✨
        </p>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for amazing trips"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button className="search-button">
          Search
        </button>
      </div>

      {/* Trending Section */}
      <div className="section-header">
        <h2 className="section-title">Trending Trips of The Week</h2>
        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-filter ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Trips Grid */}
      <div className={`trips-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
        {filteredTrips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onJoin={handleJoinTrip}
            onView={handleViewTrip}
            variant={viewMode}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredTrips.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold text-primary mb-2">No trips found</h3>
          <p className="text-secondary mb-6">
            Try adjusting your search or browse different categories
          </p>
          <Link to="/create-trip" className="btn btn-primary">
            Create Your First Trip
          </Link>
        </div>
      )}

      {/* Create Trip CTA */}
      <div className="mt-12 text-center">
        <div className="card max-w-md mx-auto">
          <div className="card-body text-center">
            <div className="text-4xl mb-4">✈️</div>
            <h3 className="text-lg font-semibold mb-2">Ready to Travel?</h3>
            <p className="text-secondary mb-4">
              Create your own trip and invite fellow travelers to join you
            </p>
            <Link to="/create-trip" className="btn btn-primary btn-full">
              Create New Trip
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
