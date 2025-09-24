# Phase 1: Foundation & Authentication

**Duration Estimate:** 2-3 weeks  
**Goal:** Establish basic React.js web app structure, routing, and user authentication  
**Risk Level:** Low  

---

## Phase Overview

This phase establishes the fundamental architecture of the WanderGroup web application, including React.js project setup, responsive navigation structure, and complete user authentication flow. All subsequent features will build upon this foundation.

## Task Breakdown

### Task 1.1: Project Setup & Environment Configuration
**Description:** Set up React.js project with TypeScript, configure development environment, and establish project structure.

**Acceptance Criteria:**
- React.js project created with TypeScript and Vite
- ESLint and Prettier configured for code quality
- Development environment works in modern browsers
- Basic folder structure established
- Version control initialized with .gitignore
- Responsive design setup with CSS framework

**Estimated Complexity:** Simple  
**Dependencies:** None  
**Files Created:**
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── layouts/            # Layout components
├── services/           # API and external service calls
├── utils/              # Helper functions and utilities
├── types/              # TypeScript type definitions
├── contexts/           # React contexts for state management
├── hooks/              # Custom React hooks
├── styles/             # CSS/SCSS files
└── assets/             # Images, fonts, etc.
```

**Code Example - Vite Configuration:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});

// src/types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  travelPreferences: TravelPreferences;
  createdAt: Date;
}

export interface TravelPreferences {
  destinations: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  groupSizePreference: 'small' | 'medium' | 'large';
  travelStyle: 'adventure' | 'relaxed' | 'cultural' | 'budget';
}
```

### Task 1.2: Navigation Structure Implementation
**Description:** Implement React Router with responsive navigation for the web app's core flow.

**Acceptance Criteria:**
- Responsive navigation bar with main sections (Dashboard, Create, Profile, Chat)
- Client-side routing for seamless page transitions
- Authentication flow routing (Login/Signup/Onboarding)
- Protected routes for authenticated users
- Mobile-responsive navigation (hamburger menu)
- URL-based routing with proper browser history

**Estimated Complexity:** Simple  
**Dependencies:** Task 1.1  
**Files Affected:**
- `src/components/navigation/Navbar.tsx`
- `src/components/navigation/MobileMenu.tsx`
- `src/routes/AppRouter.tsx`
- `src/routes/ProtectedRoute.tsx`

**Code Example:**
```typescript
// src/routes/AppRouter.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import Navbar from '../components/navigation/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import CreateTripPage from '../pages/trips/CreateTripPage';
import ProfilePage from '../pages/profile/ProfilePage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRouter() {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      {user && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/dashboard" />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/create-trip" element={<ProtectedRoute><CreateTripPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

// src/routes/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuthContext();
  
  return user ? <>{children}</> : <Navigate to="/login" />;
}
```

### Task 1.3: Firebase Configuration & Setup
**Description:** Configure Firebase project with Authentication and Firestore database for the application.

**Acceptance Criteria:**
- Firebase project created and configured
- Firebase SDK integrated into React Native app
- Environment variables properly configured for dev/prod
- Firebase Auth enabled with email/password and Google Sign-In
- Firestore database initialized with security rules
- Connection testing successful

**Estimated Complexity:** Moderate  
**Dependencies:** Task 1.1  
**Files Created:**
- `src/config/firebase.ts`
- `src/services/auth.ts`
- `firestore.rules`

**Code Example:**
```typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Task 1.4: Authentication Context & State Management
**Description:** Create React Context for managing authentication state throughout the application.

**Acceptance Criteria:**
- AuthContext provides user state and authentication methods
- Persistent login state across app restarts
- Loading states handled during authentication operations
- Error handling for authentication failures
- Type-safe context implementation

**Estimated Complexity:** Moderate  
**Dependencies:** Task 1.3  
**Files Created:**
- `src/contexts/AuthContext.tsx`
- `src/hooks/useAuth.ts`

**Code Example:**
```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { User } from '../types';
import { getUserProfile } from '../services/userService';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          setUser(userProfile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
```

### Task 1.5: Authentication Pages Implementation
**Description:** Create login, signup, and forgot password pages with form validation and error handling.

**Acceptance Criteria:**
- Responsive login page with email/password fields
- Signup page with client-side validation
- Forgot password functionality
- Form validation with real-time error messages
- Loading states during authentication
- Mobile-first responsive design
- Accessibility features (ARIA labels, keyboard navigation)

**Estimated Complexity:** Moderate  
**Dependencies:** Task 1.4  
**Files Created:**
- `src/pages/auth/LoginPage.tsx`
- `src/pages/auth/SignupPage.tsx`
- `src/pages/auth/ForgotPasswordPage.tsx`
- `src/components/forms/AuthForm.tsx`

**Code Example:**
```typescript
// src/pages/auth/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { toast } from 'react-hot-toast';
import './AuthPages.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue your travel journey</p>
        </div>
        
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
              autoComplete="email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          
          <button 
            type="submit" 
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Don't have an account? 
            <Link to="/signup" className="auth-link">Sign up</Link>
          </p>
          <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}
```

### Task 1.6: User Profile Service Implementation
**Description:** Create service layer for user profile operations including CRUD operations with Firestore.

**Acceptance Criteria:**
- Create user profile in Firestore on signup
- Fetch user profile data
- Update user profile functionality
- Error handling for database operations
- Type-safe service methods

**Estimated Complexity:** Moderate  
**Dependencies:** Task 1.3, Task 1.4  
**Files Created:**
- `src/services/userService.ts`

**Code Example:**
```typescript
// src/services/userService.ts
import { doc, getDoc, setDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, TravelPreferences } from '../types';

export async function createUserProfile(uid: string, userData: Partial<User>): Promise<void> {
  const userRef = doc(db, 'users', uid);
  
  const newUser: User = {
    id: uid,
    email: userData.email!,
    name: userData.name!,
    profilePicture: userData.profilePicture || '',
    travelPreferences: userData.travelPreferences || {
      destinations: [],
      budgetRange: { min: 0, max: 1000 },
      groupSizePreference: 'medium',
      travelStyle: 'relaxed'
    },
    createdAt: new Date()
  };

  await setDoc(userRef, newUser);
}

export async function getUserProfile(uid: string): Promise<User> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    throw new Error('User profile not found');
  }
  
  return userSnap.data() as User;
}

export async function updateUserProfile(uid: string, updates: Partial<User>): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, updates);
}
```

### Task 1.7: Onboarding Flow Implementation
**Description:** Create multi-step onboarding flow to collect user travel preferences and complete profile setup.

**Acceptance Criteria:**
- Multi-step form with progress indicator
- Travel preference collection (destinations, budget, group size, style)
- Profile picture upload with drag-and-drop functionality
- Skip options for optional steps
- Smooth CSS transitions between steps
- Data persistence during onboarding (localStorage backup)
- Mobile-responsive design

**Estimated Complexity:** Complex  
**Dependencies:** Task 1.5, Task 1.6  
**Files Created:**
- `src/pages/onboarding/OnboardingFlow.tsx`
- `src/pages/onboarding/PreferencesPage.tsx`
- `src/pages/onboarding/ProfileSetupPage.tsx`
- `src/components/onboarding/ProgressIndicator.tsx`
- `src/components/onboarding/ImageUpload.tsx`

**Code Example:**
```typescript
// src/pages/onboarding/OnboardingFlow.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PreferencesPage from './PreferencesPage';
import ProfileSetupPage from './ProfileSetupPage';
import ProgressIndicator from '../../components/onboarding/ProgressIndicator';
import { TravelPreferences } from '../../types';
import './OnboardingFlow.css';

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<Partial<TravelPreferences>>({});
  const navigate = useNavigate();
  
  const totalSteps = 2;

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('onboarding-progress', JSON.stringify({
      currentStep,
      preferences
    }));
  }, [currentStep, preferences]);

  // Load progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('onboarding-progress');
    if (saved) {
      const { currentStep: savedStep, preferences: savedPrefs } = JSON.parse(saved);
      setCurrentStep(savedStep);
      setPreferences(savedPrefs);
    }
  }, []);

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

  const handleComplete = () => {
    localStorage.removeItem('onboarding-progress');
    navigate('/dashboard');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PreferencesPage
            preferences={preferences}
            onUpdate={setPreferences}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <ProfileSetupPage
            preferences={preferences}
            onBack={handleBack}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-container">
      <ProgressIndicator currentStep={currentStep + 1} totalSteps={totalSteps} />
      <div className="onboarding-content">
        {renderCurrentStep()}
      </div>
    </div>
  );
}

// src/components/onboarding/ImageUpload.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './ImageUpload.css';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  currentImage?: string;
}

export default function ImageUpload({ onImageSelect, currentImage }: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      onImageSelect(acceptedFiles[0]);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1
  });

  return (
    <div className="image-upload-container">
      <div 
        {...getRootProps()} 
        className={`image-upload-dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        {currentImage ? (
          <img src={currentImage} alt="Profile preview" className="image-preview" />
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">📸</div>
            <p>Drag & drop your photo here, or click to select</p>
            <small>PNG, JPG, GIF up to 5MB</small>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Quality Gates

### Phase 1 Completion Criteria
- [ ] All authentication flows work correctly (login, signup, logout)
- [ ] User can complete onboarding and preferences are saved
- [ ] Navigation between all pages functions properly with React Router
- [ ] Web app works on desktop and mobile browsers
- [ ] Responsive design works across different screen sizes
- [ ] Firebase integration is stable and secure
- [ ] Code passes all linting and type checking
- [ ] Basic error handling is in place
- [ ] Web accessibility standards are met (ARIA labels, keyboard navigation)

### Testing Requirements
- Unit tests for authentication services
- Integration tests for onboarding flow
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile browser testing (responsive design)
- Firebase security rules testing
- Accessibility testing with screen readers

## Risk Mitigation

**Potential Issues:**
- Firebase configuration problems → Have backup authentication strategy
- Browser compatibility issues → Use polyfills and progressive enhancement
- Onboarding complexity → Keep forms simple and provide skip options
- Image upload limitations → Implement proper file size and type validation

**Dependencies:**
- Firebase service availability
- Modern browser support for ES6+ features
- Web APIs (File API, localStorage) availability

---

**Next Phase:** [Phase 2: Core Trip Features](./phase-2-core-features.md)
