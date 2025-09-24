# Phase 4: Social Features & Polish

**Duration Estimate:** 2-3 weeks  
**Goal:** Implement web chat, ratings, and responsive UX polish  
**Risk Level:** Medium  

---

## Phase Overview

This final phase completes the WanderGroup web MVP by implementing social features that build trust and community within the platform. The focus is on real-time web chat, post-trip rating systems, web-based safety features, and responsive user experience polish across all devices.

## Task Breakdown

### Task 4.1: Real-time Web Chat System
**Description:** Implement real-time group chat functionality for trip members with message history and media sharing optimized for web browsers.

**Acceptance Criteria:**
- Real-time messaging between group members using WebSocket/Firestore
- Message history persistence with infinite scroll
- Media sharing (photos, location) with drag-and-drop
- Typing indicators and read receipts
- Message reactions and replies
- Chat moderation for group admins
- Responsive design for mobile and desktop
- Keyboard shortcuts for power users
- Message search functionality

**Estimated Complexity:** Complex  
**Dependencies:** Phase 3 complete  
**Files Created:**
- `src/services/chatService.ts`
- `src/pages/chat/GroupChatPage.tsx`
- `src/components/chat/MessageBubble.tsx`
- `src/components/chat/MessageInput.tsx`
- `src/components/chat/MessageSearch.tsx`
- `src/hooks/useChat.ts`

**Code Example:**
```typescript
// src/services/chatService.ts
import {
  collection,
  doc,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  arrayUnion,
  Timestamp,
  serverTimestamp,
  startAfter,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadFile } from './fileUploadService';

export interface ChatMessage {
  id: string;
  tripId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'location' | 'system';
  timestamp: Date;
  readBy: string[]; // User IDs who have read this message
  reactions: {
    [emoji: string]: string[]; // emoji -> array of user IDs
  };
  replyTo?: string; // Message ID this is replying to
  edited?: boolean;
  editedAt?: Date;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  timestamp: Date;
}

class ChatService {
  async sendMessage(
    tripId: string,
    senderId: string,
    senderName: string,
    content: string,
    type: ChatMessage['type'] = 'text',
    replyTo?: string,
    file?: File
  ): Promise<string> {
    try {
      const messagesRef = collection(db, 'trips', tripId, 'messages');
      
      let fileUrl = '';
      if (file && type !== 'text') {
        fileUrl = await uploadFile(file, `chat/${tripId}`);
      }
      
      const messageData = {
        tripId,
        senderId,
        senderName,
        content,
        type,
        timestamp: serverTimestamp(),
        readBy: [senderId],
        reactions: {},
        ...(replyTo && { replyTo }),
        ...(fileUrl && { fileUrl }),
        edited: false
      };

      const docRef = await addDoc(messagesRef, messageData);
      
      // Update trip's last activity
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        lastActivity: serverTimestamp(),
        lastMessage: {
          content: type === 'text' ? content : `Sent a ${type}`,
          senderName,
          timestamp: serverTimestamp()
        }
      });

      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  subscribeToMessages(
    tripId: string,
    callback: (messages: ChatMessage[]) => void,
    messageLimit: number = 50
  ): () => void {
    const messagesRef = collection(db, 'trips', tripId, 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      limit(messageLimit)
    );

    return onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as ChatMessage);
      });

      // Reverse to show oldest first
      callback(messages.reverse());
    });
  }

  async markMessageAsRead(tripId: string, messageId: string, userId: string): Promise<void> {
    try {
      const messageRef = doc(db, 'trips', tripId, 'messages', messageId);
      await updateDoc(messageRef, {
        readBy: arrayUnion(userId)
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  async addReaction(
    tripId: string,
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<void> {
    try {
      const messageRef = doc(db, 'trips', tripId, 'messages', messageId);
      await updateDoc(messageRef, {
        [`reactions.${emoji}`]: arrayUnion(userId)
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw new Error('Failed to add reaction');
    }
  }

  async setTypingIndicator(
    tripId: string,
    userId: string,
    userName: string,
    isTyping: boolean
  ): Promise<void> {
    try {
      const tripRef = doc(db, 'trips', tripId);
      
      if (isTyping) {
        await updateDoc(tripRef, {
          [`typingIndicators.${userId}`]: {
            userName,
            timestamp: serverTimestamp()
          }
        });
      } else {
        await updateDoc(tripRef, {
          [`typingIndicators.${userId}`]: null
        });
      }
    } catch (error) {
      console.error('Error setting typing indicator:', error);
    }
  }

  async deleteMessage(tripId: string, messageId: string, userId: string): Promise<void> {
    try {
      const messageRef = doc(db, 'trips', tripId, 'messages', messageId);
      
      // Instead of deleting, mark as deleted for audit trail
      await updateDoc(messageRef, {
        content: 'This message was deleted',
        type: 'system',
        deletedBy: userId,
        deletedAt: serverTimestamp(),
        edited: true
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new Error('Failed to delete message');
    }
  }
}

export const chatService = new ChatService();
```

### Task 4.2: Web Chat Interface Implementation
**Description:** Create responsive chat interface with modern web messaging UX patterns and features.

**Acceptance Criteria:**
- Modern responsive chat interface with message bubbles
- Smooth scrolling and auto-scroll to new messages
- Message status indicators (sent, delivered, read)
- Image and media preview with lightbox
- Reply and reaction functionality with emoji picker
- User presence indicators
- Message search with highlighting
- Keyboard shortcuts (Ctrl+Enter to send, etc.)
- Drag-and-drop file upload
- Mobile-responsive design

**Estimated Complexity:** Complex  
**Dependencies:** Task 4.1  
**Files Created:**
- `src/pages/chat/GroupChatPage.tsx`
- `src/components/chat/MessageList.tsx`
- `src/components/chat/MessageBubble.tsx`
- `src/components/chat/MessageInput.tsx`
- `src/components/chat/TypingIndicator.tsx`
- `src/components/chat/EmojiPicker.tsx`
- `src/components/chat/MediaLightbox.tsx`

**Code Example:**
```typescript
// src/pages/chat/GroupChatPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ChatMessage } from '../../types';
import { chatService } from '../../services/chatService';
import { useAuthContext } from '../../contexts/AuthContext';
import MessageBubble from '../../components/chat/MessageBubble';
import MessageInput from '../../components/chat/MessageInput';
import TypingIndicator from '../../components/chat/TypingIndicator';
import { styles } from './ChatStyles';

export default function GroupChatPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useAuthContext();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!tripId) return;

    const unsubscribe = chatService.subscribeToMessages(
      tripId,
      (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
        
        // Mark new messages as read
        newMessages.forEach(message => {
          if (message.senderId !== user?.id && !message.readBy.includes(user?.id || '')) {
            chatService.markMessageAsRead(tripId, message.id, user?.id || '');
          }
        });
      }
    );

    return unsubscribe;
  }, [tripId, user?.id]);

  const handleSendMessage = async (content: string, type: ChatMessage['type'] = 'text', file?: File) => {
    if (!user || (!content.trim() && !file)) return;

    try {
      await chatService.sendMessage(
        tripId!,
        user.id,
        user.name,
        content.trim(),
        type,
        undefined,
        file
      );
      
      // Scroll to bottom after sending
      scrollToBottom();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const type = file.type.startsWith('image/') ? 'image' : 'text';
      handleSendMessage(file.name, type, file);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (!user) return;

    chatService.setTypingIndicator(tripId, user.id, user.name, isTyping);
    
    if (isTyping) {
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        chatService.setTypingIndicator(tripId, user.id, user.name, false);
      }, 3000);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    
    try {
      await chatService.addReaction(tripId, messageId, user.id, emoji);
    } catch (error) {
      Alert.alert('Error', 'Failed to add reaction');
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isOwnMessage = item.senderId === user?.id;
    const showAvatar = index === 0 || messages[index - 1].senderId !== item.senderId;
    
    return (
      <MessageBubble
        message={item}
        isOwnMessage={isOwnMessage}
        showAvatar={showAvatar}
        onReaction={handleReaction}
        onReply={(message) => {
          // Handle reply functionality
        }}
      />
    );
  };

  const filteredMessages = searchQuery 
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className=\"chat-container\">
      <div className=\"chat-header\">
        <h2>Group Chat</h2>
        <div className=\"chat-actions\">
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className=\"search-toggle\"
          >
            🔍
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className=\"file-upload-button\"
          >
            📎
          </button>
        </div>
      </div>

      {showSearch && (
        <div className=\"search-bar\">
          <input
            type=\"text\"
            placeholder=\"Search messages...\"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className=\"search-input\"
          />
        </div>
      )}

      <div className=\"messages-container\">
        <div className=\"messages-list\">
          {filteredMessages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === user?.id}
              showAvatar={index === 0 || filteredMessages[index - 1].senderId !== message.senderId}
              onReaction={handleReaction}
              onReply={(message) => {
                // Handle reply functionality
              }}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {typingUsers.length > 0 && (
          <TypingIndicator users={typingUsers} />
        )}
      </div>
      
      <MessageInput
        onSend={handleSendMessage}
        onTyping={handleTyping}
      />

      <input
        ref={fileInputRef}
        type=\"file\"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        accept=\"image/*,video/*\"
      />
    </div>
  );
}
```

### Task 4.3: Post-Trip Rating & Review System
**Description:** Implement comprehensive rating system for trip members to rate each other and the overall trip experience.

**Acceptance Criteria:**
- Post-trip rating workflow triggered automatically
- Multi-dimensional rating system (reliability, friendliness, organization)
- Written review functionality
- Anonymous rating options
- Rating aggregation and display on profiles
- Trip satisfaction ratings
- Constructive feedback system

**Estimated Complexity:** Moderate  
**Dependencies:** Task 4.2  
**Files Created:**
- `src/services/ratingService.ts`
- `src/screens/rating/PostTripRatingScreen.tsx`
- `src/components/rating/MemberRatingCard.tsx`
- `src/components/rating/RatingStars.tsx`
- `src/types/rating.ts`

**Code Example:**
```typescript
// src/types/rating.ts
export interface UserRating {
  id: string;
  tripId: string;
  raterId: string; // Person giving the rating
  rateeId: string; // Person being rated
  ratings: {
    reliability: number; // 1-5 stars
    friendliness: number; // 1-5 stars
    organization: number; // 1-5 stars (for trip organizers)
    communication: number; // 1-5 stars
  };
  overallRating: number; // Average of individual ratings
  review?: string;
  isAnonymous: boolean;
  createdAt: Date;
  tripTitle: string;
}

export interface TripRating {
  id: string;
  tripId: string;
  userId: string;
  ratings: {
    overallExperience: number;
    itineraryQuality: number;
    groupDynamics: number;
    valueForMoney: number;
  };
  overallRating: number;
  review?: string;
  wouldRecommend: boolean;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  // ... other profile fields
  ratings: {
    averageRating: number;
    totalRatings: number;
    reliability: number;
    friendliness: number;
    organization: number;
    communication: number;
    recentReviews: UserRating[];
  };
  tripStats: {
    tripsCompleted: number;
    tripsOrganized: number;
    successfulTrips: number;
  };
}

// src/services/ratingService.ts
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  increment,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserRating, TripRating } from '../types';

export async function submitUserRating(rating: Omit<UserRating, 'id' | 'createdAt'>): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      // Add the rating
      const ratingsRef = collection(db, 'userRatings');
      const newRatingRef = doc(ratingsRef);
      
      const ratingData = {
        ...rating,
        createdAt: new Date(),
        overallRating: calculateOverallRating(rating.ratings)
      };
      
      transaction.set(newRatingRef, ratingData);
      
      // Update the ratee's profile with new rating
      const userRef = doc(db, 'users', rating.rateeId);
      
      // This would require fetching current ratings and recalculating averages
      // For brevity, showing the concept
      transaction.update(userRef, {
        'ratings.totalRatings': increment(1),
        'ratings.averageRating': calculateNewAverage(rating.overallRating),
        'ratings.reliability': updateCategoryAverage('reliability', rating.ratings.reliability),
        'ratings.friendliness': updateCategoryAverage('friendliness', rating.ratings.friendliness),
        'ratings.organization': updateCategoryAverage('organization', rating.ratings.organization),
        'ratings.communication': updateCategoryAverage('communication', rating.ratings.communication)
      });
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    throw new Error('Failed to submit rating');
  }
}

export async function submitTripRating(rating: Omit<TripRating, 'id' | 'createdAt'>): Promise<void> {
  try {
    const tripRatingsRef = collection(db, 'tripRatings');
    
    const ratingData = {
      ...rating,
      createdAt: new Date(),
      overallRating: calculateOverallTripRating(rating.ratings)
    };
    
    await addDoc(tripRatingsRef, ratingData);
    
    // Update trip's average rating
    const tripRef = doc(db, 'trips', rating.tripId);
    await updateDoc(tripRef, {
      'ratings.totalRatings': increment(1),
      'ratings.averageRating': calculateNewTripAverage(rating.overallRating)
    });
  } catch (error) {
    console.error('Error submitting trip rating:', error);
    throw new Error('Failed to submit trip rating');
  }
}

export async function getRatingsForUser(userId: string): Promise<UserRating[]> {
  try {
    const ratingsRef = collection(db, 'userRatings');
    const q = query(ratingsRef, where('rateeId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as UserRating));
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    return [];
  }
}

function calculateOverallRating(ratings: UserRating['ratings']): number {
  const values = Object.values(ratings).filter(val => val > 0);
  return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
}

function calculateOverallTripRating(ratings: TripRating['ratings']): number {
  const values = Object.values(ratings);
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}
```

### Task 4.4: Safety & Reporting System
**Description:** Implement comprehensive safety features including user reporting, content moderation, and emergency contacts.

**Acceptance Criteria:**
- User reporting system with categorized report types
- Content moderation for inappropriate messages/behavior
- Emergency contact sharing within groups
- Safety guidelines and tips integration
- Block user functionality
- Admin moderation dashboard
- Automated safety alerts

**Estimated Complexity:** Moderate  
**Dependencies:** Task 4.3  
**Files Created:**
- `src/services/safetyService.ts`
- `src/screens/safety/ReportUserScreen.tsx`
- `src/screens/safety/SafetyGuidelinesScreen.tsx`
- `src/components/safety/EmergencyContacts.tsx`
- `src/types/safety.ts`

**Code Example:**
```typescript
// src/types/safety.ts
export interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  tripId?: string;
  category: 'harassment' | 'inappropriate_content' | 'safety_concern' | 'spam' | 'other';
  description: string;
  evidence?: {
    screenshots: string[];
    messageIds: string[];
  };
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: Date;
  resolvedAt?: Date;
  moderatorNotes?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  isPrimary: boolean;
}

export interface SafetySettings {
  shareEmergencyContacts: boolean;
  allowDirectMessages: boolean;
  profileVisibility: 'public' | 'trips_only' | 'private';
  blockedUsers: string[];
}

// src/services/safetyService.ts
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserReport, EmergencyContact } from '../types';

export async function reportUser(report: Omit<UserReport, 'id' | 'createdAt' | 'status'>): Promise<void> {
  try {
    const reportsRef = collection(db, 'userReports');
    
    const reportData = {
      ...report,
      status: 'pending' as const,
      createdAt: new Date()
    };
    
    await addDoc(reportsRef, reportData);
    
    // Send notification to moderators
    await notifyModerators(reportData);
    
    // Auto-moderate based on report type and user history
    await autoModerate(report.reportedUserId, report.category);
    
  } catch (error) {
    console.error('Error submitting report:', error);
    throw new Error('Failed to submit report');
  }
}

export async function blockUser(blockerId: string, blockedUserId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', blockerId);
    await updateDoc(userRef, {
      'safetySettings.blockedUsers': arrayUnion(blockedUserId)
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    throw new Error('Failed to block user');
  }
}

export async function updateEmergencyContacts(
  userId: string,
  contacts: EmergencyContact[]
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      emergencyContacts: contacts
    });
  } catch (error) {
    console.error('Error updating emergency contacts:', error);
    throw new Error('Failed to update emergency contacts');
  }
}

async function notifyModerators(report: UserReport): Promise<void> {
  // Implementation would send notifications to moderators
  // Could use Firebase Cloud Functions for this
}

async function autoModerate(userId: string, category: UserReport['category']): Promise<void> {
  // Implementation would check user's report history
  // and take automatic actions if necessary (temporary restrictions, etc.)
}
```

### Task 4.5: Push Notifications System
**Description:** Implement comprehensive push notification system for trip updates, messages, and important events.

**Acceptance Criteria:**
- Push notification setup for both iOS and Android
- Notification categories (messages, trip updates, join requests, etc.)
- User notification preferences and settings
- Background notification handling
- Deep linking from notifications
- Notification scheduling for trip reminders
- Batch notifications for efficiency

**Estimated Complexity:** Moderate  
**Dependencies:** Task 4.4  
**Files Created:**
- `src/services/notificationService.ts`
- `src/config/notificationConfig.ts`
- `src/screens/settings/NotificationSettingsScreen.tsx`
- `src/hooks/useNotifications.ts`

**Code Example:**
```typescript
// src/services/notificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface NotificationData {
  type: 'message' | 'join_request' | 'trip_update' | 'rating_reminder' | 'trip_reminder';
  tripId?: string;
  senderId?: string;
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  async initialize(): Promise<string | null> {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return null;
      }

      // Get push token
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      
      // Configure notification handling
      this.configureNotifications();
      
      return token;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  }

  private configureNotifications(): void {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Handle notification response (when user taps notification)
    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      this.handleNotificationTap(data);
    });
  }

  async updateUserToken(userId: string, token: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        pushToken: token,
        tokenUpdatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating push token:', error);
    }
  }

  async sendNotification(
    userIds: string[],
    notification: NotificationData
  ): Promise<void> {
    try {
      // In a real app, this would be handled by a backend service
      // For now, showing the structure
      const message = {
        to: userIds, // This would be push tokens in reality
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: {
          type: notification.type,
          ...notification.data
        }
      };

      // Send via Expo Push Service or Firebase Cloud Messaging
      await this.sendPushNotification(message);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async scheduleNotification(
    notification: NotificationData,
    scheduledFor: Date
  ): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
        },
        trigger: {
          date: scheduledFor,
        },
      });
      
      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw new Error('Failed to schedule notification');
    }
  }

  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  private handleNotificationTap(data: any): void {
    // Navigate to appropriate screen based on notification type
    switch (data.type) {
      case 'message':
        // Navigate to chat screen
        break;
      case 'join_request':
        // Navigate to manage trip screen
        break;
      case 'trip_update':
        // Navigate to trip details
        break;
      default:
        // Navigate to main screen
        break;
    }
  }

  private async sendPushNotification(message: any): Promise<void> {
    // Implementation would use Expo Push Service or FCM
    // This is typically done from a backend service
  }
}

export const notificationService = new NotificationService();

// Notification helper functions
export async function notifyNewMessage(
  tripId: string,
  senderName: string,
  messageContent: string,
  recipientIds: string[]
): Promise<void> {
  await notificationService.sendNotification(recipientIds, {
    type: 'message',
    tripId,
    title: `New message from ${senderName}`,
    body: messageContent.length > 100 ? messageContent.substring(0, 100) + '...' : messageContent,
    data: { tripId }
  });
}

export async function notifyJoinRequest(
  tripId: string,
  requesterName: string,
  tripTitle: string,
  adminIds: string[]
): Promise<void> {
  await notificationService.sendNotification(adminIds, {
    type: 'join_request',
    tripId,
    title: 'New Join Request',
    body: `${requesterName} wants to join "${tripTitle}"`,
    data: { tripId }
  });
}
```

### Task 4.6: User Profile Enhancement & Social Features
**Description:** Enhance user profiles with social features, travel history, and community elements.

**Acceptance Criteria:**
- Enhanced profile display with travel stats
- Travel badge and achievement system
- User verification status
- Travel history and completed trips
- Profile privacy settings
- Social connections and friend system
- Profile photo and gallery features

**Estimated Complexity:** Moderate  
**Dependencies:** Task 4.5  
**Files Created:**
- `src/screens/profile/EnhancedProfileScreen.tsx`
- `src/components/profile/TravelStats.tsx`
- `src/components/profile/BadgeCollection.tsx`
- `src/components/profile/TravelHistory.tsx`
- `src/services/profileService.ts`

**Code Example:**
```typescript
// src/components/profile/TravelStats.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { UserProfile } from '../../types';
import { styles } from './ProfileStyles';

interface TravelStatsProps {
  profile: UserProfile;
}

export default function TravelStats({ profile }: TravelStatsProps) {
  const stats = profile.tripStats;
  
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.tripsCompleted}</Text>
        <Text style={styles.statLabel}>Trips Completed</Text>
      </View>
      
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.tripsOrganized}</Text>
        <Text style={styles.statLabel}>Trips Organized</Text>
      </View>
      
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{profile.ratings.averageRating.toFixed(1)}</Text>
        <Text style={styles.statLabel}>Average Rating</Text>
      </View>
      
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {Math.round((stats.successfulTrips / stats.tripsCompleted) * 100)}%
        </Text>
        <Text style={styles.statLabel}>Success Rate</Text>
      </View>
    </View>
  );
}
```

### Task 4.7: App Performance Optimization & Polish
**Description:** Final optimization pass focusing on performance, user experience, and visual polish.

**Acceptance Criteria:**
- App performance optimization (loading times, animations)
- Memory usage optimization
- Offline functionality improvements
- Error boundary implementation
- Loading skeleton screens
- Smooth animations and transitions
- Accessibility improvements
- Final UI/UX polish and consistency

**Estimated Complexity:** Moderate  
**Dependencies:** Task 4.6  
**Files Created:**
- `src/components/common/LoadingSkeleton.tsx`
- `src/components/common/ErrorBoundary.tsx`
- `src/utils/performance.ts`
- `src/hooks/useOfflineSync.ts`

**Code Example:**
```typescript
// src/components/common/LoadingSkeleton.tsx
import React from 'react';
import { View, Animated } from 'react-native';
import { styles } from './SkeletonStyles';

interface LoadingSkeletonProps {
  type: 'trip-card' | 'message' | 'profile' | 'itinerary';
  count?: number;
}

export default function LoadingSkeleton({ type, count = 1 }: LoadingSkeletonProps) {
  const fadeAnim = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    animation.start();
    return () => animation.stop();
  }, [fadeAnim]);

  const renderSkeleton = () => {
    switch (type) {
      case 'trip-card':
        return (
          <Animated.View style={[styles.tripCard, { opacity: fadeAnim }]}>
            <View style={styles.imageRect} />
            <View style={styles.textContainer}>
              <View style={styles.titleRect} />
              <View style={styles.subtitleRect} />
              <View style={styles.tagsContainer}>
                <View style={styles.tagRect} />
                <View style={styles.tagRect} />
              </View>
            </View>
          </Animated.View>
        );
      
      case 'message':
        return (
          <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
            <View style={styles.avatar} />
            <View style={styles.messageBubble}>
              <View style={styles.messageText} />
            </View>
          </Animated.View>
        );
      
      default:
        return <View style={styles.defaultRect} />;
    }
  };

  return (
    <View>
      {Array.from({ length: count }, (_, index) => (
        <View key={index}>{renderSkeleton()}</View>
      ))}
    </View>
  );
}

// src/utils/performance.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(key: string): void {
    this.metrics.set(key, Date.now());
  }

  endTimer(key: string): number {
    const startTime = this.metrics.get(key);
    if (!startTime) return 0;
    
    const duration = Date.now() - startTime;
    this.metrics.delete(key);
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${key} took ${duration}ms`);
    }
    
    return duration;
  }

  measureAsync<T>(key: string, operation: () => Promise<T>): Promise<T> {
    this.startTimer(key);
    return operation().finally(() => {
      this.endTimer(key);
    });
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
```

## Quality Gates

### Phase 4 Completion Criteria
- [ ] Real-time web chat works reliably across browsers with proper message delivery
- [ ] Rating system functions end-to-end with proper data aggregation
- [ ] Safety features are accessible and functional via web interface
- [ ] Web notifications work on supported browsers
- [ ] User profiles display enhanced information correctly on all screen sizes
- [ ] Web app performance meets acceptable standards (<3s load times)
- [ ] Responsive design works seamlessly on mobile and desktop
- [ ] All animations are smooth and performant
- [ ] Web accessibility features are implemented (ARIA, keyboard navigation)
- [ ] Error handling provides meaningful feedback with toast notifications
- [ ] Chat search and file upload functionality works properly
- [ ] Cross-browser compatibility is maintained

### Testing Requirements
- Real-time chat testing with multiple browser sessions
- Rating system accuracy testing across different browsers
- Web notification delivery testing on supported browsers
- Performance testing under load with multiple users
- Responsive design testing on various devices
- Accessibility testing with screen readers and keyboard navigation
- Cross-browser compatibility testing (Chrome, Firefox, Safari, Edge)
- Mobile browser testing for touch interactions

## Risk Mitigation

**Potential Issues:**
- Real-time chat scalability → Use Firebase Firestore optimizations and proper indexing
- Web notification reliability → Implement fallback mechanisms and permission handling
- Performance on older browsers → Optimize bundle size, implement lazy loading
- Rating system gaming → Implement validation and abuse detection
- Browser compatibility → Use polyfills and progressive enhancement
- Mobile browser limitations → Test thoroughly on various mobile browsers

**Dependencies:**
- Firebase Firestore real-time performance
- Web notification API support across browsers
- Modern browser capabilities for real-time features
- File upload API support for media sharing
- Web storage APIs for offline functionality

## Final MVP Completion

Upon completion of Phase 4, the WanderGroup MVP will include:

✅ **Complete User Journey:**
- User registration and onboarding
- Trip creation and discovery
- Join request workflow
- AI-powered itinerary generation
- Group communication
- Trip completion and rating

✅ **Core Features:**
- Authentication and user management
- Trip CRUD operations with filtering
- Real-time group chat
- AI itinerary generation with Google Maps
- Collaborative itinerary editing
- Rating and review system
- Safety and reporting features

✅ **Technical Requirements:**
- Responsive web application (desktop + mobile browsers)
- Real-time data synchronization via Firestore
- Progressive Web App capabilities
- Web notifications
- Performance optimization for web
- Security and privacy features
- Cross-browser compatibility

---

**Congratulations! The WanderGroup web MVP is now complete and ready for user testing and market validation across all modern browsers and devices.**
