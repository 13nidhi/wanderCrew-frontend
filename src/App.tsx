import ErrorBoundary from '@components/common/ErrorBoundary';
import ProtectedRoute from '@components/common/ProtectedRoute';
import Header from '@components/layout/Header';
import RightSidebar from '@components/layout/RightSidebar';
import Sidebar from '@components/layout/Sidebar';
import { AuthProvider } from '@contexts/AuthContext';
import { ForgotPasswordPage, LoginPage, SignupPage } from '@pages/auth';
import DashboardPage from '@pages/DashboardPage';
import { OnboardingFlow } from '@pages/onboarding';
import ProfilePage from '@pages/ProfilePage';
import { ReduxProvider } from '@store/ReduxProvider';
import React, { useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Import styles
import './styles/components.css';
import './styles/globals.css';
import './styles/layout.css';
import './styles/onboarding.css';
import './styles/responsive.css';

// Main App Layout Component
const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightSidebarHidden] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleMenuToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'light' : 'dark');
  };

  return (
    <div className="app-layout">
      <Header
        onMenuToggle={handleMenuToggle}
        onThemeToggle={handleThemeToggle}
        isDarkMode={isDarkMode}
      />
      
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleMenuToggle}
      />
      
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${rightSidebarHidden ? 'right-sidebar-hidden' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/:userId" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          {/* Add more protected routes as we build them */}
        </Routes>
      </main>
      
      <RightSidebar hidden={rightSidebarHidden} />
    </div>
  );
};


// Main App Component
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ReduxProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Auth routes - no layout */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              
              {/* Onboarding route - no layout */}
              <Route path="/onboarding" element={<OnboardingFlow />} />
              
              {/* Protected routes - with layout */}
              <Route path="/*" element={<AppLayout />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
};

export default App;
