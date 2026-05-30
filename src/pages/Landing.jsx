import React from 'react';
import { motion } from 'framer-motion';

export const AuraLogo = ({ className = "w-20 h-20" }) => (
  <svg className={`${className}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="var(--color-aura-blue)" stopOpacity="0.7" />
        <stop offset="50%" stopColor="var(--color-aura-purple)" stopOpacity="0.3" />
        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
      </radialGradient>
      <filter id="blur-halo" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Glowing background halo */}
    <circle cx="50%" cy="50%" r="45" fill="url(#glow)" className="animate-pulse" />
    {/* Outer dashed spinning orbit */}
    <circle cx="50%" cy="50%" r="35" stroke="var(--color-aura-blue)" strokeWidth="2.5" strokeDasharray="10 8" className="origin-center animate-[spin_20s_linear_infinite]" opacity="0.8" />
    {/* Inner thin purple halo */}
    <circle cx="50%" cy="50%" r="24" stroke="var(--color-aura-purple)" strokeWidth="1.5" strokeDasharray="4 4" className="origin-center animate-[spin_10s_linear_infinite_reverse]" opacity="0.7" />
    {/* Core glowing dot */}
    <circle cx="50%" cy="50%" r="6" fill="var(--color-aura-text)" filter="url(#blur-halo)" />
  </svg>
);

export default function Landing({ onNavigate, isLaptopDimensions }) {
  // Stagger animation settings
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 min-h-screen bg-aura-deep text-aura-text transition-colors duration-300 overflow-y-auto custom-scrollbar">
      
      {/* Dynamic Main Body Content */}
      <div className={`my-auto flex flex-col lg:max-w-5xl lg:mx-auto lg:w-full py-8`}>
        
        {/* Hero & Features Grid */}
        <div className={`flex flex-col ${isLaptopDimensions ? 'lg:flex-row lg:items-center lg:justify-between lg:gap-16 mb-12' : 'items-center text-center mb-10'}`}>
          {/* Left/Hero Side */}
          <div className={`flex flex-col ${isLaptopDimensions ? 'lg:items-start lg:text-left lg:w-1/2' : 'items-center text-center'}`}>
            {/* Animated Glowing Logo */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="relative mb-6 group cursor-pointer"
            >
              <div className="absolute inset-0 bg-aura-blue opacity-15 blur-xl rounded-full scale-75 group-hover:scale-100 transition-all duration-700"></div>
              <AuraLogo className={`${isLaptopDimensions ? 'w-40 h-40' : 'w-32 h-32'} relative z-10`} />
            </motion.div>

            {/* Title & Tagline */}
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl lg:text-5xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-aura-text via-aura-blue to-aura-purple mb-2"
            >
              AURA
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-aura-blue uppercase tracking-[0.25em] text-[10px] sm:text-xs font-bold font-mono mb-3"
            >
              Anonymous Unidentifiable Report Archive
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.38 }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="px-2.5 py-1 rounded-full bg-aura-orange/15 border border-aura-orange/40 text-aura-orange text-[10px] font-mono font-bold tracking-widest uppercase">
                MVP
              </span>
              <span className="text-[10px] text-aura-muted font-mono">
                Early prototype · Features are simulated · Not production-ready
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl lg:text-3xl font-bold text-aura-text mb-3 max-w-sm"
            >
              You saw it. AURA remembers it.
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-aura-muted text-sm max-w-md mb-8 leading-relaxed"
            >
              Anonymously report, track, and explore unidentified objects reported by people around the world.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="flex flex-col sm:flex-row gap-4 w-full max-w-xs justify-center lg:justify-start mb-8"
            >
              <button 
                id="cta-get-started"
                onClick={() => onNavigate('signup')}
                className="w-full py-3 px-6 rounded-lg bg-aura-blue hover:bg-opacity-90 text-white font-semibold transition-all duration-200 shadow-lg shadow-aura-blue/20 active:scale-95 cursor-pointer text-center"
              >
                Get Started
              </button>
              <button 
                id="cta-sign-in"
                onClick={() => onNavigate('signin')}
                className="w-full py-3 px-6 rounded-lg border border-aura-border hover:border-aura-blue hover:bg-aura-input/30 text-aura-text font-semibold transition-all duration-200 active:scale-95 cursor-pointer text-center"
              >
                Sign In
              </button>
            </motion.div>
          </div>

          {/* Account type comparison */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72 }}
            className={`w-full max-w-xs ${isLaptopDimensions ? '' : 'mx-auto'} rounded-xl border border-aura-border/60 overflow-hidden text-[11px] font-mono mb-8`}
          >
            {/* Header */}
            <div className="grid grid-cols-2 text-center">
              <div className="px-3 py-2 bg-aura-card/40 border-b border-r border-aura-border/60 text-aura-muted tracking-widest uppercase text-[9px]">
                Anonymous
              </div>
              <div className="px-3 py-2 bg-aura-blue/10 border-b border-aura-border/60 text-aura-blue tracking-widest uppercase text-[9px] font-bold">
                Real Account
              </div>
            </div>

            {[
              ['View archive',       true,  true ],
              ['Submit sightings',   true,  true ],
              ['Reports persist',    false, true ],
              ['Shared with others', false, true ],
              ['Session restored',   false, true ],
              ['Database backed',    false, true ],
            ].map(([label, anon, real]) => (
              <div key={label} className="grid grid-cols-2 border-b border-aura-border/30 last:border-0">
                <div className="flex items-center gap-2 px-3 py-2 bg-aura-card/20 border-r border-aura-border/30">
                  <span className={anon ? 'text-aura-green' : 'text-aura-muted/40'}>
                    {anon ? '✓' : '✗'}
                  </span>
                  <span className="text-aura-muted">{label}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-aura-blue/5">
                  <span className={real ? 'text-aura-green' : 'text-aura-muted/40'}>
                    {real ? '✓' : '✗'}
                  </span>
                  <span className={real ? 'text-aura-text' : 'text-aura-muted'}>{label}</span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Right/Feature Cards Side */}
          <div className={`w-full ${isLaptopDimensions ? 'lg:w-1/2 lg:flex lg:flex-col lg:gap-4' : 'max-w-md mx-auto'}`}>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-4 w-full"
            >
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -3 }}
                className="p-4 rounded-xl bg-aura-card border border-aura-border hover:border-aura-blue/50 transition-all duration-300 shadow-md group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl p-2 rounded-lg bg-aura-input text-aura-cyan border border-aura-border/60 group-hover:scale-110 transition-transform">📡</span>
                  <div>
                    <h3 className="font-bold text-aura-text text-sm mb-1">Computer Vision Lock</h3>
                    <p className="text-aura-muted text-xs leading-relaxed">
                      Instant color/luminance-based target acquisition. Detects biological (`LIVING`) and structural (`NON-LIVING`) objects locally.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -3 }}
                className="p-4 rounded-xl bg-aura-card border border-aura-border hover:border-aura-purple/50 transition-all duration-300 shadow-md group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl p-2 rounded-lg bg-aura-input text-aura-purple border border-aura-border/60 group-hover:scale-110 transition-transform">🗺️</span>
                  <div>
                    <h3 className="font-bold text-aura-text text-sm mb-1">Live Radar Map</h3>
                    <p className="text-aura-muted text-xs leading-relaxed">
                      Interactive Google Map featuring crowdsourced sightings alongside official historical datasets (Kaggle/DoD AARO).
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -3 }}
                className="p-4 rounded-xl bg-aura-card border border-aura-border hover:border-aura-green/50 transition-all duration-300 shadow-md group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl p-2 rounded-lg bg-aura-input text-aura-green border border-aura-border/60 group-hover:scale-110 transition-transform">🔒</span>
                  <div>
                    <h3 className="font-bold text-aura-text text-sm mb-1">Encrypted Archives</h3>
                    <p className="text-aura-muted text-xs leading-relaxed">
                      100% anonymous log submission. We keep no personal identity metrics. Your findings, your privacy.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* How to Use Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full border-t border-aura-border/30 pt-10 pb-4 text-left"
        >
          <h2 className="text-xl font-bold tracking-wider text-aura-text mb-1 font-mono uppercase text-center md:text-left">
            How to use AURA
          </h2>
          <p className="text-aura-muted text-xs mb-8 text-center md:text-left">
            A guide to scanning targets, archiving telemetry, and mapping destinations
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-aura-card/30 border border-aura-border/40 hover:border-aura-blue/30 transition-all flex flex-col">
              <div className="w-8 h-8 rounded-lg bg-aura-blue/15 border border-aura-blue/30 flex items-center justify-center text-aura-blue font-bold font-mono text-sm mb-4">
                1
              </div>
              <h3 className="font-bold text-aura-text text-sm mb-1.5 font-mono">Point & Scan</h3>
              <p className="text-aura-muted text-xs leading-relaxed">
                Open the **Scan** tab, grant camera access, and point at any object. The local computer vision system will immediately frame the target and classify its biological status.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-aura-card/30 border border-aura-border/40 hover:border-aura-purple/30 transition-all flex flex-col">
              <div className="w-8 h-8 rounded-lg bg-aura-purple/15 border border-aura-purple/30 flex items-center justify-center text-aura-purple font-bold font-mono text-sm mb-4">
                2
              </div>
              <h3 className="font-bold text-aura-text text-sm mb-1.5 font-mono">Zoom & Transmit</h3>
              <p className="text-aura-muted text-xs leading-relaxed">
                Press the scan trigger. AURA will freeze the frame and zoom in **4.0X** on the object's boundaries. Click **TRANSMIT SIGHTING** to post the telemetry data to the main archive.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-aura-card/30 border border-aura-border/40 hover:border-aura-green/30 transition-all flex flex-col">
              <div className="w-8 h-8 rounded-lg bg-aura-green/15 border border-aura-green/30 flex items-center justify-center text-aura-green font-bold font-mono text-sm mb-4">
                3
              </div>
              <h3 className="font-bold text-aura-text text-sm mb-1.5 font-mono">Radar Navigation</h3>
              <p className="text-aura-muted text-xs leading-relaxed">
                Open the **Map** tab to view logged markers. Click any pin, check telemetry, and tap **NAVIGATE IN GOOGLE MAPS** to start live route directions starting from your device GPS coordinates.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tech Stack & Data Sources */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full border-t border-aura-border/30 pt-10 pb-6"
        >
          <div className={`grid gap-8 ${isLaptopDimensions ? 'grid-cols-2' : 'grid-cols-1'}`}>

            {/* Tech Stack */}
            <div>
              <h2 className="text-sm font-bold tracking-widest text-aura-text font-mono uppercase mb-1">
                Tech Stack
              </h2>
              <p className="text-[10px] text-aura-muted mb-5 font-mono">Libraries and tools powering this MVP</p>
              <div className="space-y-2">
                {[
                  { label: 'React 19 + Vite 8',        desc: 'UI framework & build tool',                   color: 'text-aura-cyan',   dot: 'bg-aura-cyan'   },
                  { label: 'Tailwind CSS 3',            desc: 'Utility-first styling',                       color: 'text-aura-blue',   dot: 'bg-aura-blue'   },
                  { label: 'Framer Motion',             desc: 'Animations & transitions',                    color: 'text-aura-purple', dot: 'bg-aura-purple' },
                  { label: 'Leaflet + react-leaflet',   desc: 'Interactive map rendering',                   color: 'text-aura-green',  dot: 'bg-aura-green'  },
                  { label: 'CartoDB / OpenStreetMap',   desc: 'Free map tile provider',                      color: 'text-aura-green',  dot: 'bg-aura-green'  },
                  { label: 'OpenCV.js (CDN)',           desc: 'Client-side contour detection',               color: 'text-aura-orange', dot: 'bg-aura-orange' },
                  { label: 'vite-plugin-pwa / Workbox', desc: 'Service worker + offline caching',            color: 'text-aura-blue',   dot: 'bg-aura-blue'   },
                  { label: 'Render (Static Site)',      desc: 'Hosting & deployment platform',               color: 'text-aura-muted',  dot: 'bg-aura-muted'  },
                ].map(({ label, desc, color, dot }) => (
                  <div key={label} className="flex items-center gap-3 p-2.5 rounded-lg bg-aura-card/20 border border-aura-border/30 hover:border-aura-border transition-all">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`}></span>
                    <span className={`text-[11px] font-mono font-semibold ${color} flex-shrink-0 w-44`}>{label}</span>
                    <span className="text-[10px] text-aura-muted">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Sources */}
            <div>
              <h2 className="text-sm font-bold tracking-widest text-aura-text font-mono uppercase mb-1">
                Data Sources
              </h2>
              <p className="text-[10px] text-aura-muted mb-5 font-mono">Public datasets used for UAP classification</p>
              <div className="space-y-2">
                {[
                  { label: 'NUFORC',              desc: 'National UFO Reporting Center — 80,000+ filed reports',                      href: 'https://nuforc.org'           },
                  { label: 'Kaggle UFO Dataset',  desc: 'Sigmond Axel\'s cleaned NUFORC export with geocoordinates',                   href: 'https://kaggle.com'           },
                  { label: 'MUFON',               desc: 'Mutual UFO Network — shape & behaviour field taxonomy',                       href: 'https://mufon.com'            },
                  { label: 'DoD AARO 2023',       desc: 'All-domain Anomaly Resolution Office annual report — 5-domain classification', href: 'https://aaro.mil'             },
                  { label: 'Hessdalen Project',   desc: 'Norwegian scientific study of persistent light anomalies since 1984',          href: 'http://www.hessdalen.org'     },
                  { label: 'NICAP',               desc: 'National Investigations Committee on Aerial Phenomena historical records',     href: 'http://www.nicap.org'         },
                  { label: 'NASA GISS',           desc: 'Nighttime light pollution map used for luminosity reference calibration',      href: 'https://earthobservatory.nasa.gov' },
                  { label: 'FAA Aircraft Registry', desc: 'Cross-referenced to eliminate known commercial aircraft from UAP pool',     href: 'https://faa.gov'              },
                ].map(({ label, desc, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-aura-card/20 border border-aura-border/30 hover:border-aura-purple/40 hover:bg-aura-purple/5 transition-all group block"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-aura-purple flex-shrink-0 mt-1"></span>
                    <div className="min-w-0">
                      <span className="text-[11px] font-mono font-semibold text-aura-purple group-hover:text-aura-purple block">{label} ↗</span>
                      <span className="text-[10px] text-aura-muted leading-relaxed">{desc}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </motion.div>

      </div>

      {/* Footer */}
      <footer className="text-center text-aura-muted text-[10px] py-6 border-t border-aura-border/40 font-mono space-y-1.5">
        <p>© {new Date().getFullYear()} AURA · Anonymous Unidentifiable Report Archive. All rights reserved.</p>
        <p className="text-aura-orange/70">
          ⚠ MVP — This is an early-stage prototype. Auth, data, and scanner results are simulated. No real data is collected or stored server-side.
        </p>
      </footer>
    </div>
  );
}
