import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCw, AlertTriangle, CheckCircle, ChevronUp } from 'lucide-react';

export default function ScanTab({ onAutoReport, theme, isLaptopDimensions }) {
  const [isScanning, setIsScanning] = useState(true);
  const [captured, setCaptured] = useState(false);
  const [demoState, setDemoState] = useState('unidentified'); // 'identified' | 'unidentified'
  const [statusText, setStatusText] = useState('Scanning for objects...');

  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);

  // Initialize camera stream
  useEffect(() => {
    let activeStream = null;

    async function enableCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.warn('Error accessing camera, falling back to CSS simulator:', err);
        setCameraError(err.message || 'Camera access denied');
      }
    }

    if (isScanning && !captured) {
      enableCamera();
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
    };
  }, [isScanning, captured]);

  // Handle binding stream when the videoRef element mounts
  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Simple status bar animation
  useEffect(() => {
    if (!isScanning) return;
    const phrases = [
      'Scanning for objects...',
      'Analyzing thermal signatures...',
      'Filtering atmospheric noise...',
      'Matching celestial models...',
      'Tracking trajectory data...'
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % phrases.length;
      setStatusText(phrases[idx]);
    }, 3000);
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleCapture = () => {
    setIsScanning(false);
    setStatusText('Capture complete. Analyzing...');
    setTimeout(() => {
      setCaptured(true);
    }, 800);
  };

  const handleReset = () => {
    setCaptured(false);
    setIsScanning(true);
    setStatusText('Scanning for objects...');
  };

  const toggleDemoState = () => {
    setDemoState(prev => prev === 'identified' ? 'unidentified' : 'identified');
  };

  // Viewfinder markup snippet
  const viewfinderContent = (
    <div className="relative flex-1 min-h-[220px] rounded-xl bg-black border border-aura-border flex flex-col items-center justify-center overflow-hidden shadow-inner">
      {/* Camera Video Stream */}
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      ) : (
        /* CSS Camera Feed Mock: deep dark background with some noise/atmosphere */
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-0"></div>
          <div className="absolute inset-0 opacity-20 pointer-events-none map-grid-bg z-0"></div>
        </>
      )}

      {/* Viewfinder Target Corner Brackets */}
      {!captured && (
        <div className="absolute w-48 h-48 flex flex-col justify-between p-1 z-20">
          {/* Top Row Brackets */}
          <div className="flex justify-between">
            <div className="w-6 h-6 border-t-2 border-l-2 border-aura-blue rounded-tl-sm animate-pulse"></div>
            <div className="w-6 h-6 border-t-2 border-r-2 border-aura-blue rounded-tr-sm animate-pulse"></div>
          </div>
          {/* Bottom Row Brackets */}
          <div className="flex justify-between">
            <div className="w-6 h-6 border-b-2 border-l-2 border-aura-blue rounded-bl-sm animate-pulse"></div>
            <div className="w-6 h-6 border-b-2 border-r-2 border-aura-blue rounded-tr-sm animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Animated Pulse Ring inside the reticle */}
      {isScanning && (
        <div className="absolute w-36 h-36 rounded-full border border-aura-blue/40 animate-pulse-ring pointer-events-none z-20"></div>
      )}

      {/* Mock visual objects inside viewfinder */}
      <div className="absolute z-10 flex flex-col items-center pointer-events-none">
        {demoState === 'unidentified' ? (
          /* A glowing purple orb */
          <div className={`w-6 h-6 bg-[#B06AFF] rounded-full filter blur-[3px] opacity-75 relative ${isScanning ? 'animate-bounce' : ''}`}>
            <div className="absolute inset-0 bg-[#B06AFF] rounded-full blur-[8px] opacity-80 animate-ping"></div>
          </div>
        ) : (
          /* Commercial Plane outline/silhouette */
          <div className={`text-[#22C97A] text-opacity-40 text-4xl font-light transform -rotate-12 select-none ${isScanning ? 'animate-pulse' : ''}`}>
            ✈
          </div>
        )}
      </div>

      {/* Text indicators */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between z-20">
        <span className="text-[10px] text-white/50 font-mono">LAT: 33.3943° N</span>
        <span className="text-[10px] text-white/50 font-mono">LNG: -104.5230° W</span>
      </div>

      {/* Captured Freeze Overlay - Mobile/Laptop common visual */}
      <AnimatePresence>
        {captured && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-aura-card/85 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className={`p-3 rounded-full mb-3 ${demoState === 'unidentified' ? 'bg-aura-purple/15 text-aura-purple animate-pulse' : 'bg-aura-green/15 text-aura-green animate-pulse'}`}>
              {demoState === 'unidentified' ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
            </div>
            <p className="text-sm font-bold text-aura-text mb-1">IMAGE ANALYSIS COMPLETED</p>
            <p className="text-xs text-aura-muted font-mono mb-4">timestamp: {new Date().toISOString().slice(11,19)} UTC</p>
            <button
              id="scan-reset"
              onClick={handleReset}
              className="px-4 py-2 rounded-lg bg-aura-input border border-aura-border hover:border-aura-blue text-xs font-semibold flex items-center gap-1.5 transition-all text-aura-text cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-scan
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Result card content snippet (used in both split and mobile view)
  const resultsCardContent = (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-aura-text text-lg mb-1">
            {demoState === 'unidentified' ? 'Anomalous Target' : 'Identified Object'}
          </h3>
          <p className="text-xs text-aura-muted">AURA Image AI Classifier v1.2</p>
        </div>
        
        {demoState === 'unidentified' ? (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-aura-purple/15 text-aura-purple border border-aura-purple/30 flex items-center gap-1 font-mono">
            <span>⚠</span> Unidentified
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-aura-green border border-aura-green/30 flex items-center gap-1 font-mono">
            <span>✓</span> Identified
          </span>
        )}
      </div>

      {demoState === 'unidentified' ? (
        <div className="space-y-4">
          <div className="p-3 bg-aura-input rounded-lg border border-aura-border">
            <p className="text-sm text-aura-text mb-1 font-semibold">Unclassified Sighting</p>
            <p className="text-xs text-aura-muted leading-relaxed">
              This object could not be classified. Shape is irregular and light signature is non-standard.
            </p>
          </div>

          <div className="flex justify-between items-center text-xs font-mono text-aura-muted">
            <span>Confidence Rating:</span>
            <span className="text-aura-orange font-bold">12%</span>
          </div>

          <button
            id="scan-submit-report"
            onClick={() => onAutoReport({
              description: "Glowing purple orb captured by AURA Scanner. Object could not be classified by AI. Showed unusual flight signature and hovering behavior.",
              type: "Aerial",
              behaviors: ["Hovering", "Silent", "Lights", "Disappeared"]
            })}
            className="w-full py-2.5 rounded-lg bg-[#B06AFF] hover:bg-[#A052FF] text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#B06AFF]/20 active:scale-[0.98] cursor-pointer"
          >
            Submit Sighting Report
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-aura-input rounded-lg border border-aura-border">
            <p className="text-sm text-aura-text mb-1 font-semibold">Commercial Aircraft</p>
            <p className="text-xs text-aura-green font-mono mb-1">Model: Boeing 737</p>
            <p className="text-xs text-aura-muted leading-relaxed">
              Flight signature matches standard commercial airline profiles passing through Oakland airspace.
            </p>
          </div>

          <div className="flex justify-between items-center text-xs font-mono text-aura-muted">
            <span>Confidence Rating:</span>
            <span className="text-aura-green font-bold">94%</span>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-2.5 rounded-lg border border-aura-border hover:border-aura-blue text-aura-text font-semibold transition-all active:scale-[0.98] cursor-pointer"
          >
            Scan Again
          </button>
        </div>
      )}
    </div>
  );

  if (isLaptopDimensions) {
    return (
      <div className="flex-1 flex flex-col p-6 h-full overflow-hidden bg-aura-deep">
        {/* Top Header Banner */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-aura-text">Celestial Object Scanner</h2>
            <p className="text-xs text-aura-muted">Analyze live environment signals using deep telemetry</p>
          </div>
          <button 
            id="toggle-demo-state"
            onClick={toggleDemoState}
            className="text-[10px] px-3 py-1.5 rounded-lg bg-aura-input border border-aura-border hover:border-aura-blue text-aura-text transition-all font-mono cursor-pointer"
          >
            Toggle Target Mode: <span className={demoState === 'unidentified' ? 'text-aura-purple font-bold' : 'text-aura-green font-bold'}>{demoState.toUpperCase()}</span>
          </button>
        </div>

        {/* Split Panel Layout */}
        <div className="flex-1 flex flex-row gap-6 min-h-0">
          
          {/* Left Column: Viewfinder */}
          <div className="flex-1 flex flex-col min-w-0">
            {viewfinderContent}
            
            {/* Viewfinder Status Bar */}
            <div className="mt-3 py-2 px-3 bg-aura-input border border-aura-border rounded-lg text-center select-none font-mono">
              <span className="text-xs text-aura-cyan tracking-wide">
                {statusText}
              </span>
            </div>

            {/* Shutter Capture Button */}
            <div className="mt-4 flex justify-center items-center h-20">
              {!captured ? (
                <button
                  id="scan-capture"
                  onClick={handleCapture}
                  className="w-16 h-16 rounded-full border-4 border-aura-blue hover:border-opacity-80 flex items-center justify-center bg-transparent transition-all duration-200 active:scale-95 group cursor-pointer"
                  title="Capture Sighting Frame"
                >
                  <div className="w-12 h-12 bg-aura-text rounded-full transition-transform group-hover:scale-90"></div>
                </button>
              ) : (
                <span className="text-xs font-mono text-aura-muted">Target capture locked. Check analysis pane.</span>
              )}
            </div>
          </div>

          {/* Right Column: Telemetry Analysis Panel */}
          <div className="w-[380px] bg-aura-card/30 border border-aura-border rounded-xl p-5 flex flex-col justify-between overflow-y-auto custom-scrollbar select-none">
            {captured ? (
              resultsCardContent
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-aura-border/60 rounded-lg">
                <span className="text-3xl mb-3 text-aura-muted animate-pulse">📡</span>
                <h4 className="font-bold text-sm text-aura-text mb-1">RADAR STANDBY</h4>
                <p className="text-xs text-aura-muted leading-relaxed">
                  AURA camera viewfinder is tracking airspace coordinates. Trigger the shutter capture button on the left to initialize AI image scanning and signature classification.
                </p>
              </div>
            )}
            
            {/* Metadata Footer */}
            <div className="mt-6 pt-4 border-t border-aura-border/40 text-[9px] font-mono text-aura-muted flex justify-between">
              <span>SCANNER_ID: AR-99</span>
              <span>GRID_REF: 42-A-9</span>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="flex-1 flex flex-col justify-between p-4 relative overflow-hidden bg-aura-deep text-aura-text transition-colors duration-300">
      
      {/* Top Banner / Info */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-aura-muted">AI SCANNER</span>
        <button 
          id="toggle-demo-state"
          onClick={toggleDemoState}
          className="text-[10px] px-2 py-1 rounded bg-aura-input border border-aura-border hover:border-aura-blue text-aura-text transition-all font-mono cursor-pointer"
        >
          Mock Mode: <span className={demoState === 'unidentified' ? 'text-aura-purple font-bold' : 'text-aura-green font-bold'}>{demoState.toUpperCase()}</span>
        </button>
      </div>

      {/* Camera Viewfinder */}
      {viewfinderContent}

      {/* Viewfinder Status Bar */}
      <div className="mt-3 py-2 px-3 bg-aura-input border border-aura-border rounded-lg text-center select-none transition-colors duration-300">
        <span className="text-xs text-aura-cyan font-mono tracking-wide">
          {statusText}
        </span>
      </div>

      {/* Capture Control Button Section */}
      <div className="h-24 flex items-center justify-center relative">
        {!captured ? (
          <button
            id="scan-capture"
            onClick={handleCapture}
            className="w-16 h-16 rounded-full border-4 border-aura-blue hover:border-opacity-80 flex items-center justify-center bg-transparent transition-all duration-200 active:scale-95 group cursor-pointer"
          >
            <div className="w-12 h-12 bg-aura-text rounded-full transition-transform group-hover:scale-90"></div>
          </button>
        ) : (
          <div className="text-xs text-aura-muted font-mono flex items-center gap-1">
            <ChevronUp className="w-4 h-4 animate-bounce" /> Results detailed below
          </div>
        )}
      </div>

      {/* Slide up Result Panel */}
      <AnimatePresence>
        {captured && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 22, stiffness: 140 }}
            className="absolute bottom-0 left-0 right-0 bg-aura-card border-t border-aura-border rounded-t-2xl p-5 z-30 shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-aura-border rounded-full mx-auto mb-4"></div>
            {resultsCardContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
