# Phase 3: AI Integration & Advanced Features

**Duration Estimate:** 2-3 weeks  
**Goal:** Add AI-powered itinerary generation and Google Maps web integration  
**Risk Level:** High  

---

## Phase Overview

This phase integrates advanced web-specific features that differentiate WanderGroup from basic trip planning apps. The AI-powered itinerary generation and Google Maps JavaScript API integration provide intelligent, visual trip planning capabilities optimized for web browsers and responsive design.

## Task Breakdown

### Task 3.1: AI Service Integration Setup
**Description:** Set up AI service integration (OpenAI/Gemini) with proper error handling, rate limiting, and cost management.

**Acceptance Criteria:**
- AI service API integration configured
- Environment variables and API keys secured
- Rate limiting and usage monitoring implemented
- Error handling for API failures
- Cost tracking and budget alerts
- Fallback mechanisms for service unavailability

**Estimated Complexity:** Moderate  
**Dependencies:** Phase 2 complete  
**Files Created:**
- `src/config/aiConfig.ts`
- `src/services/aiService.ts`
- `src/utils/aiPromptTemplates.ts`
- `src/hooks/useAI.ts`

**Code Example:**
```typescript
// src/services/aiService.ts
import OpenAI from 'openai';
import { Trip, Itinerary, ItineraryItem } from '../types';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

export interface ItineraryRequest {
  destination: string;
  startDate: Date;
  endDate: Date;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  groupSize: number;
  preferences: {
    interests: string[];
    travelStyle: 'adventure' | 'relaxed' | 'cultural' | 'budget';
    accommodationType: 'hotel' | 'hostel' | 'airbnb' | 'mixed';
  };
}

export async function generateItinerary(request: ItineraryRequest): Promise<Itinerary> {
  try {
    const prompt = buildItineraryPrompt(request);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert travel planner who creates detailed, budget-conscious itineraries. Always provide practical, realistic suggestions with cost estimates."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const aiResponse = response.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI service');
    }

    return parseAIResponse(aiResponse, request);
  } catch (error) {
    console.error('AI service error:', error);
    throw new Error('Failed to generate itinerary. Please try again.');
  }
}

function buildItineraryPrompt(request: ItineraryRequest): string {
  const days = Math.ceil((request.endDate.getTime() - request.startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return `
Create a detailed ${days}-day travel itinerary for ${request.destination} for a group of ${request.groupSize} people.

Trip Details:
- Dates: ${request.startDate.toDateString()} to ${request.endDate.toDateString()}
- Budget: ${request.budget.min}-${request.budget.max} ${request.budget.currency} per person
- Travel Style: ${request.preferences.travelStyle}
- Interests: ${request.preferences.interests.join(', ')}
- Accommodation: ${request.preferences.accommodationType}

Please provide:
1. Daily itinerary with specific activities, timing, and locations
2. Estimated costs for each activity/meal/transport
3. Accommodation recommendations within budget
4. Local transportation options
5. Must-see attractions and hidden gems
6. Food recommendations (include local cuisine)
7. Practical tips and considerations

Format the response as a structured JSON object with the following structure:
{
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "time": "09:00",
          "title": "Activity Name",
          "description": "Detailed description",
          "location": "Specific address or area",
          "estimatedCost": 25,
          "duration": "2 hours",
          "category": "sightseeing|food|transport|accommodation|entertainment"
        }
      ],
      "totalEstimatedCost": 150
    }
  ],
  "totalBudget": 750,
  "accommodationSuggestions": [...],
  "transportationTips": [...],
  "packingTips": [...],
  "localTips": [...]
}
`;
}

function parseAIResponse(response: string, request: ItineraryRequest): Itinerary {
  try {
    // Extract JSON from the response (AI might add extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    
    return {
      id: generateId(),
      tripId: '', // Will be set when saved
      generatedAt: new Date(),
      days: parsedData.days.map((day: any) => ({
        ...day,
        date: new Date(day.date),
        activities: day.activities.map((activity: any) => ({
          ...activity,
          id: generateId(),
          votes: {
            upvotes: 0,
            downvotes: 0,
            userVotes: {}
          },
          status: 'suggested'
        }))
      })),
      totalEstimatedBudget: parsedData.totalBudget,
      accommodationSuggestions: parsedData.accommodationSuggestions || [],
      transportationTips: parsedData.transportationTips || [],
      packingTips: parsedData.packingTips || [],
      localTips: parsedData.localTips || [],
      lastModified: new Date()
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw new Error('Failed to process AI response');
  }
}

export async function refineItineraryItem(
  item: ItineraryItem, 
  feedback: string, 
  context: ItineraryRequest
): Promise<ItineraryItem> {
  const prompt = `
Refine this travel activity based on user feedback:

Original Activity:
- Title: ${item.title}
- Description: ${item.description}
- Location: ${item.location}
- Cost: ${item.estimatedCost}
- Duration: ${item.duration}

User Feedback: "${feedback}"

Trip Context:
- Destination: ${context.destination}
- Budget: ${context.budget.min}-${context.budget.max} ${context.budget.currency}
- Group Size: ${context.groupSize}
- Travel Style: ${context.preferences.travelStyle}

Please provide an improved version that addresses the feedback while maintaining the same JSON structure.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 500,
    });

    const refinedData = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return {
      ...item,
      ...refinedData,
      id: item.id, // Preserve original ID
      lastModified: new Date()
    };
  } catch (error) {
    console.error('Error refining itinerary item:', error);
    throw new Error('Failed to refine activity');
  }
}
```

### Task 3.2: Google Maps Web Integration Setup
**Description:** Integrate Google Maps JavaScript API with place search, directions, and location services for web.

**Acceptance Criteria:**
- Google Maps JavaScript API configured for web
- Places API with autocomplete functionality
- Directions API and route calculation
- Interactive map with custom markers and styling
- Responsive map design for mobile/desktop
- API usage optimization and monitoring
- Lazy loading for performance

**Estimated Complexity:** Complex  
**Dependencies:** Task 3.1  
**Files Created:**
- `src/config/mapsConfig.ts`
- `src/services/mapsService.ts`
- `src/components/maps/GoogleMap.tsx`
- `src/components/maps/PlaceAutocomplete.tsx`
- `src/hooks/useGoogleMaps.ts`

**Code Example:**
```typescript
// src/services/mapsService.ts
// Google Maps Web Service for browser-based integration

export interface Place {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  placeId: string;
  types: string[];
  rating?: number;
  priceLevel?: number;
  photos?: string[];
}

export interface RouteInfo {
  distance: string;
  duration: string;
  polyline: string;
  steps: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
  startLocation: {
    latitude: number;
    longitude: number;
  };
  endLocation: {
    latitude: number;
    longitude: number;
  };
}

class MapsService {
  private apiKey: string;
  private isLoaded: boolean = false;

  constructor() {
    this.apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  }

  async loadGoogleMapsAPI(): Promise<void> {
    if (this.isLoaded || window.google) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async searchPlaces(query: string, location?: { lat: number; lng: number }): Promise<Place[]> {
    try {
      const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
      url.searchParams.append('query', query);
      url.searchParams.append('key', this.apiKey);
      
      if (location) {
        url.searchParams.append('location', `${location.lat},${location.lng}`);
        url.searchParams.append('radius', '50000'); // 50km radius
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Places API error: ${data.status}`);
      }

      return data.results.map((result: any) => ({
        id: result.place_id,
        name: result.name,
        address: result.formatted_address,
        coordinates: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        },
        placeId: result.place_id,
        types: result.types,
        rating: result.rating,
        priceLevel: result.price_level,
        photos: result.photos?.map((photo: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
        )
      }));
    } catch (error) {
      console.error('Error searching places:', error);
      throw new Error('Failed to search places');
    }
  }

  async getPlaceDetails(placeId: string): Promise<Place> {
    try {
      const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
      url.searchParams.append('place_id', placeId);
      url.searchParams.append('key', this.apiKey);
      url.searchParams.append('fields', 'name,formatted_address,geometry,rating,price_level,photos,types');

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Place Details API error: ${data.status}`);
      }

      const result = data.result;
      return {
        id: placeId,
        name: result.name,
        address: result.formatted_address,
        coordinates: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        },
        placeId,
        types: result.types,
        rating: result.rating,
        priceLevel: result.price_level,
        photos: result.photos?.map((photo: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
        )
      };
    } catch (error) {
      console.error('Error getting place details:', error);
      throw new Error('Failed to get place details');
    }
  }

  async getDirections(origin: string, destination: string, waypoints?: string[]): Promise<RouteInfo> {
    try {
      const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
      url.searchParams.append('origin', origin);
      url.searchParams.append('destination', destination);
      url.searchParams.append('key', this.apiKey);
      
      if (waypoints && waypoints.length > 0) {
        url.searchParams.append('waypoints', waypoints.join('|'));
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Directions API error: ${data.status}`);
      }

      const route = data.routes[0];
      const leg = route.legs[0];

      return {
        distance: leg.distance.text,
        duration: leg.duration.text,
        polyline: route.overview_polyline.points,
        steps: leg.steps.map((step: any) => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
          distance: step.distance.text,
          duration: step.duration.text,
          startLocation: {
            latitude: step.start_location.lat,
            longitude: step.start_location.lng,
          },
          endLocation: {
            latitude: step.end_location.lat,
            longitude: step.end_location.lng,
          },
        }))
      };
    } catch (error) {
      console.error('Error getting directions:', error);
      throw new Error('Failed to get directions');
    }
  }
}

export const mapsService = new MapsService();
```

### Task 3.3: Itinerary Data Models & Storage
**Description:** Define data models for itineraries and implement Firestore storage with real-time updates.

**Acceptance Criteria:**
- Complete itinerary data models with TypeScript types
- Firestore collections and subcollections structure
- Real-time listeners for collaborative editing
- Version control for itinerary changes
- Voting system data structure
- Efficient querying and indexing

**Estimated Complexity:** Moderate  
**Dependencies:** Task 3.1  
**Files Created:**
- `src/types/itinerary.ts`
- `src/services/itineraryService.ts`
- `src/hooks/useItinerary.ts`

**Code Example:**
```typescript
// src/types/itinerary.ts
export interface Itinerary {
  id: string;
  tripId: string;
  generatedAt: Date;
  lastModified: Date;
  days: ItineraryDay[];
  totalEstimatedBudget: number;
  accommodationSuggestions: AccommodationSuggestion[];
  transportationTips: string[];
  packingTips: string[];
  localTips: string[];
  status: 'draft' | 'published' | 'finalized';
  version: number;
}

export interface ItineraryDay {
  day: number;
  date: Date;
  activities: ItineraryItem[];
  totalEstimatedCost: number;
  notes?: string;
}

export interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  estimatedCost: number;
  duration: string;
  category: 'sightseeing' | 'food' | 'transport' | 'accommodation' | 'entertainment';
  votes: {
    upvotes: number;
    downvotes: number;
    userVotes: { [userId: string]: 'up' | 'down' };
  };
  status: 'suggested' | 'approved' | 'rejected' | 'modified';
  alternatives?: ItineraryItem[];
  lastModified: Date;
}

export interface AccommodationSuggestion {
  name: string;
  type: 'hotel' | 'hostel' | 'airbnb' | 'guesthouse';
  priceRange: string;
  location: string;
  amenities: string[];
  rating?: number;
}

export interface VoteUpdate {
  itemId: string;
  userId: string;
  voteType: 'up' | 'down' | 'remove';
}
```

### Task 3.4: AI-Powered Itinerary Generation Page
**Description:** Create the main web interface for generating and displaying AI-powered itineraries with customization options.

**Acceptance Criteria:**
- Responsive itinerary generation form with preferences
- Loading states with progress indicators during AI processing
- Generated itinerary display with day-by-day breakdown
- Interactive cost breakdown and budget tracking
- Regeneration and refinement options
- Save and share functionality with URL sharing
- Mobile-responsive design
- Print-friendly layout option

**Estimated Complexity:** Complex  
**Dependencies:** Task 3.1, Task 3.3  
**Files Created:**
- `src/pages/itinerary/GenerateItineraryPage.tsx`
- `src/pages/itinerary/ItineraryDisplayPage.tsx`
- `src/components/itinerary/ItineraryPreferencesForm.tsx`
- `src/components/itinerary/DayPlanCard.tsx`
- `src/components/itinerary/ItineraryPrintView.tsx`

**Code Example:**
```typescript
// src/pages/itinerary/GenerateItineraryPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Trip, ItineraryRequest } from '../../types';
import { generateItinerary } from '../../services/aiService';
import { saveItinerary } from '../../services/itineraryService';
import ItineraryPreferencesForm from '../../components/itinerary/ItineraryPreferencesForm';
import { styles } from './ItineraryStyles';

export default function GenerateItineraryPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  
  const [preferences, setPreferences] = useState({
    interests: [],
    travelStyle: 'relaxed' as const,
    accommodationType: 'mixed' as const,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerateItinerary = async () => {
    setIsGenerating(true);
    
    try {
      const request: ItineraryRequest = {
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget,
        groupSize: trip.maxGroupSize,
        preferences
      };

      const generatedItinerary = await generateItinerary(request);
      
      // Save to Firestore
      generatedItinerary.tripId = trip.id;
      const itineraryId = await saveItinerary(generatedItinerary);
      
      // Navigate to display page
      navigate(`/trips/${trip.id}/itinerary/${itineraryId}`);
      
    } catch (error: any) {
      toast.error('Unable to generate itinerary. Please try again.');
      console.error('Itinerary generation error:', error);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  // Simulate progress for better UX
  const simulateProgress = () => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 500);
    return interval;
  };

  if (!trip) {
    return <div className="loading">Loading trip details...</div>;
  }

  return (
    <div className="generate-itinerary-container">
      <div className="generate-header">
        <h1>Generate Your Itinerary</h1>
        <p>Tell us your preferences and we'll create a personalized plan for {trip.destination}</p>
      </div>

      <div className="generate-content">
        <ItineraryPreferencesForm
          preferences={preferences}
          onUpdate={setPreferences}
          trip={trip}
        />

        <button
          className={`generate-button ${isGenerating ? 'generating' : ''}`}
          onClick={handleGenerateItinerary}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <div className="generating-content">
              <div className="spinner" />
              <span>Generating...</span>
            </div>
          ) : (
            'Generate Itinerary'
          )}
        </button>

        {isGenerating && (
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="progress-text">
              Creating your personalized itinerary...
            </p>
            <small className="progress-subtext">
              This may take 30-60 seconds
            </small>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Task 3.5: Interactive Itinerary Display with Maps
**Description:** Create rich itinerary display with integrated maps, voting system, and collaborative editing features.

**Acceptance Criteria:**
- Day-by-day itinerary display with timeline
- Interactive map showing all locations
- Voting system for each activity
- Real-time collaborative updates
- Activity details modal with photos
- Route optimization and directions
- Budget tracking and cost breakdown

**Estimated Complexity:** Complex  
**Dependencies:** Task 3.2, Task 3.4  
**Files Created:**
- `src/screens/itinerary/ItineraryDisplayScreen.tsx`
- `src/components/itinerary/ItineraryMap.tsx`
- `src/components/itinerary/ActivityCard.tsx`
- `src/components/itinerary/VotingSystem.tsx`
- `src/components/modals/ActivityDetailsModal.tsx`

**Code Example:**
```typescript
// src/screens/itinerary/ItineraryDisplayScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Itinerary, ItineraryItem } from '../../types';
import { getItinerary, updateItineraryItemVote } from '../../services/itineraryService';
import { useAuthContext } from '../../contexts/AuthContext';
import ItineraryMap from '../../components/itinerary/ItineraryMap';
import DayPlanCard from '../../components/itinerary/DayPlanCard';
import ActivityDetailsModal from '../../components/modals/ActivityDetailsModal';
import { styles } from './ItineraryStyles';

export default function ItineraryDisplayScreen() {
  const route = useRoute();
  const { user } = useAuthContext();
  const { itineraryId, tripId } = route.params as { itineraryId: string; tripId: string };
  
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ItineraryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItinerary();
  }, [itineraryId]);

  const loadItinerary = async () => {
    try {
      const data = await getItinerary(itineraryId);
      setItinerary(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load itinerary');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (itemId: string, voteType: 'up' | 'down') => {
    if (!user || !itinerary) return;

    try {
      await updateItineraryItemVote(itineraryId, itemId, user.id, voteType);
      
      // Update local state optimistically
      const updatedItinerary = {
        ...itinerary,
        days: itinerary.days.map(day => ({
          ...day,
          activities: day.activities.map(activity => {
            if (activity.id === itemId) {
              const currentVote = activity.votes.userVotes[user.id];
              const votes = { ...activity.votes };
              
              // Remove previous vote if exists
              if (currentVote === 'up') votes.upvotes--;
              if (currentVote === 'down') votes.downvotes--;
              
              // Add new vote
              if (voteType === 'up') votes.upvotes++;
              if (voteType === 'down') votes.downvotes++;
              
              votes.userVotes[user.id] = voteType;
              
              return { ...activity, votes };
            }
            return activity;
          })
        }))
      };
      
      setItinerary(updatedItinerary);
    } catch (error) {
      Alert.alert('Error', 'Failed to record vote');
    }
  };

  const getAllActivities = () => {
    if (!itinerary) return [];
    return itinerary.days.flatMap(day => day.activities);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading itinerary...</Text>
      </View>
    );
  }

  if (!itinerary) {
    return (
      <View style={styles.errorContainer}>
        <Text>Itinerary not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !showMap && styles.toggleButtonActive]}
          onPress={() => setShowMap(false)}
        >
          <Text style={styles.toggleText}>Timeline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, showMap && styles.toggleButtonActive]}
          onPress={() => setShowMap(true)}
        >
          <Text style={styles.toggleText}>Map View</Text>
        </TouchableOpacity>
      </View>

      {showMap ? (
        <ItineraryMap
          activities={getAllActivities()}
          onActivityPress={setSelectedActivity}
        />
      ) : (
        <ScrollView style={styles.timelineContainer}>
          <View style={styles.daySelector}>
            {itinerary.days.map((day, index) => (
              <TouchableOpacity
                key={day.day}
                style={[
                  styles.dayButton,
                  selectedDay === index && styles.dayButtonActive
                ]}
                onPress={() => setSelectedDay(index)}
              >
                <Text style={styles.dayButtonText}>Day {day.day}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <DayPlanCard
            day={itinerary.days[selectedDay]}
            onVote={handleVote}
            onActivityPress={setSelectedActivity}
            currentUserId={user?.id}
          />

          <View style={styles.budgetSummary}>
            <Text style={styles.budgetTitle}>Day {selectedDay + 1} Budget</Text>
            <Text style={styles.budgetAmount}>
              ${itinerary.days[selectedDay].totalEstimatedCost}
            </Text>
          </View>
        </ScrollView>
      )}

      <ActivityDetailsModal
        activity={selectedActivity}
        visible={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        onVote={handleVote}
        currentUserId={user?.id}
      />
    </View>
  );
}
```

### Task 3.6: Collaborative Itinerary Editing
**Description:** Implement real-time collaborative editing features allowing group members to vote, suggest alternatives, and modify the itinerary.

**Acceptance Criteria:**
- Real-time voting system with live updates
- Alternative activity suggestions
- Comment system for activities
- Conflict resolution for simultaneous edits
- Activity replacement and modification
- Group consensus tracking

**Estimated Complexity:** Complex  
**Dependencies:** Task 3.5  
**Files Created:**
- `src/services/collaborativeEditingService.ts`
- `src/components/itinerary/AlternativeSuggestions.tsx`
- `src/components/itinerary/ActivityComments.tsx`
- `src/hooks/useRealtimeItinerary.ts`

**Code Example:**
```typescript
// src/hooks/useRealtimeItinerary.ts
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Itinerary } from '../types';

export function useRealtimeItinerary(itineraryId: string) {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itineraryId) return;

    const itineraryRef = doc(db, 'itineraries', itineraryId);
    
    const unsubscribe = onSnapshot(
      itineraryRef,
      (doc) => {
        if (doc.exists()) {
          setItinerary({ id: doc.id, ...doc.data() } as Itinerary);
        } else {
          setError('Itinerary not found');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to itinerary:', error);
        setError('Failed to load itinerary');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [itineraryId]);

  return { itinerary, loading, error };
}

// src/services/collaborativeEditingService.ts
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ItineraryItem } from '../types';

export interface ActivityComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  activityId: string;
}

export interface AlternativeSuggestion {
  id: string;
  originalActivityId: string;
  suggestedBy: string;
  suggestedAt: Date;
  activity: Partial<ItineraryItem>;
  reason: string;
  votes: {
    upvotes: number;
    downvotes: number;
    userVotes: { [userId: string]: 'up' | 'down' };
  };
  status: 'pending' | 'approved' | 'rejected';
}

export async function suggestAlternativeActivity(
  itineraryId: string,
  originalActivityId: string,
  alternative: Partial<ItineraryItem>,
  reason: string,
  userId: string
): Promise<void> {
  const suggestion: AlternativeSuggestion = {
    id: generateId(),
    originalActivityId,
    suggestedBy: userId,
    suggestedAt: new Date(),
    activity: alternative,
    reason,
    votes: {
      upvotes: 0,
      downvotes: 0,
      userVotes: {}
    },
    status: 'pending'
  };

  const itineraryRef = doc(db, 'itineraries', itineraryId);
  await updateDoc(itineraryRef, {
    alternativeSuggestions: arrayUnion(suggestion),
    lastModified: Timestamp.now()
  });
}

export async function addActivityComment(
  itineraryId: string,
  activityId: string,
  content: string,
  userId: string,
  userName: string
): Promise<void> {
  const comment: ActivityComment = {
    id: generateId(),
    userId,
    userName,
    content,
    createdAt: new Date(),
    activityId
  };

  const itineraryRef = doc(db, 'itineraries', itineraryId);
  await updateDoc(itineraryRef, {
    comments: arrayUnion(comment),
    lastModified: Timestamp.now()
  });
}

export async function approveAlternativeSuggestion(
  itineraryId: string,
  suggestionId: string,
  adminUserId: string
): Promise<void> {
  // This would require more complex logic to replace the original activity
  // with the suggested alternative in the itinerary structure
  
  const itineraryRef = doc(db, 'itineraries', itineraryId);
  
  // Update suggestion status
  // Replace activity in the itinerary
  // Send notifications to group members
  
  await updateDoc(itineraryRef, {
    lastModified: Timestamp.now(),
    version: increment(1) // Version control for conflict resolution
  });
}
```

### Task 3.7: Itinerary Export & Sharing
**Description:** Implement functionality to export itineraries in multiple formats and share with external users.

**Acceptance Criteria:**
- PDF export with formatted itinerary
- Calendar integration (Google Calendar, Apple Calendar)
- Share link generation for external viewing
- Print-friendly format
- Offline access preparation
- Social media sharing integration

**Estimated Complexity:** Moderate  
**Dependencies:** Task 3.5  
**Files Created:**
- `src/services/exportService.ts`
- `src/utils/pdfGenerator.ts`
- `src/utils/calendarIntegration.ts`
- `src/components/sharing/ShareItineraryModal.tsx`

**Code Example:**
```typescript
// src/services/exportService.ts
import { Itinerary } from '../types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function exportItineraryToPDF(itinerary: Itinerary): Promise<string> {
  try {
    const htmlContent = generateItineraryHTML(itinerary);
    
    // Use a PDF generation service or library
    const pdfUri = await generatePDFFromHTML(htmlContent);
    
    return pdfUri;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export itinerary');
  }
}

export async function shareItinerary(itinerary: Itinerary, format: 'pdf' | 'link' | 'text'): Promise<void> {
  try {
    switch (format) {
      case 'pdf':
        const pdfUri = await exportItineraryToPDF(itinerary);
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Itinerary'
        });
        break;
        
      case 'link':
        const shareableLink = generateShareableLink(itinerary.id);
        await Sharing.shareAsync(shareableLink);
        break;
        
      case 'text':
        const textContent = generateTextSummary(itinerary);
        await Sharing.shareAsync(textContent);
        break;
    }
  } catch (error) {
    console.error('Error sharing itinerary:', error);
    throw new Error('Failed to share itinerary');
  }
}

function generateItineraryHTML(itinerary: Itinerary): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${itinerary.tripId} Itinerary</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .day { page-break-inside: avoid; margin-bottom: 30px; }
        .activity { margin: 10px 0; padding: 10px; border-left: 3px solid #007bff; }
        .cost { font-weight: bold; color: #28a745; }
      </style>
    </head>
    <body>
      <h1>Travel Itinerary</h1>
      <p>Generated on: ${new Date().toLocaleDateString()}</p>
      <p>Total Budget: $${itinerary.totalEstimatedBudget}</p>
      
      ${itinerary.days.map(day => `
        <div class="day">
          <h2>Day ${day.day} - ${day.date.toDateString()}</h2>
          <p><strong>Daily Budget: $${day.totalEstimatedCost}</strong></p>
          
          ${day.activities.map(activity => `
            <div class="activity">
              <h3>${activity.time} - ${activity.title}</h3>
              <p>${activity.description}</p>
              <p><strong>Location:</strong> ${activity.location}</p>
              <p><strong>Duration:</strong> ${activity.duration}</p>
              <p class="cost">Cost: $${activity.estimatedCost}</p>
            </div>
          `).join('')}
        </div>
      `).join('')}
      
      <div class="tips">
        <h2>Travel Tips</h2>
        <h3>Local Tips:</h3>
        <ul>${itinerary.localTips.map(tip => `<li>${tip}</li>`).join('')}</ul>
        
        <h3>Packing Tips:</h3>
        <ul>${itinerary.packingTips.map(tip => `<li>${tip}</li>`).join('')}</ul>
      </div>
    </body>
    </html>
  `;
}
```

## Quality Gates

### Phase 3 Completion Criteria
- [ ] AI service integration works reliably with proper error handling
- [ ] Google Maps JavaScript API displays locations and provides directions in browser
- [ ] Itinerary generation produces high-quality, relevant suggestions
- [ ] Real-time collaborative editing functions without conflicts
- [ ] Voting system works and updates in real-time across browsers
- [ ] Interactive maps display all itinerary locations with proper markers
- [ ] Export functionality produces shareable content (PDF, links)
- [ ] Performance is acceptable even with complex itineraries on web
- [ ] Responsive design works on mobile and desktop browsers
- [ ] AI usage stays within budget limits
- [ ] Maps API usage is optimized for web performance
- [ ] Print-friendly layouts are available

### Testing Requirements
- AI service reliability testing with various inputs
- Google Maps JavaScript API testing on different browsers and devices
- Real-time collaboration testing with multiple browser sessions
- Performance testing with large itineraries on web
- Export functionality testing across different browsers
- API rate limiting and error handling testing
- Mobile browser testing for responsive maps
- Print functionality testing

## Risk Mitigation

**High-Risk Areas:**
- AI service reliability → Implement robust fallbacks and caching
- Maps API rate limits → Optimize queries and implement usage monitoring
- Real-time collaboration conflicts → Use operational transformation or conflict resolution
- Complex state management → Use established patterns and libraries
- Browser compatibility → Test across major browsers and versions
- Mobile map performance → Implement lazy loading and optimization

**Dependencies:**
- OpenAI/Gemini API availability and pricing
- Google Maps JavaScript API quotas and performance
- Firestore real-time listener performance
- Modern browser support for advanced features
- Web APIs for PDF generation and file sharing

---

**Next Phase:** [Phase 4: Social Features & Polish](./phase-4-social-features.md)
