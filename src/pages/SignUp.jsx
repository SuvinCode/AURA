import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AuraLogo } from './Landing';

export default function SignUp({ onNavigate, onSignIn, isLaptopDimensions }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    // Simulate successful sign up
    onSignIn({ 
      email, 
      username: username.trim() || 'Anonymous User', 
      isAnonymous: !username.trim() 
    });
  };

  const handleAnonymous = () => {
    onSignIn({ email: 'anonymous@aura.archive', username: 'Anonymous User', isAnonymous: true });
  };

  const formCard = (
    <motion.div 
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 150 }}
      className="w-full max-w-sm mx-auto p-6 rounded-2xl bg-aura-card border border-aura-border shadow-xl relative overflow-hidden"
    >
      {/* Glow decoration */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-aura-purple/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-aura-blue/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Logo */}
      <div className="flex flex-col items-center mb-6 text-center">
        <AuraLogo className="w-16 h-16 mb-2 cursor-pointer" onClick={() => onNavigate('landing')} />
        <h2 className="text-xl font-bold text-aura-text">Create AURA Account</h2>
        <p className="text-xs text-aura-muted">Secure your reports</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-aura-orange/15 border border-aura-orange/40 text-aura-orange text-xs font-mono">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-aura-muted uppercase tracking-wider" htmlFor="username">
              Username <span className="text-[9px] text-aura-muted/70 lowercase font-normal">(optional)</span>
            </label>
          </div>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg bg-aura-input border border-aura-border text-aura-text placeholder-aura-muted/50 focus:outline-none focus:border-aura-blue transition-all text-sm"
            placeholder="e.g. ObserverX"
          />
          <p className="text-[10px] text-aura-muted mt-1 italic">
            Leave blank to stay fully anonymous
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-aura-muted uppercase tracking-wider mb-1.5" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg bg-aura-input border border-aura-border text-aura-text placeholder-aura-muted/50 focus:outline-none focus:border-aura-blue transition-all text-sm"
            placeholder="e.g. observer@aura.archive"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-aura-muted uppercase tracking-wider mb-1.5" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg bg-aura-input border border-aura-border text-aura-text placeholder-aura-muted/50 focus:outline-none focus:border-aura-blue transition-all text-sm"
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-aura-muted uppercase tracking-wider mb-1.5" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg bg-aura-input border border-aura-border text-aura-text placeholder-aura-muted/50 focus:outline-none focus:border-aura-blue transition-all text-sm"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          id="signup-submit"
          type="submit"
          className="w-full py-2.5 px-4 rounded-lg bg-aura-blue hover:bg-opacity-90 text-white font-semibold transition-all duration-200 shadow-md shadow-aura-blue/25 active:scale-[0.98] cursor-pointer mt-2"
        >
          Create Account
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-4">
        <div className="flex-1 border-t border-aura-border"></div>
        <span className="px-3 text-[10px] uppercase font-bold tracking-widest text-aura-muted">Or</span>
        <div className="flex-1 border-t border-aura-border"></div>
      </div>

      {/* Anonymous action */}
      <button
        id="signup-anonymous"
        onClick={handleAnonymous}
        className="w-full py-2.5 px-4 rounded-lg border border-dashed border-aura-border hover:border-aura-purple/60 text-aura-purple hover:bg-aura-purple/5 font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer"
      >
        Continue Anonymously
      </button>

      {/* Toggle link */}
      <div className="text-center mt-5">
        <button
          id="link-signin"
          onClick={() => onNavigate('signin')}
          className="text-xs text-aura-muted hover:text-aura-text transition-colors"
        >
          Already have an account? <span className="text-aura-blue font-semibold">Sign In</span>
        </button>
      </div>

      <div className="text-center mt-3">
        <button
          id="link-back-landing"
          onClick={() => onNavigate('landing')}
          className="text-xs text-aura-blue hover:text-opacity-80 font-semibold transition-colors cursor-pointer"
        >
          ← Back to Landing Page
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="flex-1 flex flex-col justify-center min-h-screen bg-aura-deep text-aura-text transition-colors duration-300">
      {isLaptopDimensions ? (
        <div className="flex-1 flex flex-row">
          {/* Left panel: Cosmetic Galactic Radar */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#040814] via-[#09152b] to-[#040814] border-r border-aura-border relative overflow-hidden select-none">
            {/* Spinning Radar concentric rings and glow */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none map-grid-bg"></div>
            <div className="absolute w-[400px] h-[400px] rounded-full border border-[#b06aff]/20 animate-pulse flex items-center justify-center">
              <div className="w-[280px] h-[280px] rounded-full border border-aura-blue/10 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-aura-purple/15 filter blur-md"></div>
              </div>
            </div>
            {/* Logo */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <AuraLogo className="w-36 h-36 mb-6 cursor-pointer" onClick={() => onNavigate('landing')} />
              <h2 className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-aura-text via-aura-purple to-aura-blue mb-3">AURA ARCHIVE</h2>
              <p className="text-xs text-aura-purple tracking-[0.25em] uppercase font-mono mb-2">INITIALIZE SECURE LINK</p>
              <p className="text-xs text-aura-muted max-w-xs leading-relaxed">
                Connect your interface to Nuforc & radar archives anonymously.
              </p>
            </div>
          </div>
          {/* Right panel: Sign Up Card */}
          <div className="w-1/2 flex items-center justify-center p-8 overflow-y-auto">
            {formCard}
          </div>
        </div>
      ) : (
        <div className="p-6">
          {formCard}
        </div>
      )}
      
      {/* Tagline */}
      <p className="text-center text-xs text-aura-muted py-4 italic font-mono">
        "Your identity stays yours."
      </p>
    </div>
  );
}
