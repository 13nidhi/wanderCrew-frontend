# Phase 2: Core Trip Features

**Duration Estimate:** 3-4 weeks  
**Goal:** Implement trip creation, discovery, and joining functionality for web  
**Risk Level:** Medium  

---

## Phase Overview

This phase implements the core functionality of WanderGroup web application - trip creation, discovery, filtering, and the join request workflow. Users will be able to create trips, browse available trips, and request to join groups that match their interests through a responsive web interface.

## Task Breakdown

### Task 2.1: Trip Data Models & Types
**Description:** Define TypeScript interfaces and Firestore data models for trips, join requests, and related entities.

**Acceptance Criteria:**
- Complete Trip interface with all required fields
- JoinRequest interface with status tracking
- Firestore collection structure defined
- Type-safe data validation functions
- Database indexes configured for efficient queries

**Estimated Complexity:** Simple  
**Dependencies:** Phase 1 complete  
**Files Created:**
- `src/types/trip.ts`
- `src/types/joinRequest.ts`
- `firestore.indexes.json`

**Code Example:**
```typescript
// src/types/trip.ts
export interface Trip {
  id: string;
  title: string;
  destination: string;
  description: string;
  startDate: Date;
  endDate: Date;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  maxGroupSize: number;
  currentGroupSize: number;
  status: 'open' | 'full' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  requirements: string[];
  itinerary?: Itinerary;
  members: TripMember[];
  joinRequests: string[]; // JoinRequest IDs
}

export interface TripMember {
  userId: string;
  joinedAt: Date;
  role: 'admin' | 'member';
  status: 'active' | 'left' | 'removed';
}

export interface JoinRequest {
  id: string;
  tripId: string;
  userId: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface TripFilters {
  destination?: string;
  startDate?: Date;
  endDate?: Date;
  budgetRange?: {
    min: number;
    max: number;
  };
  maxGroupSize?: number;
  tags?: string[];
  status?: Trip['status'][];
}
```

### Task 2.2: Trip Service Layer Implementation
**Description:** Create service functions for all trip-related CRUD operations and business logic.

**Acceptance Criteria:**
- Create, read, update, delete operations for trips
- Join request workflow functions
- Trip filtering and search functionality
- Proper error handling and validation
- Optimistic updates for better UX

**Estimated Complexity:** Complex  
**Dependencies:** Task 2.1  
**Files Created:**
- `src/services/tripService.ts`
- `src/services/joinRequestService.ts`
- `src/utils/tripValidation.ts`

**Code Example:**
```typescript
// src/services/tripService.ts
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Trip, TripFilters, JoinRequest } from '../types';

export async function createTrip(tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const tripsRef = collection(db, 'trips');
  
  const newTrip = {
    ...tripData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    currentGroupSize: 1, // Creator is first member
    members: [{
      userId: tripData.createdBy,
      joinedAt: Timestamp.now(),
      role: 'admin',
      status: 'active'
    }]
  };

  const docRef = await addDoc(tripsRef, newTrip);
  return docRef.id;
}

export async function getTrips(filters?: TripFilters): Promise<Trip[]> {
  const tripsRef = collection(db, 'trips');
  let q = query(tripsRef, orderBy('createdAt', 'desc'));

  // Apply filters
  if (filters?.destination) {
    q = query(q, where('destination', '==', filters.destination));
  }
  
  if (filters?.status) {
    q = query(q, where('status', 'in', filters.status));
  }

  // Add budget range filter (requires composite index)
  if (filters?.budgetRange) {
    q = query(
      q,
      where('budget.min', '<=', filters.budgetRange.max),
      where('budget.max', '>=', filters.budgetRange.min)
    );
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Trip));
}

export async function joinTrip(tripId: string, userId: string, message: string): Promise<string> {
  const joinRequest: Omit<JoinRequest, 'id'> = {
    tripId,
    userId,
    message,
    status: 'pending',
    createdAt: new Date()
  };

  const joinRequestsRef = collection(db, 'joinRequests');
  const docRef = await addDoc(joinRequestsRef, joinRequest);
  
  // Update trip's join requests array
  const tripRef = doc(db, 'trips', tripId);
  await updateDoc(tripRef, {
    joinRequests: [...(await getDoc(tripRef)).data()?.joinRequests || [], docRef.id]
  });

  return docRef.id;
}

export async function approveJoinRequest(requestId: string, adminUserId: string): Promise<void> {
  const requestRef = doc(db, 'joinRequests', requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) {
    throw new Error('Join request not found');
  }

  const request = requestSnap.data() as JoinRequest;
  const tripRef = doc(db, 'trips', request.tripId);
  const tripSnap = await getDoc(tripRef);
  
  if (!tripSnap.exists()) {
    throw new Error('Trip not found');
  }

  const trip = tripSnap.data() as Trip;

  // Check if trip is full
  if (trip.currentGroupSize >= trip.maxGroupSize) {
    throw new Error('Trip is already full');
  }

  // Update join request status
  await updateDoc(requestRef, {
    status: 'approved',
    reviewedAt: Timestamp.now(),
    reviewedBy: adminUserId
  });

  // Add user to trip members
  const newMember = {
    userId: request.userId,
    joinedAt: Timestamp.now(),
    role: 'member',
    status: 'active'
  };

  await updateDoc(tripRef, {
    members: [...trip.members, newMember],
    currentGroupSize: trip.currentGroupSize + 1,
    status: trip.currentGroupSize + 1 >= trip.maxGroupSize ? 'full' : trip.status
  });
}
```

### Task 2.3: Trip Dashboard Page Implementation
**Description:** Create the main dashboard page showing available trips with filtering and search capabilities.

**Acceptance Criteria:**
- Responsive grid/list view of available trips
- Filter sidebar with destination, date, budget filters
- Real-time search functionality
- Infinite scroll/pagination for performance
- Loading skeleton screens
- Empty states with call-to-action
- Mobile-responsive design

**Estimated Complexity:** Complex  
**Dependencies:** Task 2.2  
**Files Created:**
- `src/pages/dashboard/DashboardPage.tsx`
- `src/components/trip/TripCard.tsx`
- `src/components/filters/TripFilters.tsx`
- `src/components/common/InfiniteScroll.tsx`
- `src/hooks/useTrips.ts`

**Code Example:**
```typescript
// src/pages/dashboard/DashboardPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Trip, TripFilters } from '../../types';
import { getTrips } from '../../services/tripService';
import TripCard from '../../components/trip/TripCard';
import TripFilters from '../../components/filters/TripFilters';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import InfiniteScroll from '../../components/common/InfiniteScroll';
import { useDebounce } from '../../hooks/useDebounce';
import './DashboardPage.css';

export default function DashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TripFilters>({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Sync filters with URL params
  useEffect(() => {
    const urlFilters = Object.fromEntries(searchParams);
    if (Object.keys(urlFilters).length > 0) {
      setFilters(urlFilters as TripFilters);
    }
  }, [searchParams]);

  useEffect(() => {
    loadTrips(true); // Reset on filter/search change
  }, [filters, debouncedSearchQuery]);

  const loadTrips = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }
      
      const currentPage = reset ? 1 : page;
      const fetchedTrips = await getTrips({
        ...filters,
        search: debouncedSearchQuery,
        status: ['open'],
        page: currentPage,
        limit: 12
      });
      
      if (reset) {
        setTrips(fetchedTrips.trips);
      } else {
        setTrips(prev => [...prev, ...fetchedTrips.trips]);
      }
      
      setHasMore(fetchedTrips.hasMore);
      if (!reset) setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: TripFilters) => {
    setFilters(newFilters);
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value.toString());
    });
    setSearchParams(params);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadTrips(false);
    }
  };

  if (loading && trips.length === 0) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Discover Amazing Trips</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <div className="dashboard-content">
          <LoadingSkeleton type="trip-card" count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Discover Amazing Trips</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button 
            className="mobile-filter-toggle"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            Filters
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <aside className={`filters-sidebar ${showMobileFilters ? 'mobile-open' : ''}`}>
          <TripFilters
            filters={filters}
            onChange={handleFilterChange}
            onClose={() => setShowMobileFilters(false)}
          />
        </aside>

        <main className="trips-grid">
          {trips.length === 0 && !loading ? (
            <div className="empty-state">
              <h3>No trips found</h3>
              <p>Be the first to create an amazing trip!</p>
              <button 
                onClick={() => window.location.href = '/create-trip'}
                className="create-trip-button"
              >
                Create Trip
              </button>
            </div>
          ) : (
            <InfiniteScroll
              items={trips}
              renderItem={(trip) => <TripCard key={trip.id} trip={trip} />}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              loading={loading}
            />
          )}
        </main>
      </div>
    </div>
  );
}
```

### Task 2.4: Trip Creation Flow Implementation
**Description:** Create multi-step trip creation form with validation and image upload capabilities.

**Acceptance Criteria:**
- Multi-step responsive form (Basic Info → Details → Requirements)
- Real-time form validation with error messages
- Date picker with calendar widget
- Interactive budget range selector
- Drag-and-drop image upload for trip photos
- Auto-save draft functionality (localStorage)
- Preview mode before publishing
- Mobile-responsive design

**Estimated Complexity:** Complex  
**Dependencies:** Task 2.2  
**Files Created:**
- `src/pages/trips/CreateTripPage.tsx`
- `src/components/forms/TripForm.tsx`
- `src/components/forms/DateRangePicker.tsx`
- `src/components/forms/BudgetRangeSelector.tsx`
- `src/components/forms/ImageUploadGrid.tsx`

**Code Example:**
```typescript
// src/pages/trips/CreateTripPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTrip } from '../../services/tripService';
import { useAuthContext } from '../../contexts/AuthContext';
import { Trip } from '../../types';
import TripBasicInfoForm from '../../components/forms/TripBasicInfoForm';
import TripDetailsForm from '../../components/forms/TripDetailsForm';
import TripRequirementsForm from '../../components/forms/TripRequirementsForm';
import ProgressIndicator from '../../components/common/ProgressIndicator';
import { toast } from 'react-hot-toast';
import './CreateTripPage.css';

export default function CreateTripPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [tripData, setTripData] = useState<Partial<Trip>>({
    createdBy: user?.id,
    status: 'open',
    currentGroupSize: 0,
    members: [],
    joinRequests: []
  });

  const totalSteps = 3;

  // Auto-save draft to localStorage
  useEffect(() => {
    const draftKey = `trip-draft-${user?.id}`;
    localStorage.setItem(draftKey, JSON.stringify(tripData));
  }, [tripData, user?.id]);

  // Load draft on component mount
  useEffect(() => {
    const draftKey = `trip-draft-${user?.id}`;
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      const draft = JSON.parse(saved);
      setTripData(prev => ({ ...prev, ...draft }));
    }
  }, [user?.id]);

  const updateTripData = (updates: Partial<Trip>) => {
    setTripData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!isValidTrip(tripData)) {
        toast.error('Please fill in all required fields');
        return;
      }

      const tripId = await createTrip(tripData as Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>);
      
      // Clear draft from localStorage
      const draftKey = `trip-draft-${user?.id}`;
      localStorage.removeItem(draftKey);
      
      toast.success('Your trip has been created successfully!');
      navigate(`/trips/${tripId}`);
    } catch (error) {
      toast.error('Failed to create trip. Please try again.');
      console.error('Trip creation error:', error);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <TripBasicInfoForm
            tripData={tripData}
            onUpdate={updateTripData}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <TripDetailsForm
            tripData={tripData}
            onUpdate={updateTripData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <TripRequirementsForm
            tripData={tripData}
            onUpdate={updateTripData}
            onSubmit={handleSubmit}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="create-trip-container">
      <div className="create-trip-header">
        <h1>Create Your Trip</h1>
        <ProgressIndicator currentStep={currentStep + 1} totalSteps={totalSteps} />
      </div>
      
      <div className="create-trip-content">
        {renderCurrentStep()}
      </div>
    </div>
  );
}

function isValidTrip(trip: Partial<Trip>): boolean {
  return !!(
    trip.title &&
    trip.destination &&
    trip.startDate &&
    trip.endDate &&
    trip.budget &&
    trip.maxGroupSize &&
    trip.maxGroupSize > 0
  );
}
```

### Task 2.5: Trip Details Screen Implementation
**Description:** Create detailed trip view with join functionality, member list, and trip information display.

**Acceptance Criteria:**
- Complete trip information display
- Join trip button with request modal
- Member list with profiles
- Trip status indicators
- Admin controls (if user is trip creator)
- Image gallery for trip photos
- Share trip functionality

**Estimated Complexity:** Complex  
**Dependencies:** Task 2.2, Task 2.4  
**Files Created:**
- `src/screens/trip/TripDetailsScreen.tsx`
- `src/components/trip/TripInfo.tsx`
- `src/components/trip/MembersList.tsx`
- `src/components/modals/JoinTripModal.tsx`

**Code Example:**
```typescript
// src/screens/trip/TripDetailsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Trip } from '../../types';
import { getTrip, joinTrip } from '../../services/tripService';
import { useAuthContext } from '../../contexts/AuthContext';
import TripInfo from '../../components/trip/TripInfo';
import MembersList from '../../components/trip/MembersList';
import JoinTripModal from '../../components/modals/JoinTripModal';
import { styles } from './TripDetailsStyles';

export default function TripDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuthContext();
  const { tripId } = route.params as { tripId: string };

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    loadTripDetails();
  }, [tripId]);

  const loadTripDetails = async () => {
    try {
      const tripData = await getTrip(tripId);
      setTrip(tripData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load trip details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (message: string) => {
    if (!user || !trip) return;

    try {
      await joinTrip(trip.id, user.id, message);
      Alert.alert(
        'Request Sent!',
        'Your join request has been sent to the trip organizer.'
      );
      setShowJoinModal(false);
      // Refresh trip data to show updated join requests
      loadTripDetails();
    } catch (error) {
      Alert.alert('Error', 'Failed to send join request');
    }
  };

  const canJoinTrip = () => {
    if (!user || !trip) return false;
    
    // Check if user is already a member
    const isMember = trip.members.some(member => member.userId === user.id);
    if (isMember) return false;
    
    // Check if user already has a pending request
    const hasPendingRequest = trip.joinRequests.some(requestId => 
      // This would require fetching join request details
      // For now, simplified check
      false
    );
    if (hasPendingRequest) return false;
    
    // Check if trip is open and not full
    return trip.status === 'open' && trip.currentGroupSize < trip.maxGroupSize;
  };

  const isAdmin = trip?.members.some(
    member => member.userId === user?.id && member.role === 'admin'
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading trip details...</Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.errorContainer}>
        <Text>Trip not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {trip.images && trip.images.length > 0 && (
        <Image source={{ uri: trip.images[0] }} style={styles.heroImage} />
      )}
      
      <View style={styles.content}>
        <Text style={styles.title}>{trip.title}</Text>
        <Text style={styles.destination}>{trip.destination}</Text>
        
        <TripInfo trip={trip} />
        <MembersList members={trip.members} isAdmin={isAdmin} />
        
        {canJoinTrip() && (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => setShowJoinModal(true)}
          >
            <Text style={styles.joinButtonText}>Request to Join</Text>
          </TouchableOpacity>
        )}
        
        {isAdmin && (
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => navigation.navigate('ManageTrip', { tripId })}
          >
            <Text style={styles.adminButtonText}>Manage Trip</Text>
          </TouchableOpacity>
        )}
      </View>

      <JoinTripModal
        visible={showJoinModal}
        trip={trip}
        onSubmit={handleJoinRequest}
        onCancel={() => setShowJoinModal(false)}
      />
    </ScrollView>
  );
}
```

### Task 2.6: Join Request Management System
**Description:** Implement admin interface for reviewing and managing join requests with user profiles.

**Acceptance Criteria:**
- List of pending join requests
- User profile preview for each request
- Approve/reject functionality with reasons
- Notification system for request updates
- Batch actions for multiple requests
- Request history and audit trail

**Estimated Complexity:** Complex  
**Dependencies:** Task 2.5  
**Files Created:**
- `src/screens/admin/ManageTripScreen.tsx`
- `src/components/admin/JoinRequestCard.tsx`
- `src/components/admin/UserProfilePreview.tsx`
- `src/services/notificationService.ts`

**Code Example:**
```typescript
// src/screens/admin/ManageTripScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { JoinRequest, User } from '../../types';
import { getJoinRequestsForTrip, approveJoinRequest, rejectJoinRequest } from '../../services/joinRequestService';
import { getUserProfile } from '../../services/userService';
import JoinRequestCard from '../../components/admin/JoinRequestCard';

interface JoinRequestWithUser extends JoinRequest {
  user: User;
}

export default function ManageTripScreen() {
  const route = useRoute();
  const { tripId } = route.params as { tripId: string };
  const [requests, setRequests] = useState<JoinRequestWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJoinRequests();
  }, [tripId]);

  const loadJoinRequests = async () => {
    try {
      const joinRequests = await getJoinRequestsForTrip(tripId);
      
      // Fetch user details for each request
      const requestsWithUsers = await Promise.all(
        joinRequests.map(async (request) => {
          const user = await getUserProfile(request.userId);
          return { ...request, user };
        })
      );
      
      setRequests(requestsWithUsers.filter(r => r.status === 'pending'));
    } catch (error) {
      Alert.alert('Error', 'Failed to load join requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await approveJoinRequest(requestId, user.id);
      Alert.alert('Success', 'Join request approved!');
      loadJoinRequests(); // Refresh list
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to approve request');
    }
  };

  const handleReject = async (requestId: string, reason?: string) => {
    try {
      await rejectJoinRequest(requestId, user.id, reason);
      Alert.alert('Request Rejected', 'The user has been notified.');
      loadJoinRequests(); // Refresh list
    } catch (error) {
      Alert.alert('Error', 'Failed to reject request');
    }
  };

  const renderJoinRequest = ({ item }: { item: JoinRequestWithUser }) => (
    <JoinRequestCard
      request={item}
      onApprove={() => handleApprove(item.id)}
      onReject={(reason) => handleReject(item.id, reason)}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={requests}
        renderItem={renderJoinRequest}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 50 }}>
            No pending join requests
          </Text>
        }
      />
    </View>
  );
}
```

### Task 2.7: Trip Status Management & Workflow
**Description:** Implement trip lifecycle management with status transitions and automated workflows.

**Acceptance Criteria:**
- Trip status transitions (open → full → ongoing → completed)
- Automated status updates based on conditions
- Trip cancellation workflow
- Member removal functionality
- Trip completion and archival
- Status change notifications

**Estimated Complexity:** Moderate  
**Dependencies:** Task 2.6  
**Files Created:**
- `src/services/tripWorkflowService.ts`
- `src/utils/tripStatusUtils.ts`

**Code Example:**
```typescript
// src/services/tripWorkflowService.ts
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Trip } from '../types';
import { sendNotificationToTripMembers } from './notificationService';

export async function updateTripStatus(tripId: string, newStatus: Trip['status'], reason?: string): Promise<void> {
  const tripRef = doc(db, 'trips', tripId);
  
  await updateDoc(tripRef, {
    status: newStatus,
    updatedAt: Timestamp.now(),
    statusChangeReason: reason
  });

  // Send notifications to all trip members
  await sendNotificationToTripMembers(tripId, {
    type: 'trip_status_changed',
    title: 'Trip Status Updated',
    body: `Trip status changed to ${newStatus}`,
    data: { tripId, newStatus }
  });
}

export async function checkAndUpdateTripStatus(trip: Trip): Promise<void> {
  let newStatus = trip.status;

  // Auto-update to full when max capacity reached
  if (trip.currentGroupSize >= trip.maxGroupSize && trip.status === 'open') {
    newStatus = 'full';
  }

  // Auto-update to ongoing when start date is reached
  const now = new Date();
  if (trip.startDate <= now && ['open', 'full'].includes(trip.status)) {
    newStatus = 'ongoing';
  }

  // Auto-update to completed when end date is passed
  if (trip.endDate <= now && trip.status === 'ongoing') {
    newStatus = 'completed';
  }

  if (newStatus !== trip.status) {
    await updateTripStatus(trip.id, newStatus, 'Automatic status update');
  }
}

export async function removeMemberFromTrip(tripId: string, userId: string, reason: string): Promise<void> {
  const tripRef = doc(db, 'trips', tripId);
  const trip = await getDoc(tripRef);
  
  if (!trip.exists()) {
    throw new Error('Trip not found');
  }

  const tripData = trip.data() as Trip;
  const updatedMembers = tripData.members.map(member => 
    member.userId === userId 
      ? { ...member, status: 'removed', removedAt: new Date(), removalReason: reason }
      : member
  );

  await updateDoc(tripRef, {
    members: updatedMembers,
    currentGroupSize: tripData.currentGroupSize - 1,
    updatedAt: Timestamp.now()
  });

  // If trip was full, change status back to open
  if (tripData.status === 'full') {
    await updateTripStatus(tripId, 'open', 'Member removed - spots available');
  }
}
```

## Quality Gates

### Phase 2 Completion Criteria
- [ ] Users can successfully create trips with all required information
- [ ] Responsive trip dashboard displays trips with working filters and search
- [ ] Join request workflow functions end-to-end
- [ ] Trip details page shows complete information and join functionality
- [ ] Admin can approve/reject join requests via web interface
- [ ] Trip status updates work correctly (manual and automatic)
- [ ] All CRUD operations work reliably across browsers
- [ ] Error handling provides meaningful feedback with toast notifications
- [ ] Loading skeleton screens and empty states are implemented
- [ ] Data validation prevents invalid trip creation
- [ ] Mobile-responsive design works on all screen sizes
- [ ] URL routing and browser history work correctly

### Testing Requirements
- Unit tests for all service functions
- Integration tests for trip creation and joining workflows
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile browser testing for responsive design
- Performance testing with large datasets and infinite scroll
- Accessibility testing (keyboard navigation, screen readers)
- Form validation testing

## Risk Mitigation

**Potential Issues:**
- Complex state management → Use established patterns (Context API, Zustand)
- Database query performance → Implement proper indexing and pagination
- Real-time updates → Use Firestore real-time listeners with proper cleanup
- Form validation complexity → Use React Hook Form or Formik for web
- Browser compatibility → Use polyfills and progressive enhancement
- Mobile responsiveness → Test thoroughly on various devices

**Dependencies:**
- Firestore database performance and reliability
- Image upload service for trip photos (Firebase Storage)
- Date/time handling across time zones (date-fns library)
- Web notification API for browser notifications
- Modern browser support for advanced CSS features

---

**Next Phase:** [Phase 3: AI Integration & Advanced Features](./phase-3-ai-integration.md)
