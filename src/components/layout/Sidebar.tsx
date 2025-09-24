import type { BaseComponentProps } from '@types/components';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps extends BaseComponentProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavigationItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly icon: React.ReactNode;
  readonly badge?: number;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Explore',
    href: '/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    id: 'search',
    label: 'Search',
    href: '/search',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    id: 'saved',
    label: 'Saved',
    href: '/saved',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'create',
    label: 'Create Trip',
    href: '/create-trip',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
    badge: 1,
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggle,
  className = '',
}) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {collapsed && (
        <div 
          className="sidebar-overlay open" 
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${className}`}>
        <div className="sidebar-content">
          {/* Navigation Section */}
          <nav className="nav-section">
            <ul className="nav-list">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                
                return (
                  <li key={item.id}>
                    <Link
                      to={item.href}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                    >
                      <span className="nav-item-icon">
                        {item.icon}
                      </span>
                      <span className="nav-item-label">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="nav-item-badge">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Quick Actions Section */}
          <div className="nav-section">
            <h3 className="nav-section-title">Quick Actions</h3>
            <ul className="nav-list">
              <li>
                <Link to="/trips/my-trips" className="nav-item">
                  <span className="nav-item-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9,22 9,12 15,12 15,22" />
                    </svg>
                  </span>
                  <span className="nav-item-label">My Trips</span>
                </Link>
              </li>
              <li>
                <Link to="/chat" className="nav-item">
                  <span className="nav-item-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </span>
                  <span className="nav-item-label">Messages</span>
                </Link>
              </li>
              <li>
                <Link to="/settings" className="nav-item">
                  <span className="nav-item-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </span>
                  <span className="nav-item-label">Settings</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
