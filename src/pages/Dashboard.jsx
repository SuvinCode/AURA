import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Map, PlusSquare, Settings, Sun, Moon, LogOut } from 'lucide-react';
import ScanTab from '../components/ScanTab';
import MapTab from '../components/MapTab';
import ReportTab from '../components/ReportTab';
import SettingsTab from '../components/SettingsTab';

const NAV_ITEMS = [
  { id: 'scan',     label: 'Scan & Identify',    shortLabel: 'Scan',     Icon: Camera },
  { id: 'map',      label: 'Live Radar Map',      shortLabel: 'Map',      Icon: Map },
  { id: 'report',   label: 'Transmit Sighting',   shortLabel: 'Report',   Icon: PlusSquare },
  { id: 'settings', label: 'Interface Settings',  shortLabel: 'Settings', Icon: Settings },
];

const sidebarVariants = {
  hidden: { x: -280, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 28, stiffness: 220 },
  },
};

const navListVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -14 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 20, stiffness: 260 } },
};

const headerVariants = {
  hidden: { y: -60, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 24, stiffness: 240 } },
};

const bottomNavVariants = {
  hidden: { y: 80, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 24, stiffness: 220, delayChildren: 0.1, staggerChildren: 0.05 },
  },
};

const bottomNavItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 280 } },
};

const telemetryVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
};

const telemetryRowVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

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
  isLaptopDimensions,
}) {
  const [activeTab, setActiveTab] = useState('scan');

  useEffect(() => {
    if (draftReport) setActiveTab('report');
  }, [draftReport]);

  const handleReportSubmit = (newReport) => {
    onSubmitReport(newReport);
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

  // ── Laptop layout ──────────────────────────────────────────────────────────
  if (isLaptopDimensions) {
    return (
      <div className="flex-1 flex flex-row h-screen max-h-screen overflow-hidden bg-aura-deep text-aura-text transition-colors duration-300">

        {/* Sidebar */}
        <motion.aside
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
          className="w-64 bg-aura-card/30 border-r border-aura-border flex flex-col justify-between p-5 select-none transition-colors duration-300"
        >
          <div className="flex flex-col gap-6">

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', damping: 18, stiffness: 200 }}
              className="flex items-center gap-2.5"
            >
              <svg className="w-6 h-6 animate-pulse" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="40" stroke="var(--color-aura-blue)" strokeWidth="6" strokeDasharray="15 10" />
                <circle cx="50" cy="50" r="20" fill="var(--color-aura-purple)" opacity="0.8" />
              </svg>
              <div>
                <span className="font-extrabold tracking-widest text-xs text-aura-text">AURA SYSTEM</span>
                <p className="text-[8px] text-aura-muted font-mono leading-none mt-0.5">ARCHIVE INTERFACE</p>
              </div>
            </motion.div>

            {/* Nav items */}
            <motion.nav
              variants={navListVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-1.5"
            >
              {NAV_ITEMS.map(({ id, label, Icon }) => (
                <motion.button
                  key={id}
                  id={`sidebar-tab-${id}`}
                  variants={navItemVariants}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab(id)}
                  className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer border transition-colors ${
                    activeTab === id
                      ? 'text-aura-blue border-transparent'
                      : 'text-aura-muted hover:text-aura-text border-transparent'
                  }`}
                >
                  {activeTab === id && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 bg-aura-input border border-aura-border rounded-xl"
                      transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-3.5">
                    <Icon className="w-4 h-4" />
                    {label}
                  </span>
                </motion.button>
              ))}

              {/* Logout */}
              <motion.button
                id="sidebar-tab-logout"
                variants={navItemVariants}
                whileTap={{ scale: 0.97 }}
                onClick={onSignOut}
                className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent text-red-500 hover:text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </motion.button>
            </motion.nav>
          </div>

          {/* Sidebar footer telemetry */}
          <motion.div
            variants={telemetryVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3 pt-4 border-t border-aura-border/30"
          >
            <motion.div variants={telemetryRowVariants} className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-aura-muted tracking-wider">PROTOCOL:</span>
              <motion.button
                id="sidebar-toggle-theme"
                whileTap={{ scale: 0.88, rotate: 20 }}
                onClick={onToggleTheme}
                className="p-1.5 rounded-lg bg-aura-input border border-aura-border hover:border-aura-blue text-aura-text hover:text-aura-blue transition-all cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={theme}
                    initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 30, scale: 0.6 }}
                    transition={{ duration: 0.18 }}
                    className="flex"
                  >
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </motion.div>

            <motion.div variants={telemetryRowVariants} className="flex items-center justify-between font-mono text-[9px] text-aura-muted">
              <span>SECURE LEVEL:</span>
              <span className="text-aura-green font-bold">ALPHA_SEC</span>
            </motion.div>

            <motion.div variants={telemetryRowVariants} className="flex items-center justify-between font-mono text-[9px] text-aura-muted">
              <span>USER PROFILE:</span>
              <span className="text-aura-purple font-semibold max-w-[120px] truncate">
                {user ? user.username : 'Observer'}
              </span>
            </motion.div>
          </motion.div>
        </motion.aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-aura-deep transition-colors duration-300">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {renderActiveTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  // ── Mobile layout ──────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col h-screen max-h-screen overflow-hidden bg-aura-deep text-aura-text transition-colors duration-300">

      {/* Header */}
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 py-3 bg-aura-deep border-b border-aura-border flex justify-between items-center select-none transition-colors duration-300"
      >
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.18, type: 'spring', damping: 20 }}
          className="flex items-center gap-2"
        >
          <svg className="w-6 h-6 animate-pulse" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="40" stroke="var(--color-aura-blue)" strokeWidth="6" strokeDasharray="15 10" />
            <circle cx="50" cy="50" r="20" fill="var(--color-aura-purple)" opacity="0.8" />
          </svg>
          <span className="font-bold tracking-wider text-sm text-aura-text">AURA ARCHIVE</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.22, type: 'spring', damping: 20 }}
          className="flex items-center gap-2"
        >
          <motion.button
            id="toggle-theme"
            whileTap={{ scale: 0.85, rotate: 20 }}
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg bg-aura-input border border-aura-border hover:border-aura-blue text-aura-text hover:text-aura-blue transition-all cursor-pointer"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={theme}
                initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.6 }}
                transition={{ duration: 0.18 }}
                className="flex"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <motion.button
            id="mobile-logout"
            whileTap={{ scale: 0.85 }}
            onClick={onSignOut}
            className="p-1.5 rounded-lg bg-aura-input border border-aura-border hover:border-red-500/50 text-red-500 hover:text-red-400 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[10px] px-2 py-1 rounded bg-aura-input border border-aura-border font-mono text-aura-muted"
          >
            SECURE_CONN_1.0
          </motion.span>
        </motion.div>
      </motion.header>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-aura-deep transition-colors duration-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="flex-1 flex flex-col overflow-hidden relative"
          >
            {renderActiveTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <motion.nav
        variants={bottomNavVariants}
        initial="hidden"
        animate="visible"
        className="h-16 bg-aura-deep border-t border-aura-border flex items-stretch z-40 select-none transition-colors duration-300"
      >
        {NAV_ITEMS.map(({ id, shortLabel, Icon }) => {
          const isActive = activeTab === id;
          return (
            <motion.button
              key={id}
              id={`tab-${id}`}
              variants={bottomNavItemVariants}
              whileTap={{ scale: 0.82 }}
              onClick={() => setActiveTab(id)}
              className="relative flex flex-col items-center justify-center flex-1 cursor-pointer gap-0.5"
            >
              {/* Sliding indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="mobile-tab-indicator"
                  className="absolute top-0 left-3 right-3 h-[2px] rounded-full bg-aura-blue"
                  transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                />
              )}

              <motion.div
                animate={isActive ? { scale: 1.15, y: -1 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 18, stiffness: 300 }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: isActive ? 'var(--color-aura-blue)' : 'var(--color-aura-muted)' }}
                />
              </motion.div>

              <motion.span
                animate={isActive ? { opacity: 1, color: 'var(--color-aura-blue)' } : { opacity: 0.55, color: 'var(--color-aura-muted)' }}
                transition={{ duration: 0.18 }}
                className="text-[10px] font-semibold"
              >
                {shortLabel}
              </motion.span>
            </motion.button>
          );
        })}
      </motion.nav>
    </div>
  );
}
