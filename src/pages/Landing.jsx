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
      <div className={`my-auto flex flex-col ${isLaptopDimensions ? 'lg:flex-row lg:items-center lg:justify-center lg:gap-16 lg:max-w-5xl lg:mx-auto lg:w-full lg:text-left py-8' : 'items-center text-center'}`}>
        
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
            className="text-aura-blue uppercase tracking-[0.25em] text-[10px] sm:text-xs font-bold font-mono mb-6"
          >
            Anonymous Unidentifiable Report Archive
          </motion.p>
          
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
                  <h3 className="font-bold text-aura-text text-sm mb-1">Scan & Identify</h3>
                  <p className="text-aura-muted text-xs leading-relaxed">
                    Point your camera at any object. AI tells you what it is — or flags it as unidentified.
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
                <span className="text-xl p-2 rounded-lg bg-aura-input text-aura-purple border border-aura-border/60 group-hover:scale-110 transition-transform">🗺</span>
                <div>
                  <h3 className="font-bold text-aura-text text-sm mb-1">Live Map</h3>
                  <p className="text-aura-muted text-xs leading-relaxed">
                    See unidentified reports from people near you in real time.
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
                  <h3 className="font-bold text-aura-text text-sm mb-1">Stay Anonymous</h3>
                  <p className="text-aura-muted text-xs leading-relaxed">
                    No personal data required. Your sighting, your privacy.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

      </div>

      {/* Footer */}
      <footer className="text-center text-aura-muted text-[10px] py-4 border-t border-aura-border/40 font-mono">
        AURA © 2025 · Anonymous Unidentifiable Report Archive
      </footer>
    </div>
  );
}
