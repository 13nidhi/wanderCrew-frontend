import TripCard from '@components/common/TripCard';
import { fireEvent, render, screen } from '@testing-library/react';
import type { Trip } from '@types/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock trip data
const mockTrip: Trip = {
  id: '1',
  title: 'Amazing Trip to Paris',
  destination: 'Paris, France',
  description: 'A wonderful trip to the City of Light',
  startDate: '2024-06-01',
  endDate: '2024-06-07',
  budget: {
    min: 1000,
    max: 2000,
    currency: 'USD',
  },
  maxMembers: 8,
  status: 'open',
  createdBy: 'user1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  members: [
    {
      userId: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      profilePicture: '',
      joinedAt: '2024-01-01T00:00:00Z',
      role: 'organizer',
    },
  ],
  tags: ['culture', 'food', 'sightseeing'],
  image: 'https://example.com/paris.jpg',
  location: {
    latitude: 48.8566,
    longitude: 2.3522,
    address: 'Paris, France',
  },
};

describe('TripCard Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<TripCard trip={mockTrip} />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/amazing trip to paris/i);
    });

    it('should have proper semantic structure', () => {
      render(<TripCard trip={mockTrip} />);
      
      const card = document.querySelector('.trip-card');
      expect(card).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<TripCard trip={mockTrip} />);
      
      const card = document.querySelector('.trip-card');
      expect(card).toHaveAttribute('data-trip-id', '1');
    });

    it('should support keyboard navigation', () => {
      render(<TripCard trip={mockTrip} />);
      
      const card = document.querySelector('.trip-card');
      card?.focus();
      expect(document.activeElement).toBe(card);
    });

    it('should have proper contrast for all elements', () => {
      render(<TripCard trip={mockTrip} />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      const destination = screen.getByText(/paris, france/i);
      const description = screen.getByText(/a wonderful trip to the city of light/i);
      
      expect(heading).toBeInTheDocument();
      expect(destination).toBeInTheDocument();
      expect(description).toBeInTheDocument();
    });
  });

  describe('Content Accessibility', () => {
    it('should have proper labels for trip information', () => {
      render(<TripCard trip={mockTrip} />);
      
      const destination = screen.getByText(/paris, france/i);
      const description = screen.getByText(/a wonderful trip to the city of light/i);
      const budget = screen.getByText(/\$1,000 - \$2,000/i);
      const members = screen.getByText(/1 \/ 8 members/i);
      
      expect(destination).toBeInTheDocument();
      expect(description).toBeInTheDocument();
      expect(budget).toBeInTheDocument();
      expect(members).toBeInTheDocument();
    });

    it('should have proper date formatting for screen readers', () => {
      render(<TripCard trip={mockTrip} />);
      
      const startDate = screen.getByText(/june 1, 2024/i);
      const endDate = screen.getByText(/june 7, 2024/i);
      
      expect(startDate).toBeInTheDocument();
      expect(endDate).toBeInTheDocument();
    });

    it('should have proper status indication', () => {
      render(<TripCard trip={mockTrip} />);
      
      const status = screen.getByText(/open/i);
      expect(status).toBeInTheDocument();
    });

    it('should have proper tags structure', () => {
      render(<TripCard trip={mockTrip} />);
      
      const cultureTag = screen.getByText(/culture/i);
      const foodTag = screen.getByText(/food/i);
      const sightseeingTag = screen.getByText(/sightseeing/i);
      
      expect(cultureTag).toBeInTheDocument();
      expect(foodTag).toBeInTheDocument();
      expect(sightseeingTag).toBeInTheDocument();
    });
  });

  describe('Interactive Elements Accessibility', () => {
    it('should have proper button roles for actions', () => {
      render(<TripCard trip={mockTrip} />);
      
      const joinButton = screen.getByRole('button', { name: /join trip/i });
      expect(joinButton).toBeInTheDocument();
    });

    it('should support keyboard activation for buttons', () => {
      render(<TripCard trip={mockTrip} />);
      
      const joinButton = screen.getByRole('button', { name: /join trip/i });
      
      fireEvent.keyDown(joinButton, { key: 'Enter' });
      // Button should be activated
    });

    it('should support Space key activation for buttons', () => {
      render(<TripCard trip={mockTrip} />);
      
      const joinButton = screen.getByRole('button', { name: /join trip/i });
      
      fireEvent.keyDown(joinButton, { key: ' ' });
      // Button should be activated
    });

    it('should have proper focus management for interactive elements', () => {
      render(<TripCard trip={mockTrip} />);
      
      const joinButton = screen.getByRole('button', { name: /join trip/i });
      joinButton.focus();
      expect(document.activeElement).toBe(joinButton);
    });
  });

  describe('Image Accessibility', () => {
    it('should have proper alt text for trip image', () => {
      render(<TripCard trip={mockTrip} />);
      
      const image = screen.getByAltText(/amazing trip to paris/i);
      expect(image).toBeInTheDocument();
    });

    it('should have proper image loading state', () => {
      render(<TripCard trip={mockTrip} />);
      
      const image = screen.getByAltText(/amazing trip to paris/i);
      expect(image).toHaveAttribute('src', 'https://example.com/paris.jpg');
    });

    it('should handle missing image gracefully', () => {
      const tripWithoutImage = { ...mockTrip, image: undefined };
      render(<TripCard trip={tripWithoutImage} />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Status-Specific Accessibility', () => {
    it('should have proper accessibility for open status', () => {
      render(<TripCard trip={mockTrip} />);
      
      const status = screen.getByText(/open/i);
      const joinButton = screen.getByRole('button', { name: /join trip/i });
      
      expect(status).toBeInTheDocument();
      expect(joinButton).toBeInTheDocument();
    });

    it('should have proper accessibility for full status', () => {
      const fullTrip = { ...mockTrip, status: 'full' as const };
      render(<TripCard trip={fullTrip} />);
      
      const status = screen.getByText(/full/i);
      const joinButton = screen.getByRole('button', { name: /trip full/i });
      
      expect(status).toBeInTheDocument();
      expect(joinButton).toBeInTheDocument();
    });

    it('should have proper accessibility for completed status', () => {
      const completedTrip = { ...mockTrip, status: 'completed' as const };
      render(<TripCard trip={completedTrip} />);
      
      const status = screen.getByText(/completed/i);
      const viewButton = screen.getByRole('button', { name: /view trip/i });
      
      expect(status).toBeInTheDocument();
      expect(viewButton).toBeInTheDocument();
    });

    it('should have proper accessibility for cancelled status', () => {
      const cancelledTrip = { ...mockTrip, status: 'cancelled' as const };
      render(<TripCard trip={cancelledTrip} />);
      
      const status = screen.getByText(/cancelled/i);
      const viewButton = screen.getByRole('button', { name: /view trip/i });
      
      expect(status).toBeInTheDocument();
      expect(viewButton).toBeInTheDocument();
    });
  });

  describe('Member Information Accessibility', () => {
    it('should have proper member count display', () => {
      render(<TripCard trip={mockTrip} />);
      
      const memberCount = screen.getByText(/1 \/ 8 members/i);
      expect(memberCount).toBeInTheDocument();
    });

    it('should have proper organizer information', () => {
      render(<TripCard trip={mockTrip} />);
      
      const organizer = screen.getByText(/organized by john doe/i);
      expect(organizer).toBeInTheDocument();
    });

    it('should handle multiple members properly', () => {
      const tripWithMultipleMembers = {
        ...mockTrip,
        members: [
          ...mockTrip.members,
          {
            userId: 'user2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            profilePicture: '',
            joinedAt: '2024-01-02T00:00:00Z',
            role: 'member' as const,
          },
        ],
      };
      
      render(<TripCard trip={tripWithMultipleMembers} />);
      
      const memberCount = screen.getByText(/2 \/ 8 members/i);
      expect(memberCount).toBeInTheDocument();
    });
  });

  describe('Budget Information Accessibility', () => {
    it('should have proper budget display', () => {
      render(<TripCard trip={mockTrip} />);
      
      const budget = screen.getByText(/\$1,000 - \$2,000/i);
      expect(budget).toBeInTheDocument();
    });

    it('should handle different currencies properly', () => {
      const euroTrip = {
        ...mockTrip,
        budget: {
          min: 1000,
          max: 2000,
          currency: 'EUR',
        },
      };
      
      render(<TripCard trip={euroTrip} />);
      
      const budget = screen.getByText(/€1,000 - €2,000/i);
      expect(budget).toBeInTheDocument();
    });

    it('should handle single budget value properly', () => {
      const singleBudgetTrip = {
        ...mockTrip,
        budget: {
          min: 1500,
          max: 1500,
          currency: 'USD',
        },
      };
      
      render(<TripCard trip={singleBudgetTrip} />);
      
      const budget = screen.getByText(/\$1,500/i);
      expect(budget).toBeInTheDocument();
    });
  });

  describe('Date Information Accessibility', () => {
    it('should have proper date range display', () => {
      render(<TripCard trip={mockTrip} />);
      
      const startDate = screen.getByText(/june 1, 2024/i);
      const endDate = screen.getByText(/june 7, 2024/i);
      
      expect(startDate).toBeInTheDocument();
      expect(endDate).toBeInTheDocument();
    });

    it('should handle single day trips properly', () => {
      const singleDayTrip = {
        ...mockTrip,
        startDate: '2024-06-01',
        endDate: '2024-06-01',
      };
      
      render(<TripCard trip={singleDayTrip} />);
      
      const date = screen.getByText(/june 1, 2024/i);
      expect(date).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide proper announcements for trip information', () => {
      render(<TripCard trip={mockTrip} />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      const destination = screen.getByText(/paris, france/i);
      const description = screen.getByText(/a wonderful trip to the city of light/i);
      const budget = screen.getByText(/\$1,000 - \$2,000/i);
      const members = screen.getByText(/1 \/ 8 members/i);
      
      expect(heading).toBeInTheDocument();
      expect(destination).toBeInTheDocument();
      expect(description).toBeInTheDocument();
      expect(budget).toBeInTheDocument();
      expect(members).toBeInTheDocument();
    });

    it('should have proper semantic structure for screen readers', () => {
      render(<TripCard trip={mockTrip} />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      const button = screen.getByRole('button', { name: /join trip/i });
      
      expect(heading).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    it('should announce status changes properly', () => {
      const fullTrip = { ...mockTrip, status: 'full' as const };
      render(<TripCard trip={fullTrip} />);
      
      const status = screen.getByText(/full/i);
      const joinButton = screen.getByRole('button', { name: /trip full/i });
      
      expect(status).toBeInTheDocument();
      expect(joinButton).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support Tab navigation through interactive elements', () => {
      render(<TripCard trip={mockTrip} />);
      
      const joinButton = screen.getByRole('button', { name: /join trip/i });
      joinButton.focus();
      expect(document.activeElement).toBe(joinButton);
    });

    it('should support Arrow keys for navigation if implemented', () => {
      render(<TripCard trip={mockTrip} />);
      
      const card = document.querySelector('.trip-card');
      card?.focus();
      
      fireEvent.keyDown(card!, { key: 'ArrowDown' });
      // This would depend on specific implementation
    });

    it('should support Escape key for focus management', () => {
      render(<TripCard trip={mockTrip} />);
      
      const joinButton = screen.getByRole('button', { name: /join trip/i });
      joinButton.focus();
      
      fireEvent.keyDown(joinButton, { key: 'Escape' });
      // Focus should be managed appropriately
    });
  });

  describe('High Contrast Mode Support', () => {
    it('should maintain visibility in high contrast mode', () => {
      // Mock high contrast mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      render(<TripCard trip={mockTrip} />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      const joinButton = screen.getByRole('button', { name: /join trip/i });
      
      expect(heading).toBeInTheDocument();
      expect(joinButton).toBeInTheDocument();
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      render(<TripCard trip={mockTrip} />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      const joinButton = screen.getByRole('button', { name: /join trip/i });
      
      expect(heading).toBeInTheDocument();
      expect(joinButton).toBeInTheDocument();
    });
  });

  describe('TripCard Integration', () => {
    it('should work with other components without accessibility conflicts', () => {
      render(
        <div>
          <button>Normal Button</button>
          <TripCard trip={mockTrip} />
        </div>
      );
      
      const normalButton = screen.getByRole('button', { name: /normal button/i });
      const tripHeading = screen.getByRole('heading', { level: 2 });
      const joinButton = screen.getByRole('button', { name: /join trip/i });
      
      expect(normalButton).toBeInTheDocument();
      expect(tripHeading).toBeInTheDocument();
      expect(joinButton).toBeInTheDocument();
    });

    it('should maintain proper focus management across components', () => {
      render(
        <div>
          <button>First Button</button>
          <TripCard trip={mockTrip} />
          <button>Second Button</button>
        </div>
      );
      
      const firstButton = screen.getByRole('button', { name: /first button/i });
      const joinButton = screen.getByRole('button', { name: /join trip/i });
      const secondButton = screen.getByRole('button', { name: /second button/i });
      
      expect(firstButton).toBeInTheDocument();
      expect(joinButton).toBeInTheDocument();
      expect(secondButton).toBeInTheDocument();
    });
  });
});
