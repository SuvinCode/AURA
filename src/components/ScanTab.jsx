import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCw, AlertTriangle, CheckCircle, ChevronUp, Cpu, MapPin } from 'lucide-react';
import { classifyDetection, isInHotspotZone, getNearestHotspot, generateTelemetryReport, AARO_DOMAINS } from '../data/ufoSignatures';

export default function ScanTab({ onAutoReport, theme, isLaptopDimensions }) {
  const [isScanning, setIsScanning] = useState(true);
  const [captured, setCaptured] = useState(false);
  const [demoState, setDemoState] = useState('unidentified');
  const [statusText, setStatusText] = useState('Scanning for objects...');
  const [showTargetOverlay, setShowTargetOverlay] = useState(true);

  const [cameraRequested, setCameraRequested] = useState(false);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [detections, setDetections] = useState([]);
  const videoRef = useRef(null);

  // TF.js model state
  const [openCvReady, setOpenCvReady] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelProgress, setModelProgress] = useState(0);
  const [modelReady, setModelReady] = useState(false);
  const rafRef = useRef(null);

  // Geolocation state
  const [userLocation, setUserLocation] = useState({ lat: 33.3943, lng: -104.5230 });
  const [locationLabel, setLocationLabel] = useState('Roswell, NM (default)');
  const [hotspotZone, setHotspotZone] = useState(null);

  // Classification result state
  const [classificationResult, setClassificationResult] = useState(null);
  const [telemetryLines, setTelemetryLines] = useState([]);

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

    if (cameraRequested && isScanning && !captured) {
      enableCamera();
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
    };
  }, [cameraRequested, isScanning, captured]);

  // Handle binding stream when the videoRef element mounts
  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // ── Geolocation on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation({ lat, lng });
        setLocationLabel(`${lat.toFixed(4)}° N, ${Math.abs(lng).toFixed(4)}° ${lng < 0 ? 'W' : 'E'}`);
        const zone = isInHotspotZone(lat, lng);
        if (zone.inZone) setHotspotZone(zone);
      },
      () => {}
    );
  }, []);

  // ── OpenCV.js model script loader ─────────────────────────────────────────
  useEffect(() => {
    if (!cameraRequested || openCvReady || modelLoading) return;
    let cancelled = false;

    async function loadOpenCvModel() {
      setModelLoading(true);
      setModelProgress(10);
      setStatusText('Booting OpenCV Core...');

      // Check if window.cv is already present and fully initialized
      if (window.cv && window.cv.Mat) {
        if (!cancelled) {
          setModelProgress(100);
          setOpenCvReady(true);
          setModelReady(true);
          setModelLoading(false);
          setStatusText('OpenCV Active — Live Contour Analysis running...');
        }
        return;
      }

      // Add OpenCV script dynamically if not exists
      const scriptId = 'opencv-js-script';
      let script = document.getElementById(scriptId);
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://docs.opencv.org/4.5.4/opencv.js';
        script.async = true;
        document.body.appendChild(script);
      }

      // Periodically check if cv wasm is fully loaded
      let checkInterval = setInterval(() => {
        if (cancelled) {
          clearInterval(checkInterval);
          return;
        }

        setModelProgress(prev => Math.min(85, prev + 10));
        setStatusText('Loading OpenCV WebAssembly modules...');

        if (window.cv && window.cv.Mat) {
          clearInterval(checkInterval);
          setModelProgress(100);
          setOpenCvReady(true);
          setModelReady(true);
          setModelLoading(false);
          setStatusText('OpenCV Core Active — Live Object Contour Detection...');
        }
      }, 500);

      // Fallback timeout to prevent stuck loader
      setTimeout(() => {
        clearInterval(checkInterval);
        if (cancelled) return;
        if (!window.cv || !window.cv.Mat) {
          console.warn('OpenCV load timed out. Running in simulated fallback mode.');
          setModelLoading(false);
          setModelProgress(100);
          setModelReady(true);
          setStatusText('Simulated CV Mode Active — Edge Contours active...');
        }
      }, 8000);
    }

    loadOpenCvModel();
    return () => { cancelled = true; };
  }, [cameraRequested]);

  // ── Real Canvas Computer Vision & Pixel analysis loop ────────────────
  useEffect(() => {
    if (!modelReady || !stream || !videoRef.current || !isScanning || captured) {
      setDetections([]);
      return;
    }
    let active = true;
    const video = videoRef.current;

    // Create an offscreen canvas to process video frames
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Exponential moving average parameters for smooth bounding box tracking
    let prevLeft = 0;
    let prevTop = 0;
    let prevWidth = 0;
    let prevHeight = 0;
    let hasLock = false;

    function processFrame() {
      if (!active) return;
      if (video.readyState < 2) {
        if (active) rafRef.current = requestAnimationFrame(processFrame);
        return;
      }

      try {
        const width = 160;
        const height = 120;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(video, 0, 0, width, height);

        const frame = ctx.getImageData(0, 0, width, height);
        const data = frame.data;

        // 1. Calculate average background colors of the frame
        let sumR = 0, sumG = 0, sumB = 0;
        const totalPixels = width * height;
        for (let i = 0; i < data.length; i += 4) {
          sumR += data[i];
          sumG += data[i+1];
          sumB += data[i+2];
        }
        const avgR = sumR / totalPixels;
        const avgG = sumG / totalPixels;
        const avgB = sumB / totalPixels;

        // 2. Scan frame for pixels deviating from average (foreground objects)
        let minX = width, maxX = 0, minY = height, maxY = 0;
        let foregroundCount = 0;
        let skinPixels = 0;
        let darkPixels = 0;
        let brightPixels = 0;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx+1];
            const b = data[idx+2];

            const diff = Math.sqrt(
              Math.pow(r - avgR, 2) +
              Math.pow(g - avgG, 2) +
              Math.pow(b - avgB, 2)
            );

            // Deviates significantly ➔ part of a foreground object
            if (diff > 42) {
              foregroundCount++;
              minX = Math.min(minX, x);
              maxX = Math.max(maxX, x);
              minY = Math.min(minY, y);
              maxY = Math.max(maxY, y);

              // Classification heuristics based on real-time colors:
              // Skin tones (living human/hand)
              if (r > 90 && g > 40 && b > 20 && r > g && r > b && (r - g) > 12) {
                skinPixels++;
              }
              // Dark plastic/metal (laptop/mobile/camera)
              if (r < 75 && g < 75 && b < 75) {
                darkPixels++;
              }
              // Bright emitters (light source/reflective anomaly)
              if (r > 200 && g > 200 && b > 170) {
                brightPixels++;
              }
            }
          }
        }

        // 3. Update target list if an object is actively presented
        if (foregroundCount > 250) {
          const targetX = (minX / width) * 100;
          const targetY = (minY / height) * 100;
          const targetW = ((maxX - minX) / width) * 100;
          const targetH = ((maxY - minY) / height) * 100;

          // Apply exponential moving average to eliminate bounding box jitter
          if (!hasLock) {
            prevLeft = targetX;
            prevTop = targetY;
            prevWidth = targetW;
            prevHeight = targetH;
            hasLock = true;
          } else {
            prevLeft = prevLeft * 0.7 + targetX * 0.3;
            prevTop = prevTop * 0.7 + targetY * 0.3;
            prevWidth = prevWidth * 0.75 + targetW * 0.25;
            prevHeight = prevHeight * 0.75 + targetH * 0.25;
          }

          // Make sure dimensions are reasonable
          const finalW = Math.max(15, Math.min(85, prevWidth));
          const finalH = Math.max(15, Math.min(85, prevHeight));
          const finalL = Math.max(5, Math.min(95 - finalW, prevLeft));
          const finalT = Math.max(5, Math.min(95 - finalH, prevTop));

          // Determine object type based on color heuristics
          let label = 'PHYSICAL OBJECT';
          let type = 'non-living';

          if (brightPixels / foregroundCount > 0.12) {
            label = 'ANOMALOUS LUMINESCENCE';
            type = 'anomalous';
          } else if (skinPixels / foregroundCount > 0.22) {
            label = 'HUMAN / ORGANIC LIFE';
            type = 'living';
          } else if (darkPixels / foregroundCount > 0.32) {
            label = 'MOBILE / ELECTRONIC';
            type = 'non-living';
          } else {
            label = 'HARDWARE / STRUCTURE';
            type = 'non-living';
          }

          // Fetch simulated coordinates matching classifications
          const classification = classifyDetection(
            { class: type === 'living' ? 'person' : (type === 'anomalous' ? 'airplane' : 'laptop'), score: 0.88 },
            userLocation.lat,
            userLocation.lng
          );

          setDetections([{
            id: 'real-cv-target',
            label,
            confidence: `${Math.min(99.4, 82.5 + (foregroundCount / 100)).toFixed(1)}%`,
            uapScore: classification.uapScore,
            type,
            left: finalL,
            top: finalT,
            width: finalW,
            height: finalH,
            classification
          }]);
        } else {
          // If no object is presented in front, keep the scanner empty but active
          setDetections([]);
          hasLock = false;
        }
      } catch (err) {
        console.error('Frame segmentation error:', err);
      }

      if (active) rafRef.current = requestAnimationFrame(processFrame);
    }

    rafRef.current = requestAnimationFrame(processFrame);
    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [modelReady, stream, isScanning, captured, userLocation]);

  // ── Mock fallback detection loop (no active video stream) ──────────────────
  useEffect(() => {
    if (stream || !modelReady || !isScanning || captured) return;
    let active = true;
    let frameId;

    // Normal environment objects — low UAP probability
    const targets = [
      { baseClass: 'person',     label: 'HUMAN / ORGANIC',    type: 'living',     x: 35, y: 30, w: 18, h: 42, speedX: 0.04, speedY: 0.02, phase: 0.0 },
      { baseClass: 'laptop',     label: 'LAPTOP / TERMINAL',  type: 'non-living', x: 60, y: 48, w: 20, h: 16, speedX: 0.00, speedY: 0.00, phase: 1.5 },
      { baseClass: 'cell phone', label: 'MOBILE DEVICE',      type: 'non-living', x: 15, y: 62, w: 9,  h: 11, speedX: 0.05, speedY: 0.03, phase: 3.1 },
      { baseClass: 'cup',        label: 'CONTAINER',          type: 'non-living', x: 48, y: 58, w: 7,  h: 9,  speedX: 0.02, speedY: 0.01, phase: 0.5 },
      { baseClass: 'clock',      label: 'DISC OBJECT',        type: 'non-living', x: 72, y: 20, w: 10, h: 10, speedX: 0.01, speedY: 0.01, phase: 2.0 },
      { baseClass: 'bottle',     label: 'CYLINDRICAL OBJECT', type: 'non-living', x: 22, y: 40, w: 7,  h: 14, speedX: 0.02, speedY: 0.02, phase: 4.2 },
      { baseClass: 'tv',         label: 'DISPLAY UNIT',       type: 'non-living', x: 55, y: 20, w: 22, h: 14, speedX: 0.00, speedY: 0.00, phase: 1.1 },
    ];

    // Anomalous targets — high UAP probability, erratic movement
    const anomalyTargets = [
      { baseClass: 'unknown',      label: 'ANOMALOUS ORB',        type: 'anomalous',    x: 50, y: 18, w: 12, h: 12, speedX: 0.12, speedY: 0.10, phase: 0.8 },
      { baseClass: 'kite',         label: 'UNDETECTABLE',         type: 'undetectable', x: 72, y: 12, w: 14, h: 14, speedX: 0.18, speedY: 0.15, phase: 2.2 },
      { baseClass: 'sports ball',  label: 'SPHERICAL ANOMALY',    type: 'anomalous',    x: 28, y: 22, w: 11, h: 11, speedX: 0.14, speedY: 0.08, phase: 1.3 },
      { baseClass: 'frisbee',      label: 'DISC FORMATION',       type: 'anomalous',    x: 60, y: 30, w: 15, h: 7,  speedX: 0.20, speedY: 0.06, phase: 3.5 },
      { baseClass: 'umbrella',     label: 'CHEVRON STRUCTURE',    type: 'anomalous',    x: 42, y: 55, w: 18, h: 10, speedX: 0.09, speedY: 0.12, phase: 0.4 },
      { baseClass: 'baseball bat', label: 'CYLINDER / CIGAR',     type: 'anomalous',    x: 20, y: 35, w: 8,  h: 22, speedX: 0.07, speedY: 0.16, phase: 5.1 },
      { baseClass: 'unknown',      label: 'DARK TRIANGLE',        type: 'undetectable', x: 38, y: 10, w: 22, h: 14, speedX: 0.10, speedY: 0.05, phase: 1.9 },
    ];
    const tick = (ts) => {
      if (!active) return;
      const pool = demoState === 'unidentified' ? [...targets, ...anomalyTargets] : targets;
      const mapped = pool.map((t, i) => {
        const off = ts / 1000;
        const left = Math.max(3, Math.min(85 - t.w, t.x + Math.sin(off + t.phase) * t.speedX * 12));
        const top  = Math.max(3, Math.min(82 - t.h, t.y + Math.cos(off + t.phase) * t.speedY * 12));
        const cls  = classifyDetection({ class: t.baseClass, score: 0.88 }, userLocation.lat, userLocation.lng);
        return { id: i + Date.now(), label: t.label, confidence: `${cls.cocoConfidence}%`, uapScore: cls.uapScore, type: t.type, left, top, width: t.w, height: t.h, classification: cls };
      });
      setDetections(mapped);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => { active = false; cancelAnimationFrame(frameId); };
  }, [stream, modelReady, isScanning, captured, demoState, userLocation]);

  // Status bar cycling phrases
  useEffect(() => {
    if (!isScanning) return;
    const phrases = [
      'Scanning for objects...',
      'Analyzing thermal signatures...',
      'Filtering atmospheric noise...',
      'Matching celestial models...',
      'Tracking trajectory vectors...',
      'Cross-referencing NUFORC database...',
      'Running edge contour analysis...',
      'Checking UAP hotspot proximity...',
      'Calibrating spectral filters...',
      'Validating AARO classification schema...',
      'Deep-scanning EM spectrum...',
      'Triangulating anomaly coordinates...',
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % phrases.length;
      setStatusText(phrases[idx]);
    }, 2800);
    return () => clearInterval(interval);
  }, [isScanning]);

  const [capturedImage, setCapturedImage] = useState(null);

  const handleCapture = () => {
    // Capture the frame immediately from live camera or generate simulated grid sighting
    if (stream && videoRef.current) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg');
          setCapturedImage(dataUrl);
        }
      } catch (err) {
        console.error("Failed to capture video stream frame:", err);
      }
    } else {
      // Generate simulated high-tech radar lock sighting image
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Tactical dark gradient space
          const grad = ctx.createRadialGradient(200, 150, 40, 200, 150, 200);
          grad.addColorStop(0, '#0a101f');
          grad.addColorStop(1, '#020408');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 400, 300);

          // Grid system
          ctx.strokeStyle = 'rgba(58, 107, 255, 0.15)';
          ctx.lineWidth = 1;
          for (let x = 0; x < 400; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 300);
            ctx.stroke();
          }
          for (let y = 0; y < 300; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(400, y);
            ctx.stroke();
          }

          // Render simulated target anomaly
          if (demoState === 'unidentified') {
            // Draw a glowing anomaly orb in the center
            const orbGrad = ctx.createRadialGradient(200, 150, 2, 200, 150, 18);
            orbGrad.addColorStop(0, '#ffffff');
            orbGrad.addColorStop(0.3, '#B06AFF');
            orbGrad.addColorStop(1, 'rgba(176, 106, 255, 0)');
            ctx.fillStyle = orbGrad;
            ctx.beginPath();
            ctx.arc(200, 150, 30, 0, Math.PI * 2);
            ctx.fill();
            
            // Outer glow ring
            ctx.strokeStyle = 'rgba(176, 106, 255, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(200, 150, 35, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            // Identified commercial aviation craft silhouette
            ctx.fillStyle = '#22C97A';
            ctx.font = '36px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✈', 200, 150);
          }

          // Target crosshairs
          ctx.strokeStyle = 'rgba(58, 107, 255, 0.35)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(200, 150, 50, 0, Math.PI * 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(200, 85); ctx.lineTo(200, 95);
          ctx.moveTo(200, 205); ctx.lineTo(200, 215);
          ctx.moveTo(135, 150); ctx.lineTo(145, 150);
          ctx.moveTo(255, 150); ctx.lineTo(265, 150);
          ctx.stroke();

          // Corner frames
          ctx.strokeStyle = '#3A6BFF';
          ctx.lineWidth = 2.5;
          // TL
          ctx.beginPath(); ctx.moveTo(25, 45); ctx.lineTo(25, 25); ctx.lineTo(45, 25); ctx.stroke();
          // TR
          ctx.beginPath(); ctx.moveTo(375, 45); ctx.lineTo(375, 25); ctx.lineTo(355, 25); ctx.stroke();
          // BL
          ctx.beginPath(); ctx.moveTo(25, 255); ctx.lineTo(25, 275); ctx.lineTo(45, 275); ctx.stroke();
          // BR
          ctx.beginPath(); ctx.moveTo(375, 255); ctx.lineTo(375, 275); ctx.lineTo(355, 275); ctx.stroke();

          // Text metrics overlay
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.font = '9px monospace';
          ctx.fillText('LAT: 33.3943 N', 30, 265);
          ctx.fillText('LNG: -104.5230 W', 280, 265);
          ctx.fillText('SECURE DATA LINK LOCKED', 30, 45);

          const dataUrl = canvas.toDataURL('image/jpeg');
          setCapturedImage(dataUrl);
        }
      } catch (err) {
        console.error("Failed to generate simulated capture frame:", err);
      }
    }

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
    setCapturedImage(null);
  };

  const toggleDemoState = () => {
    setDemoState(prev => prev === 'identified' ? 'unidentified' : 'identified');
  };

  // Viewfinder markup snippet
  const viewfinderContent = (
    <div className="relative flex-1 min-h-[280px] rounded-xl bg-black border border-aura-border flex flex-col items-center justify-center overflow-hidden shadow-inner">
      {!cameraRequested ? (
        /* Camera Off Placeholder */
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90 pointer-events-none z-0"></div>
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none map-grid-bg z-0"></div>
          
          <div className="w-14 h-14 rounded-full border border-aura-border/40 flex items-center justify-center mb-3 bg-aura-card/30 relative z-10">
            <Camera className="w-6 h-6 text-aura-muted" />
            <div className="absolute w-18 h-18 rounded-full border border-dashed border-aura-blue/20 animate-spin" style={{ animationDuration: '20s' }}></div>
          </div>
          
          <h3 className="font-mono text-[10px] text-aura-muted tracking-wider uppercase mb-1 z-10">AI SCANNER SYSTEM STANDBY</h3>
          <p className="text-xs text-aura-muted max-w-xs mb-4 leading-relaxed z-10">
            Establish live visual link to activate real-time object classification and living vs non-living identification protocol.
          </p>
          
          <button
            id="btn-start-camera"
            onClick={() => setCameraRequested(true)}
            className="px-4 py-2 rounded-lg bg-aura-blue hover:bg-opacity-95 text-white font-semibold flex items-center gap-2 transition-all shadow-lg shadow-aura-blue/15 hover:shadow-aura-blue/25 active:scale-[0.98] cursor-pointer text-xs font-mono tracking-wider z-20"
          >
            <Camera className="w-3.5 h-3.5" /> ACTIVATE CAMERA FEED
          </button>
        </div>
      ) : (
        /* Camera Active view */
        <>
          {stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          ) : (
            /* Fallback Simulator / Loading state */
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-0"></div>
              <div className="absolute inset-0 opacity-20 pointer-events-none map-grid-bg z-0"></div>
              {cameraError && (
                <div className="absolute top-3 left-3 right-3 bg-red-950/40 backdrop-blur-md border border-red-500/20 rounded px-2.5 py-1.5 text-[10px] text-red-300 font-mono flex items-center gap-1.5 z-30">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Camera access failed: {cameraError}. Running in simulated environment.</span>
                </div>
              )}
            </>
          )}

          {/* Dynamic ML Bounding Boxes */}
          {showTargetOverlay && isScanning && !captured && detections.map(det => (
            <motion.div
              key={det.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={
                det.type === 'undetectable' 
                  ? { 
                      opacity: [1, 0.2, 1],
                      scale: [1, 1.04, 1],
                      left: `${det.left}%`,
                      top: `${det.top}%`,
                      width: `${det.width}%`,
                      height: `${det.height}%`
                    }
                  : { 
                      opacity: 1, 
                      scale: 1,
                      left: `${det.left}%`,
                      top: `${det.top}%`,
                      width: `${det.width}%`,
                      height: `${det.height}%`
                    }
              }
              transition={
                det.type === 'undetectable'
                  ? {
                      opacity: { repeat: Infinity, duration: 0.7, ease: "easeInOut" },
                      scale: { repeat: Infinity, duration: 0.7, ease: "easeInOut" },
                      left: { type: "spring", damping: 15, stiffness: 80 },
                      top: { type: "spring", damping: 15, stiffness: 80 },
                      width: { type: "spring", damping: 15, stiffness: 80 },
                      height: { type: "spring", damping: 15, stiffness: 80 }
                    }
                  : { type: "spring", damping: 15, stiffness: 80 }
              }
              exit={{ opacity: 0, scale: 0.9 }}
              className={`absolute border-2 rounded flex flex-col justify-between p-1 z-20 ${
                det.type === 'living' 
                  ? 'border-[#B06AFF] shadow-[0_0_8px_rgba(176,106,255,0.4)]' 
                  : det.type === 'anomalous'
                  ? 'border-[#FF8C00] shadow-[0_0_12px_rgba(255,140,0,0.6)] animate-pulse'
                  : det.type === 'undetectable'
                  ? 'border-red-500 shadow-[0_0_16px_rgba(239,68,68,0.85)]'
                  : 'border-[#22C97A] shadow-[0_0_8px_rgba(34,201,122,0.4)]'
              }`}
            >
              {/* Label Banner on Top */}
              <div className="absolute -top-5 left-0 bg-black/75 backdrop-blur-sm border-x border-t rounded-t px-1.5 py-0.5 text-[8px] font-mono whitespace-nowrap flex items-center gap-1.5"
                   style={{ 
                     borderColor: det.type === 'living' 
                       ? '#B06AFF' 
                       : det.type === 'anomalous' 
                       ? '#FF8C00' 
                       : det.type === 'undetectable'
                       ? '#EF4444'
                       : '#22C97A' 
                   }}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  det.type === 'living' 
                    ? 'bg-[#B06AFF]' 
                    : det.type === 'anomalous' 
                    ? 'bg-[#FF8C00] animate-ping' 
                    : det.type === 'undetectable'
                    ? 'bg-red-500 animate-ping'
                    : 'bg-[#22C97A]'
                }`}></span>
                <span className="text-white font-semibold">{det.label.split(' [')[0]}</span>
                <span className={`px-1 rounded-[3px] text-[7px] font-extrabold tracking-wider ${
                  det.type === 'living' ? 'bg-[#B06AFF]/20 text-[#D8B4FE]' :
                  det.type === 'non-living' ? 'bg-[#22C97A]/20 text-[#A7F3D0]' :
                  det.type === 'anomalous' ? 'bg-[#FF8C00]/20 text-[#FDBA74]' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {det.type === 'living' ? 'LIVING' : det.type === 'non-living' ? 'NON-LIVING' : det.type.toUpperCase()}
                </span>
                <span className="text-white/60 font-medium">({det.confidence})</span>
              </div>
 
              {/* Bounding Box Corner Telemetry Lines */}
              <div className="flex-1 flex justify-between items-start pointer-events-none">
                <div className="w-2.5 h-2.5 border-t border-l opacity-60"></div>
                <div className="w-2.5 h-2.5 border-t border-r opacity-60"></div>
              </div>
              <div className="flex justify-between items-end pointer-events-none">
                <div className="w-2.5 h-2.5 border-b border-l opacity-60"></div>
                <div className="w-2.5 h-2.5 border-b border-r opacity-60"></div>
              </div>
            </motion.div>
          ))}

          {/* Viewfinder Target Corner Brackets */}
          {!captured && (
            <div className="absolute w-48 h-48 flex flex-col justify-between p-1 z-20">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-2 border-l-2 border-aura-blue rounded-tl-sm animate-pulse"></div>
                <div className="w-6 h-6 border-t-2 border-r-2 border-aura-blue rounded-tr-sm animate-pulse"></div>
              </div>
              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-2 border-l-2 border-aura-blue rounded-bl-sm animate-pulse"></div>
                <div className="w-6 h-6 border-b-2 border-r-2 border-aura-blue rounded-tr-sm animate-pulse"></div>
              </div>
            </div>
          )}

          {/* Animated Pulse Ring */}
          {isScanning && (
            <div className="absolute w-36 h-36 rounded-full border border-aura-blue/40 animate-pulse-ring pointer-events-none z-20"></div>
          )}

          {/* Mock visual objects */}
          {showTargetOverlay && (
            <div className="absolute z-10 flex flex-col items-center pointer-events-none">
              {demoState === 'unidentified' ? (
                <div className={`w-6 h-6 bg-[#B06AFF] rounded-full filter blur-[3px] opacity-75 relative ${isScanning ? 'animate-bounce' : ''}`}>
                  <div className="absolute inset-0 bg-[#B06AFF] rounded-full blur-[8px] opacity-80 animate-ping"></div>
                </div>
              ) : (
                <div className={`text-[#22C97A] text-opacity-40 text-4xl font-light transform -rotate-12 select-none ${isScanning ? 'animate-pulse' : ''}`}>
                  ✈
                </div>
              )}
            </div>
          )}

          {/* Text indicators */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between z-20">
            <span className="text-[10px] text-white/50 font-mono">LAT: 33.3943° N</span>
            <span className="text-[10px] text-white/50 font-mono">LNG: -104.5230° W</span>
          </div>

          {/* Captured Freeze Overlay */}
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
        </>
      )}
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

      {/* Captured Zoomed Telemetry Frame */}
      {capturedImage && (
        <div className="relative border border-aura-border bg-black/40 rounded-lg overflow-hidden h-36 flex flex-col justify-end p-2 select-none">
          <img 
            src={capturedImage} 
            alt="Scanned Target" 
            className="absolute inset-0 w-full h-full object-cover scale-150 origin-center filter brightness-110 contrast-125 saturate-105"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-8 h-8 border border-dashed border-red-500/50 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="w-4 h-4 border border-red-500/40 rounded-full"></div>
            <div className="absolute w-8 h-px bg-red-500/30"></div>
            <div className="absolute h-8 w-px bg-red-500/30"></div>
          </div>
          <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm border border-aura-border/40 rounded px-1.5 py-0.5 text-[8px] font-mono text-aura-cyan z-10 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-aura-cyan animate-pulse"></span>
            <span>ZOOM: 4.0X OPTICAL LOCK</span>
          </div>
          <div className="relative z-10 bg-black/70 border border-aura-border/40 px-2 py-0.5 rounded text-[8px] font-mono text-white/80 w-full flex justify-between">
            <span>MAG: +1.4</span>
            <span>GRID: OK</span>
          </div>
        </div>
      )}

      {/* Live classification result from COCO-SSD + UFO engine, or demo fallback */}
      {(() => {
        const topDet = detections[0];
        const cls = topDet?.classification;
        const uapPct = cls ? parseFloat(cls.uapScore) : (demoState === 'unidentified' ? 92 : 6);
        const isAnom = uapPct >= 60;
        const scoreColor = uapPct >= 85 ? '#B06AFF' : uapPct >= 60 ? '#FF8C00' : uapPct >= 30 ? '#22B8C9' : '#22C97A';
        const domain = cls?.aaroDomain || (isAnom ? AARO_DOMAINS.TRANSIENT : AARO_DOMAINS.AIRBORNE);
        const nuforc = cls?.nuforc_reports;
        const detectedClass = cls?.uapShapeLabel || (demoState === 'unidentified' ? 'Sphere / Orb' : 'Fixed-Wing Aircraft');
        const verdict = cls?.verdict || (isAnom ? 'ANOMALOUS — UAP SIGNATURE CONFIRMED' : 'IDENTIFIED — KNOWN OBJECT CLASS');

        return (
          <div className="space-y-3">
            {/* UAP Score Meter */}
            <div className="p-3 bg-aura-input rounded-lg border border-aura-border space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-aura-text">UAP Signature Score</span>
                <span className="text-sm font-bold font-mono" style={{ color: scoreColor }}>{uapPct.toFixed(1)}%</span>
              </div>
              <div className="w-full h-1.5 bg-aura-deep rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${uapPct}%`, backgroundColor: scoreColor }} />
              </div>
              <p className="text-[10px] font-mono" style={{ color: scoreColor }}>{verdict}</p>
            </div>

            {/* Classification Details */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-aura-deep rounded-lg border border-aura-border/60">
                <p className="text-[9px] text-aura-muted font-mono uppercase mb-0.5">Object Class</p>
                <p className="text-xs font-bold text-aura-text">{detectedClass}</p>
              </div>
              <div className="p-2 bg-aura-deep rounded-lg border border-aura-border/60">
                <p className="text-[9px] text-aura-muted font-mono uppercase mb-0.5">AARO Domain</p>
                <p className="text-xs font-bold" style={{ color: domain.color }}>{domain.label.split(' ')[0]}</p>
              </div>
              {nuforc && (
                <div className="p-2 bg-aura-deep rounded-lg border border-aura-border/60">
                  <p className="text-[9px] text-aura-muted font-mono uppercase mb-0.5">NUFORC Matches</p>
                  <p className="text-xs font-bold text-aura-text">{nuforc.toLocaleString()}</p>
                </div>
              )}
              <div className="p-2 bg-aura-deep rounded-lg border border-aura-border/60">
                <p className="text-[9px] text-aura-muted font-mono uppercase mb-0.5">ML Engine</p>
                <p className="text-xs font-bold" style={{ color: modelReady ? '#22C97A' : '#FF8C00' }}>{modelReady ? 'COCO-SSD' : 'SIMULATED'}</p>
              </div>
            </div>

            {/* Hotspot warning */}
            {hotspotZone?.inZone && (
              <div className="p-2 bg-red-950/30 border border-red-500/30 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-red-400">HIGH ANOMALY ZONE</p>
                  <p className="text-[9px] text-red-300/80">{hotspotZone.hotspot.name} · {hotspotZone.distanceKm.toFixed(1)} km</p>
                </div>
              </div>
            )}

            {isAnom ? (
              <button
                id="scan-submit-report"
                onClick={() => onAutoReport({
                  description: cls ? `COCO-SSD detected: ${cls.cocoClass}. UAP score: ${cls.uapScore}%. ${cls.aaroDomain.description}` : 'Glowing anomalous orb captured. Object could not be classified by AI.',
                  type: 'Aerial',
                  behaviors: ['Hovering', 'Silent', 'Lights', 'Disappeared'],
                  image: capturedImage
                })}
                className="w-full py-2.5 rounded-lg bg-[#B06AFF] hover:bg-[#A052FF] text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#B06AFF]/20 active:scale-[0.98] cursor-pointer text-sm"
              >
                Submit Sighting Report
              </button>
            ) : (
              <button onClick={handleReset} className="w-full py-2.5 rounded-lg border border-aura-border hover:border-aura-blue text-aura-text font-semibold transition-all active:scale-[0.98] cursor-pointer text-sm">
                Scan Again
              </button>
            )}
          </div>
        );
      })()}
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
          <div className="flex items-center gap-2">
            <button 
              id="toggle-target-overlay"
              onClick={() => setShowTargetOverlay(prev => !prev)}
              className="text-[10px] px-3 py-1.5 rounded-lg bg-aura-input border border-aura-border hover:border-aura-blue text-aura-text transition-all font-mono cursor-pointer"
            >
              UFO Overlay: <span className={showTargetOverlay ? 'text-aura-cyan font-bold' : 'text-aura-muted font-bold'}>{showTargetOverlay ? 'ENABLED' : 'DISABLED'}</span>
            </button>
            <button 
              id="toggle-demo-state"
              onClick={toggleDemoState}
              className="text-[10px] px-3 py-1.5 rounded-lg bg-aura-input border border-aura-border hover:border-aura-blue text-aura-text transition-all font-mono cursor-pointer"
            >
              Toggle Target Mode: <span className={demoState === 'unidentified' ? 'text-aura-purple font-bold' : 'text-aura-green font-bold'}>{demoState.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* Split Panel Layout */}
        <div className="flex-1 flex flex-row gap-6 min-h-0">
          
          {/* Left Column: Viewfinder */}
          <div className="flex-1 flex flex-col min-w-0">
            {viewfinderContent}
            
            {/* Model Loading Progress Bar */}
            {modelLoading && (
              <div className="mt-3 p-2 bg-aura-input border border-aura-border rounded-lg">
                <div className="flex justify-between text-[9px] font-mono text-aura-muted mb-1">
                  <span className="flex items-center gap-1"><Cpu className="w-2.5 h-2.5" /> Loading COCO-SSD Model...</span>
                  <span>{modelProgress}%</span>
                </div>
                <div className="w-full h-1 bg-aura-deep rounded-full overflow-hidden">
                  <div className="h-full bg-aura-blue rounded-full transition-all duration-300" style={{ width: `${modelProgress}%` }} />
                </div>
              </div>
            )}

            {/* Viewfinder Status Bar */}
            <div className="mt-2 py-2 px-3 bg-aura-input border border-aura-border rounded-lg text-center select-none font-mono flex items-center justify-between">
              <span className="text-xs text-aura-cyan tracking-wide">{statusText}</span>
              {userLocation && (
                <span className="text-[9px] text-aura-muted flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  {userLocation.lat.toFixed(3)}° {userLocation.lng.toFixed(3)}°
                  {hotspotZone?.inZone && <span className="text-red-400 font-bold"> ⚠ HOTZONE</span>}
                </span>
              )}
            </div>

            {/* Shutter Capture Button */}
            <div className="mt-4 flex justify-center items-center h-20">
              {!captured ? (
                <button
                  id="scan-capture"
                  onClick={handleCapture}
                  disabled={!cameraRequested}
                  className={`w-16 h-16 rounded-full border-4 border-aura-blue flex items-center justify-center bg-transparent transition-all duration-200 active:scale-95 group cursor-pointer ${
                    !cameraRequested ? 'opacity-30 cursor-not-allowed border-aura-muted' : 'hover:border-opacity-80'
                  }`}
                  title={cameraRequested ? "Capture Sighting Frame" : "Activate camera feed first"}
                >
                  <div className={`w-12 h-12 rounded-full transition-transform ${
                    !cameraRequested ? 'bg-aura-muted' : 'bg-aura-text group-hover:scale-90'
                  }`}></div>
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
        <div className="flex gap-2">
          <button 
            id="toggle-target-overlay"
            onClick={() => setShowTargetOverlay(prev => !prev)}
            className="text-[10px] px-2 py-1 rounded bg-aura-input border border-aura-border hover:border-aura-blue text-aura-text transition-all font-mono cursor-pointer"
          >
            UFO: <span className={showTargetOverlay ? 'text-aura-cyan font-bold' : 'text-aura-muted font-bold'}>{showTargetOverlay ? 'ON' : 'OFF'}</span>
          </button>
          <button 
            id="toggle-demo-state"
            onClick={toggleDemoState}
            className="text-[10px] px-2 py-1 rounded bg-aura-input border border-aura-border hover:border-aura-blue text-aura-text transition-all font-mono cursor-pointer"
          >
            Mock: <span className={demoState === 'unidentified' ? 'text-aura-purple font-bold' : 'text-aura-green font-bold'}>{demoState.toUpperCase()}</span>
          </button>
        </div>
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
            disabled={!cameraRequested}
            className={`w-16 h-16 rounded-full border-4 border-aura-blue flex items-center justify-center bg-transparent transition-all duration-200 active:scale-95 group cursor-pointer ${
              !cameraRequested ? 'opacity-30 cursor-not-allowed border-aura-muted' : 'hover:border-opacity-80'
            }`}
            title={cameraRequested ? "Capture Sighting Frame" : "Activate camera feed first"}
          >
            <div className={`w-12 h-12 rounded-full transition-transform ${
              !cameraRequested ? 'bg-aura-muted' : 'bg-aura-text group-hover:scale-90'
            }`}></div>
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
