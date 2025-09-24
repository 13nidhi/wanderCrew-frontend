import Header from '@components/layout/Header';
import RightSidebar from '@components/layout/RightSidebar';
import Sidebar from '@components/layout/Sidebar';
import DashboardPage from '@pages/DashboardPage';
import React, { useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Import styles
import './styles/components.css';
import './styles/globals.css';
import './styles/layout.css';

const App: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightSidebarHidden, setRightSidebarHidden] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleMenuToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'light' : 'dark');
  };

  return (
    <Router>
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
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Add more routes as we build them */}
          </Routes>
        </main>
        
        <RightSidebar hidden={rightSidebarHidden} />
      </div>
    </Router>
  );
};

export default App;
