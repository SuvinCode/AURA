import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';

const INITIAL_REPORTS = [
  {
    id: 1,
    title: "Roswell Incident (1947)",
    description: "Highly classified metallic disc-shaped wreckage recovered at a ranch near Roswell, NM. RAAF press release confirmed recovery of a 'flying disc' before official retraction.",
    type: "Aerial",
    tag: "Unidentified",
    distance: "1.2 km away",
    time: "July 1947",
    lat: 33.3943,
    lng: -104.5230,
    behaviors: ["Silent", "Lights", "Disappeared"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><circle cx="50" cy="50" r="35" stroke="%23B06AFF" stroke-width="1" fill="none" opacity="0.3"/><line x1="50" y1="10" x2="50" y2="90" stroke="%23B06AFF" stroke-dasharray="2" opacity="0.2"/><line x1="10" y1="50" x2="90" y2="50" stroke="%23B06AFF" stroke-dasharray="2" opacity="0.2"/><circle cx="50" cy="50" r="6" fill="%23B06AFF"/><circle cx="50" cy="50" r="14" stroke="%23B06AFF" stroke-width="1" fill="none" opacity="0.5"/></svg>'
  },
  {
    id: 2,
    title: "Phoenix Lights (1997)",
    description: "A massive, silent V-shaped aircraft housing five intense spherical lights cruised slowly over the Phoenix metro area. Witnessed by thousands of residents.",
    type: "Aerial",
    tag: "Unidentified",
    distance: "512.4 km away",
    time: "March 1997",
    lat: 33.4484,
    lng: -112.0740,
    behaviors: ["Hovering", "Silent", "Lights"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><path d="M50 30 L30 70 M50 30 L70 70" stroke="%233a6bff" stroke-width="1" fill="none" opacity="0.4"/><circle cx="50" cy="30" r="3" fill="%23ff8c00"/><circle cx="40" cy="50" r="3" fill="%23ff8c00"/><circle cx="60" cy="50" r="3" fill="%23ff8c00"/><circle cx="30" cy="70" r="3" fill="%23ff8c00"/><circle cx="70" cy="70" r="3" fill="%23ff8c00"/></svg>'
  },
  {
    id: 3,
    title: "Rendlesham Forest (1980)",
    description: "USAF personnel stationed at RAF Bentwaters observed a glowing, metallic triangular craft landing in Rendlesham Forest. Physical ground depressions and radiation spikes were verified.",
    type: "Land",
    tag: "Land",
    distance: "8400.1 km away",
    time: "December 1980",
    lat: 52.0911,
    lng: 1.4395,
    behaviors: ["Lights", "Silent"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><polygon points="50,20 25,75 75,75" stroke="%2322C97A" stroke-width="1.5" fill="none" opacity="0.5"/><circle cx="50" cy="50" r="4" fill="%2322C97A"/></svg>'
  },
  {
    id: 4,
    title: "Tehran Jet Chase (1976)",
    description: "An anomalous bright light disabled the instrumentation and weapons control systems of two Iranian F-4 fighter jets attempting intercept maneuvers over Tehran.",
    type: "Aerial",
    tag: "Alert",
    distance: "11200.5 km away",
    time: "September 1976",
    lat: 35.6892,
    lng: 51.3890,
    behaviors: ["Fast-moving", "Lights", "Disappeared"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><circle cx="50" cy="50" r="30" stroke="%23ff3e3e" stroke-width="1" fill="none" stroke-dasharray="4 2"/><circle cx="50" cy="50" r="6" fill="%23ff3e3e"/><line x1="20" y1="50" x2="80" y2="50" stroke="%23ff3e3e" opacity="0.4"/><line x1="50" y1="20" x2="50" y2="80" stroke="%23ff3e3e" opacity="0.4"/></svg>'
  },
  {
    id: 5,
    title: "Westall Landing (1966)",
    description: "Over 200 students and staff at Westall High School witnessed three metallic saucers hover silently over nearby fields before landing in a pine paddock.",
    type: "Land",
    tag: "Land",
    distance: "14050.2 km away",
    time: "April 1966",
    lat: -37.9863,
    lng: 145.1481,
    behaviors: ["Hovering", "Silent", "Disappeared"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><ellipse cx="50" cy="50" rx="35" ry="12" stroke="%2322C97A" stroke-width="1.5" fill="none" opacity="0.6"/><circle cx="50" cy="46" r="4" fill="%2322C97A"/></svg>'
  },
  {
    id: 6,
    title: "Chicago O'Hare Saucer (2006)",
    description: "United Airlines pilots and ramp staff reported a dark-grey metallic craft hovering over Gate C17 at O'Hare Airport. The craft shot straight upward, punching a circular hole in the clouds.",
    type: "Aerial",
    tag: "Aerial",
    distance: "1850.3 km away",
    time: "November 2006",
    lat: 41.9742,
    lng: -87.9073,
    behaviors: ["Fast-moving", "Hovering", "Silent"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><ellipse cx="50" cy="50" rx="25" ry="8" stroke="%2322B8C9" stroke-width="1.5" fill="none"/><line x1="50" y1="50" x2="50" y2="15" stroke="%2322B8C9" stroke-width="1" stroke-dasharray="3 3"/></svg>'
  },
  {
    id: 7,
    title: "Belgian Triangle Wave (1989)",
    description: "A wave of massive triangular objects tracking across Belgium, confirmed by ground observers, military radar, and chased by Air Force F-16 interceptors.",
    type: "Aerial",
    tag: "Alert",
    distance: "8200.7 km away",
    time: "November 1989",
    lat: 50.8503,
    lng: 4.3517,
    behaviors: ["Fast-moving", "Silent", "Rotating", "Lights"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><polygon points="50,30 25,70 75,70" stroke="%23FF6B35" stroke-width="1.5" fill="none"/><circle cx="50" cy="40" r="3" fill="%23ff3e3e"/><circle cx="35" cy="65" r="3" fill="%23ff3e3e"/><circle cx="65" cy="65" r="3" fill="%23ff3e3e"/></svg>'
  },
  {
    id: 8,
    title: "Shag Harbour Crash (1967)",
    description: "A large glowing dome crashed into the waters of Shag Harbour, Nova Scotia. RCMP and local fishermen watched the craft float and glow before it submerged.",
    type: "Land",
    tag: "Land",
    distance: "3200.4 km away",
    time: "October 1967",
    lat: 43.5008,
    lng: -65.7163,
    behaviors: ["Lights", "Disappeared"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><path d="M20 60 Q50 30 80 60 Z" stroke="%2322C97A" stroke-width="1.5" fill="none"/><line x1="15" y1="65" x2="85" y2="65" stroke="%2322C97A" opacity="0.5"/></svg>'
  },
  {
    id: 9,
    title: "Lubbock Lights (1951)",
    description: "A V-shaped cluster of 20-30 glowing blue-green spherical lights photographed by Texas Tech professors as they zipped across Lubbock skies at hypersonic speeds.",
    type: "Aerial",
    tag: "Aerial",
    distance: "290.1 km away",
    time: "August 1951",
    lat: 33.5779,
    lng: -101.8552,
    behaviors: ["Fast-moving", "Lights"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><circle cx="30" cy="40" r="3" fill="%2322B8C9"/><circle cx="40" cy="50" r="3" fill="%2322B8C9"/><circle cx="50" cy="60" r="3" fill="%2322B8C9"/><circle cx="60" cy="50" r="3" fill="%2322B8C9"/><circle cx="70" cy="40" r="3" fill="%2322B8C9"/></svg>'
  },
  {
    id: 10,
    title: "Kecksburg Acorn (1965)",
    description: "A large bronze/copper acorn-shaped object carrying alien hieroglyphs descended over Pennsylvania and crashed in Kecksburg woods. Immediately secured by the military.",
    type: "Land",
    tag: "Land",
    distance: "2300.9 km away",
    time: "December 1965",
    lat: 40.1873,
    lng: -79.4589,
    behaviors: ["Silent"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><path d="M40 30 Q50 15 60 30 Q70 55 50 80 Q30 55 40 30 Z" stroke="%2322C97A" stroke-width="1.5" fill="none"/></svg>'
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

