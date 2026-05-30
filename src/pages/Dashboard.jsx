import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Map, PlusSquare, Settings, Sun, Moon, LogOut } from 'lucide-react';
import ScanTab from '../components/ScanTab';
import MapTab from '../components/MapTab';
import ReportTab from '../components/ReportTab';
import SettingsTab from '../components/SettingsTab';

export default function Dashboard({ 
  user, 
  reports, 
  onSubmitReport, 
  onResetReports, 
  onSignOut,
  draftReport,
  onAutoReport,
  onClearDraft,
  theme,
  onToggleTheme,
  isLaptopDimensions
}) {
  const [activeTab, setActiveTab] = useState('scan');

  // If a report draft is initialized by the scanner, swap to the 'report' tab
  useEffect(() => {
    if (draftReport) {
      setActiveTab('report');
    }
  }, [draftReport]);

  const handleReportSubmit = (newReport) => {
    onSubmitReport(newReport);
    // Switch to Map tab after report submission
    setActiveTab('map');
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'scan':
        return <ScanTab onAutoReport={onAutoReport} theme={theme} isLaptopDimensions={isLaptopDimensions} />;
      case 'map':
        return <MapTab reports={reports} theme={theme} isLaptopDimensions={isLaptopDimensions} />;
      case 'report':
        return (
          <ReportTab 
            draftReport={draftReport} 
            onSubmitReport={handleReportSubmit} 
            onClearDraft={onClearDraft} 
            isLaptopDimensions={isLaptopDimensions}
          />
        );
      case 'settings':
        return (
          <SettingsTab 
            user={user} 
            onSignOut={onSignOut} 
            onResetReports={onResetReports} 
            isLaptopDimensions={isLaptopDimensions}
          />
        );
      default:
        return <ScanTab onAutoReport={onAutoReport} theme={theme} isLaptopDimensions={isLaptopDimensions} />;
    }
  };

  if (isLaptopDimensions) {
    return (
      <div className="flex-1 flex flex-row h-screen max-h-screen overflow-hidden bg-aura-deep text-aura-text transition-colors duration-300">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-64 bg-aura-card/30 border-r border-aura-border flex flex-col justify-between p-5 select-none transition-colors duration-300">
          
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <svg className="w-6 h-6 animate-pulse" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="40" stroke="var(--color-aura-blue)" strokeWidth="6" strokeDasharray="15 10" />
                <circle cx="50" cy="50" r="20" fill="var(--color-aura-purple)" opacity="0.8" />
              </svg>
              <div>
                <span className="font-extrabold tracking-widest text-xs text-aura-text">AURA SYSTEM</span>
                <p className="text-[8px] text-aura-muted font-mono leading-none mt-0.5">ARCHIVE INTERFACE</p>
              </div>
            </div>

            {/* Navigation options */}
            <nav className="flex flex-col gap-1.5">
              <button
                id="sidebar-tab-scan"
                onClick={() => setActiveTab('scan')}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeTab === 'scan'
                    ? 'bg-aura-input text-aura-blue border-aura-border shadow-sm'
                    : 'text-aura-muted hover:text-aura-text hover:bg-aura-input/30 border-transparent'
                }`}
              >
                <Camera className="w-4.5 h-4.5" />
                <span>Scan & Identify</span>
              </button>

              <button
                id="sidebar-tab-map"
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeTab === 'map'
                    ? 'bg-aura-input text-aura-blue border-aura-border shadow-sm'
                    : 'text-aura-muted hover:text-aura-text hover:bg-aura-input/30 border-transparent'
                }`}
              >
                <Map className="w-4.5 h-4.5" />
                <span>Live Radar Map</span>
              </button>

              <button
                id="sidebar-tab-report"
                onClick={() => setActiveTab('report')}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeTab === 'report'
                    ? 'bg-aura-input text-aura-blue border-aura-border shadow-sm'
                    : 'text-aura-muted hover:text-aura-text hover:bg-aura-input/30 border-transparent'
                }`}
              >
                <PlusSquare className="w-4.5 h-4.5" />
                <span>Transmit Sighting</span>
              </button>

              <button
                id="sidebar-tab-settings"
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeTab === 'settings'
                    ? 'bg-aura-input text-aura-blue border-aura-border shadow-sm'
                    : 'text-aura-muted hover:text-aura-text hover:bg-aura-input/30 border-transparent'
                }`}
              >
                <Settings className="w-4.5 h-4.5" />
                <span>Interface Settings</span>
              </button>

              <button
                id="sidebar-tab-logout"
                onClick={onSignOut}
                className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent text-red-500 hover:text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>Log Out</span>
              </button>
            </nav>
          </div>

          {/* Sidebar Footer telemetry */}
          <div className="flex flex-col gap-3 pt-4 border-t border-aura-border/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-aura-muted tracking-wider">PROTOCOL:</span>
              <button
                id="sidebar-toggle-theme"
                onClick={onToggleTheme}
                className="p-1.5 rounded-lg bg-aura-input border border-aura-border hover:border-aura-blue text-aura-text hover:text-aura-blue transition-all cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
            
            <div className="flex items-center justify-between font-mono text-[9px] text-aura-muted">
              <span>SECURE LEVEL:</span>
              <span className="text-aura-green font-bold">ALPHA_SEC</span>
            </div>

            <div className="flex items-center justify-between font-mono text-[9px] text-aura-muted">
              <span>USER PROFILE:</span>
              <span className="text-aura-purple font-semibold max-w-[120px] truncate">
                {user ? user.username : 'Observer'}
              </span>
            </div>
          </div>

        </aside>

        {/* Right Dashboard Content Panel */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-aura-deep transition-colors duration-300">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {renderActiveTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    );
  }

  // Mobile/Phone view layout (with bottom nav bar and header)
  return (
    <div className="flex-1 flex flex-col h-screen max-h-screen overflow-hidden bg-aura-deep text-aura-text transition-colors duration-300">
      
      {/* Top Header Bar */}
      <header className="px-4 py-3 bg-aura-deep border-b border-aura-border flex justify-between items-center select-none transition-colors duration-300">
        <div className="flex items-center gap-2">
          {/* Small Aura Logo Halo Icon */}
          <svg className="w-6 h-6 animate-pulse" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="40" stroke="var(--color-aura-blue)" strokeWidth="6" strokeDasharray="15 10" />
            <circle cx="50" cy="50" r="20" fill="var(--color-aura-purple)" opacity="0.8" />
          </svg>
          <span className="font-bold tracking-wider text-sm text-aura-text">AURA ARCHIVE</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            id="toggle-theme"
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg bg-aura-input border border-aura-border hover:border-aura-blue text-aura-text hover:text-aura-blue transition-all cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <button
            id="mobile-logout"
            onClick={onSignOut}
            className="p-1.5 rounded-lg bg-aura-input border border-aura-border hover:border-red-500/50 text-red-500 hover:text-red-400 transition-all cursor-pointer animate-none"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
          
          <span className="text-[10px] px-2 py-1 rounded bg-aura-input border border-aura-border font-mono text-aura-muted">
            SECURE_CONN_1.0
          </span>
        </div>
      </header>

      {/* Main View Area (Tab Contents) */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-aura-deep transition-colors duration-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="flex-1 flex flex-col overflow-hidden relative"
          >
            {renderActiveTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Sticky Tab Navigation Bar */}
      <nav className="h-16 bg-aura-deep border-t border-aura-border flex items-center justify-around z-40 select-none pb-safe transition-colors duration-300">
        {/* Tab 1: Scan */}
        <button
          id="tab-scan"
          onClick={() => setActiveTab('scan')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors cursor-pointer ${
            activeTab === 'scan' ? 'text-aura-blue' : 'text-aura-muted hover:text-aura-text'
          }`}
        >
          <Camera className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-semibold">Scan</span>
        </button>

        {/* Tab 2: Map */}
        <button
          id="tab-map"
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors cursor-pointer ${
            activeTab === 'map' ? 'text-aura-blue' : 'text-aura-muted hover:text-aura-text'
          }`}
        >
          <Map className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-semibold">Map</span>
        </button>

        {/* Tab 3: Report */}
        <button
          id="tab-report"
          onClick={() => setActiveTab('report')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors cursor-pointer ${
            activeTab === 'report' ? 'text-aura-blue' : 'text-aura-muted hover:text-aura-text'
          }`}
        >
          <PlusSquare className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-semibold">Report</span>
        </button>

        {/* Tab 4: Settings */}
        <button
          id="tab-settings"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors cursor-pointer ${
            activeTab === 'settings' ? 'text-aura-blue' : 'text-aura-muted hover:text-aura-text'
          }`}
        >
          <Settings className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-semibold">Settings</span>
        </button>
      </nav>
    </div>
  );
}
