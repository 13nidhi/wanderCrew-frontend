import { useAuth } from '@contexts/AuthContext';
import type { BaseComponentProps } from '@types/components';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps extends BaseComponentProps {
  onMenuToggle?: () => void;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  onThemeToggle,
  isDarkMode = false,
  className = '',
}) => {
  const [isPromoVisible, setIsPromoVisible] = useState(true);
  const { user, signOut } = useAuth();

  return (
    <header className={`app-header ${className}`}>
      {/* Left Section */}
      <div className="header-left">
        <button
          className="mobile-menu-toggle"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <Link to="/" className="logo">
          <div className="logo-icon">W</div>
          <span className="logo-text">WanderGroup</span>
        </Link>
      </div>

      {/* Center Section - Promotional Banner */}
      <div className="header-center">
        {isPromoVisible && (
          <div className="promo-banner">
            <span>🎉</span>
            <span>Join 1000+ Travelers</span>
            <div className="promo-banner-diamond" />
            <span>Create Your First Trip</span>
            <div className="promo-banner-diamond" />
            <span>Free Forever</span>
            <button
              onClick={() => setIsPromoVisible(false)}
              className="ml-2 text-xs opacity-70 hover:opacity-100"
              aria-label="Close promotional banner"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="header-right">
        <button
          className="theme-toggle"
          onClick={onThemeToggle}
          aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
          {isDarkMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {user ? (
          <>
            <Link to="/profile" className="btn btn-secondary">
              Profile
            </Link>
            <button
              onClick={signOut}
              className="btn btn-outline"
              aria-label="Sign out"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary">
              Log in
            </Link>
            <Link to="/signup" className="btn btn-primary">
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
