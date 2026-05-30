import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';

const INITIAL_REPORTS = [
  {
    id: 1,
    title: "Glowing Orb Sighting",
    description: "A bright orange glowing spherical object observed hovering completely silently. It suddenly accelerated at extreme speed and vanished.",
    type: "Aerial",
    tag: "Unidentified",
    distance: "1.2 km away",
    time: "32 min ago",
    lat: 33.3980,
    lng: -104.5290,
    behaviors: ["Hovering", "Silent", "Lights", "Disappeared"]
  },
  {
    id: 2,
    title: "Metallic Disc Sighting",
    description: "Disc-shaped metallic structure observed rotating slowly. Emitted a low hum. Flight path didn't resemble commercial aircraft.",
    type: "Aerial",
    tag: "Aerial",
    distance: "2.5 km away",
    time: "1.5 hours ago",
    lat: 33.3850,
    lng: -104.5120,
    behaviors: ["Hovering", "Lights", "Rotating"]
  },
  {
    id: 3,
    title: "Green Ground Beam",
    description: "A bright green beam of light projected from the ground into the cloud layer. No source or device was visible nearby.",
    type: "Land",
    tag: "Land",
    distance: "3.8 km away",
    time: "3 hours ago",
    lat: 33.4110,
    lng: -104.5020,
    behaviors: ["Lights"]
  },
  {
    id: 4,
    title: "Formation Cluster Sighting",
    description: "Multiple moving lights seen maneuvering in formation. Over 15 independent witnesses reported this event within 30 minutes.",
    type: "Aerial",
    tag: "Alert",
    distance: "1.9 km away",
    time: "4 hours ago",
    lat: 33.3910,
    lng: -104.5450,
    behaviors: ["Fast-moving", "Lights"]
  }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [draftReport, setDraftReport] = useState(null);

  // Responsive state
  const [isWidescreen, setIsWidescreen] = useState(window.innerWidth >= 1024);

  // Track window resizing for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsWidescreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync body theme for desktop background fill
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme-bg');
    } else {
      document.body.classList.remove('light-theme-bg');
    }
  }, [theme]);

  // Authentication Flow Handlers
  const handleSignIn = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleSignOut = () => {
    setUser(null);
    setDraftReport(null);
    setCurrentPage('landing');
  };

  // Report Flow Handlers
  const handleSubmitReport = (newReport) => {
    setReports(prev => [newReport, ...prev]);
  };

  const handleResetReports = () => {
    setReports(INITIAL_REPORTS);
  };

  const handleAutoReport = (draftData) => {
    setDraftReport(draftData); // Set draft data which triggers transition to 'report' tab
  };

  const handleClearDraft = () => {
    setDraftReport(null);
  };

  // Determine if the content should be rendered in laptop/desktop dimensions
  const isLaptopDimensions = isWidescreen;

  // Render Page Content based on Router State
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <Landing onNavigate={setCurrentPage} isLaptopDimensions={isLaptopDimensions} />;
      case 'signin':
        return <SignIn onNavigate={setCurrentPage} onSignIn={handleSignIn} isLaptopDimensions={isLaptopDimensions} />;
      case 'signup':
        return <SignUp onNavigate={setCurrentPage} onSignIn={handleSignIn} isLaptopDimensions={isLaptopDimensions} />;
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            reports={reports} 
            onSubmitReport={handleSubmitReport} 
            onResetReports={handleResetReports} 
            onSignOut={handleSignOut} 
            draftReport={draftReport}
            onAutoReport={handleAutoReport}
            onClearDraft={handleClearDraft}
            theme={theme}
            onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            isLaptopDimensions={isLaptopDimensions}
          />
        );
      default:
        return <Landing onNavigate={setCurrentPage} isLaptopDimensions={isLaptopDimensions} />;
    }
  };

  const appContent = (
    <div className={`w-full min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''} bg-aura-deep`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col"
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#030508] text-[#c8d8ff]' : 'bg-[#dde4ee] text-[#0f172a]'} flex flex-col font-sans antialiased transition-colors duration-300`}>
      {appContent}
    </div>
  );
}

