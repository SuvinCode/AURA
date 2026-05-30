import React, { useState } from 'react';
import { User, EyeOff, ShieldCheck, MapPin, Bell, Globe, LogOut, Check } from 'lucide-react';

export default function SettingsTab({ user, onSignOut, onResetReports, isLaptopDimensions }) {
  // Notification States
  const [nearbySightings, setNearbySightings] = useState(true);
  const [newUnidentified, setNewUnidentified] = useState(true);
  const [highActivity, setHighActivity] = useState(false);

  // Map States
  const [showMyLocation, setShowMyLocation] = useState(true);
  const [autoCenter, setAutoCenter] = useState(true);

  // Privacy States
  const [anonymousMode, setAnonymousMode] = useState(true);

  // Clear confirmation
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [reportsCleared, setReportsCleared] = useState(false);

  const handleClearReports = () => {
    onResetReports();
    setReportsCleared(true);
    setShowClearConfirm(false);
    setTimeout(() => {
      setReportsCleared(false);
    }, 3000);
  };

  // Section Snippets
  const privacySection = (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <EyeOff className="w-4 h-4 text-aura-purple" />
        <h4 className="text-xs font-bold text-aura-text uppercase tracking-wider">Privacy Protocols</h4>
      </div>
      <div className="bg-aura-card border border-aura-border rounded-xl divide-y divide-aura-border/60 overflow-hidden transition-colors duration-300">
        <div className="flex justify-between items-center p-3.5">
          <div>
            <p className="text-xs font-semibold text-aura-text">Anonymous Routing Mode</p>
            <p className="text-[10px] text-aura-muted">Mask device parameters and location headers</p>
          </div>
          <button
            id="toggle-privacy-anonymous"
            onClick={() => setAnonymousMode(!anonymousMode)}
            className={`w-9 h-5 rounded-full transition-all relative cursor-pointer ${
              anonymousMode ? 'bg-aura-purple' : 'bg-aura-input border border-aura-border'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[2px] transition-all ${
              anonymousMode ? 'left-[18px]' : 'left-[3px]'
            }`}></div>
          </button>
        </div>
        
        <div className="p-3.5 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-aura-text">Local Cache Clear</p>
              <p className="text-[10px] text-aura-muted">Erase local report drafts and resets map</p>
            </div>
            {reportsCleared ? (
              <span className="text-[10px] text-aura-green font-semibold flex items-center gap-1 font-mono">
                <Check className="w-3.5 h-3.5" /> Cleared
              </span>
            ) : !showClearConfirm ? (
              <button
                id="settings-clear-reports"
                onClick={() => setShowClearConfirm(true)}
                className="text-[10px] px-2.5 py-1.5 rounded bg-aura-orange/15 border border-aura-orange/30 hover:border-aura-orange text-aura-orange font-semibold transition-all cursor-pointer"
              >
                Clear My Reports
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  id="settings-clear-reports-confirm"
                  onClick={handleClearReports}
                  className="text-[10px] px-2 py-1 rounded bg-aura-orange text-white font-semibold cursor-pointer"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="text-[10px] px-2 py-1 rounded bg-aura-input border border-aura-border text-aura-muted hover:text-aura-text cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const notificationsSection = (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <Bell className="w-4 h-4 text-aura-blue" />
        <h4 className="text-xs font-bold text-aura-text uppercase tracking-wider">Alerts & Notifications</h4>
      </div>
      <div className="bg-aura-card border border-aura-border rounded-xl divide-y divide-aura-border/60 overflow-hidden transition-colors duration-300">
        <div className="flex justify-between items-center p-3.5">
          <div>
            <p className="text-xs font-semibold text-aura-text">Nearby Sightings</p>
            <p className="text-[10px] text-aura-muted">Notify when sighting occurs within 10km</p>
          </div>
          <button
            onClick={() => setNearbySightings(!nearbySightings)}
            className={`w-9 h-5 rounded-full transition-all relative cursor-pointer ${
              nearbySightings ? 'bg-aura-blue' : 'bg-aura-input border border-aura-border'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[2px] transition-all ${
              nearbySightings ? 'left-[18px]' : 'left-[3px]'
            }`}></div>
          </button>
        </div>

        <div className="flex justify-between items-center p-3.5">
          <div>
            <p className="text-xs font-semibold text-aura-text">New Unidentified Reports</p>
            <p className="text-[10px] text-aura-muted">Alert on globally verified unclassified sightings</p>
          </div>
          <button
            onClick={() => setNewUnidentified(!newUnidentified)}
            className={`w-9 h-5 rounded-full transition-all relative cursor-pointer ${
              newUnidentified ? 'bg-aura-blue' : 'bg-aura-input border border-aura-border'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[2px] transition-all ${
              newUnidentified ? 'left-[18px]' : 'left-[3px]'
            }`}></div>
          </button>
        </div>

        <div className="flex justify-between items-center p-3.5">
          <div>
            <p className="text-xs font-semibold text-aura-text">High Activity Alerts</p>
            <p className="text-[10px] text-aura-muted">Alert when clusters exceed 5 reports in 2 hours</p>
          </div>
          <button
            onClick={() => setHighActivity(!highActivity)}
            className={`w-9 h-5 rounded-full transition-all relative cursor-pointer ${
              highActivity ? 'bg-aura-blue' : 'bg-aura-input border border-aura-border'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[2px] transition-all ${
              highActivity ? 'left-[18px]' : 'left-[3px]'
            }`}></div>
          </button>
        </div>
      </div>
    </div>
  );

  const mapSection = (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <MapPin className="w-4 h-4 text-aura-cyan" />
        <h4 className="text-xs font-bold text-aura-text uppercase tracking-wider">Map Configuration</h4>
      </div>
      <div className="bg-aura-card border border-aura-border rounded-xl divide-y divide-aura-border/60 overflow-hidden transition-colors duration-300">
        <div className="flex justify-between items-center p-3.5">
          <div>
            <p className="text-xs font-semibold text-aura-text">Show My Location on Map</p>
            <p className="text-[10px] text-aura-muted">Draw indicator dot on maps page</p>
          </div>
          <button
            onClick={() => setShowMyLocation(!showMyLocation)}
            className={`w-9 h-5 rounded-full transition-all relative cursor-pointer ${
              showMyLocation ? 'bg-aura-blue' : 'bg-aura-input border border-aura-border'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[2px] transition-all ${
              showMyLocation ? 'left-[18px]' : 'left-[3px]'
            }`}></div>
          </button>
        </div>

        <div className="flex justify-between items-center p-3.5">
          <div>
            <p className="text-xs font-semibold text-aura-text">Auto-Center on Open</p>
            <p className="text-[10px] text-aura-muted">Pan map to latest sighting cluster immediately</p>
          </div>
          <button
            onClick={() => setAutoCenter(!autoCenter)}
            className={`w-9 h-5 rounded-full transition-all relative cursor-pointer ${
              autoCenter ? 'bg-aura-blue' : 'bg-aura-input border border-aura-border'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[2px] transition-all ${
              autoCenter ? 'left-[18px]' : 'left-[3px]'
            }`}></div>
          </button>
        </div>
      </div>
    </div>
  );

  const aboutSection = (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <Globe className="w-4 h-4 text-aura-green" />
        <h4 className="text-xs font-bold text-aura-text uppercase tracking-wider">About Archive</h4>
      </div>
      <div className="bg-aura-card border border-aura-border rounded-xl p-4 space-y-3 text-xs leading-relaxed transition-colors duration-300">
        <div className="flex justify-between font-mono text-[10px] text-aura-muted border-b border-aura-border/30 pb-2">
          <span>App Version:</span>
          <span className="text-aura-text">AURA v1.0.0</span>
        </div>
        
        <p className="text-aura-muted">
          Data streams in real-time, filtered and indexed anonymously from global communities, NUFORC reports, and independent local airspace radar trackers.
        </p>

        <div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-aura-blue hover:underline font-semibold block"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );

  const userBannerContent = (
    <div className="p-5 bg-aura-card border border-aura-border rounded-xl flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-aura-input border border-aura-border flex items-center justify-center text-aura-purple">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-aura-text text-sm">
            {user ? user.username : 'Anonymous Observer'}
          </h3>
          <p className="text-xs text-aura-muted font-mono">
            {user && !user.isAnonymous ? user.email : 'not-signed-in@aura.archive'}
          </p>
        </div>
        {anonymousMode && (
          <span className="px-2 py-0.5 rounded bg-aura-purple/15 text-aura-purple border border-aura-purple/20 text-[9px] font-mono uppercase font-bold">
            Masked
          </span>
        )}
      </div>

      {isLaptopDimensions && (
        <button
          id="settings-signout"
          onClick={onSignOut}
          className="py-2.5 px-4 rounded-lg border border-aura-border hover:border-aura-orange/40 hover:bg-aura-orange/5 text-aura-muted hover:text-aura-orange font-semibold flex items-center gap-2 transition-all cursor-pointer text-xs"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      )}
    </div>
  );

  if (isLaptopDimensions) {
    return (
      <div className="flex-1 flex flex-col p-6 bg-aura-deep text-aura-text overflow-y-auto custom-scrollbar select-none pb-12 transition-colors duration-300">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-aura-text">Settings Dashboard</h2>
          <p className="text-xs text-aura-muted">Configure connection preferences, privacy protocols, and UI parameters.</p>
        </div>

        {/* User Card */}
        <div className="mb-8">
          {userBannerContent}
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            {privacySection}
            {mapSection}
          </div>
          <div className="space-y-6">
            {notificationsSection}
            {aboutSection}
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="flex-1 flex flex-col p-4 bg-aura-deep text-aura-text overflow-y-auto custom-scrollbar select-none pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-aura-text">Settings</h2>
        <p className="text-xs text-aura-muted">Configure connection preferences and privacy protocols.</p>
      </div>

      {/* User Section */}
      <div className="mb-6">
        {userBannerContent}
      </div>

      {/* Settings Grid Sections */}
      <div className="space-y-6">
        {privacySection}
        {notificationsSection}
        {mapSection}
        {aboutSection}
      </div>

      {/* Sign Out Button */}
      <button
        id="settings-signout"
        onClick={onSignOut}
        className="w-full mt-10 py-3 rounded-lg border border-aura-border hover:border-aura-orange/40 hover:bg-aura-orange/5 text-aura-muted hover:text-aura-orange font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
      >
        <LogOut className="w-4 h-4" /> Sign Out from Interface
      </button>
    </div>
  );
}
