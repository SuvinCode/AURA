import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, RefreshCw } from 'lucide-react';

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#080C14" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#080C14" }, { weight: 1 }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5A7AAA" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1A2840" }, { weight: 1 }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#5A7AAA" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#0D1A2E" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#0D1A2E" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#5A7AAA" }, { visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#101C3A" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#1A2840" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#1A2840" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#3A6BFF" }, { opacity: 0.15 }, { weight: 1 }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#0D1A2E" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#030508" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#5A7AAA" }],
  },
];

// Helper to load Google Maps script
const loadGoogleMapsScript = (callback) => {
  if (window.google && window.google.maps) {
    callback(true);
    return;
  }
  const existingScript = document.getElementById('googleMapsScript');
  if (existingScript) {
    existingScript.addEventListener('load', () => callback(true));
    existingScript.addEventListener('error', () => callback(false));
    return;
  }
  const script = document.createElement('script');
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
  script.id = 'googleMapsScript';
  script.async = true;
  script.defer = true;
  script.onload = () => callback(true);
  script.onerror = () => callback(false);
  document.body.appendChild(script);
};

export default function MapTab({ reports, theme, isLaptopDimensions }) {
  const mapRef = useRef(null);
  const googleMapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState(false);

  // Roswell center coordinates
  const defaultCenter = { lat: 33.3943, lng: -104.5230 };

  useEffect(() => {
    loadGoogleMapsScript((success) => {
      if (success) {
        setGoogleMapsLoaded(true);
      } else {
        setGoogleMapsError(true);
      }
    });
  }, []);

  // Filter reports
  const filteredReports = reports.filter(report => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unidentified') return report.tag === 'Unidentified';
    if (activeFilter === 'Aerial') return report.type === 'Aerial';
    if (activeFilter === 'Land') return report.type === 'Land';
    if (activeFilter === 'Last 24h') {
      return report.time.includes('min') || report.time.includes('hour') || report.time.includes('hours');
    }
    return true;
  });

  // Handle Google Maps styling update dynamically when theme changes
  useEffect(() => {
    if (googleMapsLoaded && googleMapInstanceRef.current) {
      googleMapInstanceRef.current.setOptions({
        styles: theme === 'dark' ? darkMapStyle : [],
        backgroundColor: theme === 'dark' ? '#080C14' : '#F3F6FC'
      });
      
      // Update markers icons depending on theme (better contrasts)
      markersRef.current.forEach((marker, index) => {
        const report = filteredReports[index];
        if (report) {
          let color = theme === 'dark' ? '#3A6BFF' : '#2563EB';
          if (report.tag === 'Unidentified') color = theme === 'dark' ? '#B06AFF' : '#7C3AED';
          else if (report.tag === 'Aerial' || report.tag === 'Aerial Sighting') color = theme === 'dark' ? '#22B8C9' : '#0891B2';
          else if (report.tag === 'Land' || report.tag === 'Land Sighting') color = theme === 'dark' ? '#22C97A' : '#059669';
          else if (report.tag === 'Alert' || report.tag === 'High Activity') color = theme === 'dark' ? '#FF6B35' : '#EA580C';
          
          marker.setIcon({
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: color,
            fillOpacity: 0.95,
            scale: 9,
            strokeColor: theme === 'dark' ? '#080C14' : '#FFFFFF',
            strokeWeight: 2,
          });
        }
      });
    }
  }, [theme, googleMapsLoaded, filteredReports]);

  // Re-render Google Map markers when loaded or when reports/filter change
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current) return;

    if (!googleMapInstanceRef.current) {
      googleMapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 13,
        styles: theme === 'dark' ? darkMapStyle : [],
        disableDefaultUI: true,
        zoomControl: false,
        backgroundColor: theme === 'dark' ? '#080C14' : '#F3F6FC'
      });
    }

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Create markers for filtered reports
    filteredReports.forEach(report => {
      let color = theme === 'dark' ? '#3A6BFF' : '#2563EB';
      if (report.tag === 'Unidentified') color = theme === 'dark' ? '#B06AFF' : '#7C3AED';
      else if (report.tag === 'Aerial' || report.tag === 'Aerial Sighting') color = theme === 'dark' ? '#22B8C9' : '#0891B2';
      else if (report.tag === 'Land' || report.tag === 'Land Sighting') color = theme === 'dark' ? '#22C97A' : '#059669';
      else if (report.tag === 'Alert' || report.tag === 'High Activity') color = theme === 'dark' ? '#FF6B35' : '#EA580C';

      const pinSvg = {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 0.95,
        scale: 9,
        strokeColor: theme === 'dark' ? '#080C14' : '#FFFFFF',
        strokeWeight: 2,
      };

      const marker = new window.google.maps.Marker({
        position: { lat: report.lat, lng: report.lng },
        map: googleMapInstanceRef.current,
        icon: pinSvg,
        title: report.title,
      });

      marker.addListener('click', () => {
        setSelectedReport(report);
        googleMapInstanceRef.current.panTo({ lat: report.lat, lng: report.lng });
      });

      markersRef.current.push(marker);
    });
  }, [googleMapsLoaded, filteredReports]);

  // Center button handler
  const handleCenter = () => {
    if (googleMapsLoaded && googleMapInstanceRef.current) {
      googleMapInstanceRef.current.panTo(defaultCenter);
      googleMapInstanceRef.current.setZoom(13);
    }
  };

  const handleMockPinClick = (report) => {
    setSelectedReport(report);
  };

  // Helper to handle selection of a report from the sidebar list
  const handleSelectReport = (report) => {
    setSelectedReport(report);
    if (googleMapsLoaded && googleMapInstanceRef.current) {
      googleMapInstanceRef.current.panTo({ lat: report.lat, lng: report.lng });
      googleMapInstanceRef.current.setZoom(14);
    }
  };

  // Shared Map Container Layout (renders actual Google Maps or Fallback Mock CSS Grid Map)
  const mapElement = (
    <div className="flex-1 h-full w-full relative min-h-[300px]">
      {googleMapsError || !googleMapsLoaded ? (
        /* CSS Grid Mock Map Fallback */
        <div className="w-full h-full min-h-[300px] relative overflow-hidden bg-aura-card map-grid-bg flex flex-col items-center justify-center transition-colors duration-300">
          
          {/* Mock Grid Lines & Radar concentric circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <div className="w-96 h-96 rounded-full border border-aura-blue/10 animate-pulse"></div>
            <div className="w-64 h-64 rounded-full border border-aura-blue/5"></div>
            <div className="w-32 h-32 rounded-full border border-aura-blue/10"></div>
          </div>

          <div className="absolute top-16 left-4 font-mono text-[9px] text-aura-muted space-y-1 select-none pointer-events-none">
            <p>GRID REF: UAP-NV-SF</p>
            <p>RESOLUTION: 1.2m/px</p>
            <p>LAT: 33.3943° N / LNG: -104.5230° W</p>
          </div>

          {/* Mock Pins Scattered on CSS Grid */}
          {filteredReports.map((report) => {
            const dLat = report.lat - defaultCenter.lat;
            const dLng = report.lng - defaultCenter.lng;
            const topPct = 50 - dLat * 180;
            const leftPct = 50 + dLng * 180;

            let colorClass = 'bg-[#3A6BFF] box-glow-blue'; 
            if (report.tag === 'Unidentified') colorClass = 'bg-[#B06AFF] box-glow-purple';
            else if (report.tag === 'Aerial' || report.tag === 'Aerial Sighting') colorClass = 'bg-[#22B8C9] box-glow-cyan';
            else if (report.tag === 'Land' || report.tag === 'Land Sighting') colorClass = 'bg-[#22C97A] box-glow-green';
            else if (report.tag === 'Alert' || report.tag === 'High Activity') colorClass = 'bg-[#FF6B35] box-glow-orange';

            return (
              <button
                key={report.id}
                onClick={() => handleMockPinClick(report)}
                className={`absolute w-4 h-4 rounded-full border-2 border-aura-card z-10 transition-transform active:scale-125 cursor-pointer ${colorClass}`}
                style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                title={report.title}
              >
                <span className="absolute -inset-2 rounded-full border border-current opacity-30 animate-ping"></span>
              </button>
            );
          })}

          {/* Map Loading Info Overlay */}
          {!googleMapsError && (
            <div className="absolute top-16 right-4 flex items-center gap-1 bg-aura-deep border border-aura-border py-1 px-2.5 rounded-md font-mono text-[9px] text-aura-muted animate-pulse">
              <RefreshCw className="w-2.5 h-2.5 animate-spin text-aura-blue" /> Initializing Google Maps...
            </div>
          )}

          {googleMapsError && (
            <div className="absolute bottom-4 left-4 right-4 bg-aura-deep border border-aura-orange/40 rounded-lg p-2.5 z-20 text-[10px] text-aura-orange font-mono leading-relaxed text-center">
              ⚠️ Google Maps API Key offline/missing. Operating in Simulated Local Archive Mode.
            </div>
          )}
        </div>
      ) : (
        /* Real Google Map Container */
        <div ref={mapRef} className="w-full h-full relative"></div>
      )}

      {/* Floating Center Button */}
      <button
        id="map-center-on-me"
        onClick={handleCenter}
        className="absolute bottom-4 right-4 z-20 w-10 h-10 rounded-full bg-aura-card border border-aura-border hover:border-aura-blue hover:text-aura-blue text-aura-text flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
        title="Center on Roswell Ground Zero"
      >
        <Compass className="w-5 h-5" />
      </button>

      {/* Selected Sighting Popup Detail Card Overlay (over the Map canvas) */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className={`absolute bottom-4 left-4 ${isLaptopDimensions ? 'right-16 max-w-sm' : 'right-16'} bg-aura-card border border-aura-border rounded-xl p-4 z-20 shadow-2xl flex flex-col justify-between`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-aura-text text-sm">{selectedReport.title}</h4>
                <p className="text-[10px] font-mono text-aura-muted">
                  {selectedReport.lat.toFixed(4)}°, {selectedReport.lng.toFixed(4)}°
                </p>
              </div>
              
              {/* Tag Badges */}
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase ${
                selectedReport.tag === 'Unidentified' ? 'bg-aura-purple/15 text-aura-purple border border-aura-purple/30' :
                selectedReport.tag === 'Aerial' || selectedReport.tag === 'Aerial Sighting' ? 'bg-aura-cyan/15 text-aura-cyan border border-aura-cyan/30' :
                selectedReport.tag === 'Land' || selectedReport.tag === 'Land Sighting' ? 'bg-aura-green/15 text-aura-green border border-aura-green/30' :
                'bg-aura-orange/15 text-aura-orange border border-aura-orange/30'
              }`}>
                {selectedReport.tag}
              </span>
            </div>

            <p className="text-xs text-aura-text/90 leading-relaxed mb-3.5 line-clamp-3">
              {selectedReport.description}
            </p>

            <div className="flex justify-between items-center text-[10px] text-aura-muted border-t border-aura-border/50 pt-2 font-mono">
              <span>⌛ {selectedReport.time}</span>
              <span>📍 {selectedReport.distance}</span>
            </div>

            {/* Close button inside card */}
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-2 right-2 text-aura-muted hover:text-aura-text text-xs font-bold w-5 h-5 flex items-center justify-center hover:bg-aura-input rounded-full cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (isLaptopDimensions) {
    return (
      <div className="flex-1 flex flex-row h-full overflow-hidden bg-aura-deep">
        
        {/* Left Side: Sighting Archive List Pane */}
        <div className="w-[360px] border-r border-aura-border flex flex-col justify-between p-5 select-none bg-aura-card/10 select-none">
          <div className="flex flex-col flex-1 min-h-0">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-aura-text">Anomalous Archive</h2>
              <p className="text-xs text-aura-muted">Filter and trace user reports locally</p>
            </div>

            {/* Filter Buttons Grid */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {['All', 'Unidentified', 'Aerial', 'Land', 'Last 24h'].map(filter => (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setSelectedReport(null);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold tracking-wider uppercase border font-mono transition-all cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-aura-blue text-white border-aura-blue shadow-md'
                      : 'bg-aura-input text-aura-muted border-aura-border hover:text-aura-text'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Scrollable list of sightings */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1.5">
              {filteredReports.length === 0 ? (
                <div className="py-8 text-center text-xs text-aura-muted font-mono border border-dashed border-aura-border/60 rounded-lg">
                  No records matching search.
                </div>
              ) : (
                filteredReports.map(report => {
                  const isSelected = selectedReport && selectedReport.id === report.id;
                  
                  let borderHoverClass = 'hover:border-aura-blue/40';
                  if (report.tag === 'Unidentified') borderHoverClass = 'hover:border-aura-purple/40';
                  else if (report.tag === 'Aerial' || report.tag === 'Aerial Sighting') borderHoverClass = 'hover:border-aura-cyan/40';
                  else if (report.tag === 'Land' || report.tag === 'Land Sighting') borderHoverClass = 'hover:border-aura-green/40';
                  
                  let activeBorderClass = isSelected 
                    ? (report.tag === 'Unidentified' ? 'border-aura-purple shadow-[0_0_8px_rgba(176,106,255,0.15)] bg-aura-purple/5'
                       : report.tag === 'Aerial' || report.tag === 'Aerial Sighting' ? 'border-aura-cyan shadow-[0_0_8px_rgba(34,184,201,0.15)] bg-aura-cyan/5'
                       : report.tag === 'Land' || report.tag === 'Land Sighting' ? 'border-aura-green shadow-[0_0_8px_rgba(34,201,122,0.15)] bg-aura-green/5'
                       : 'border-aura-blue shadow-[0_0_8px_rgba(58,107,255,0.15)] bg-aura-blue/5')
                    : 'border-aura-border bg-aura-card/20';

                  return (
                    <button
                      key={report.id}
                      onClick={() => handleSelectReport(report)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 select-none ${activeBorderClass} ${borderHoverClass}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-xs text-aura-text line-clamp-1 flex-1 leading-tight">{report.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-semibold font-mono uppercase tracking-wider ${
                          report.tag === 'Unidentified' ? 'bg-aura-purple/15 text-aura-purple border border-aura-purple/20' :
                          report.tag === 'Aerial' || report.tag === 'Aerial Sighting' ? 'bg-aura-cyan/15 text-aura-cyan border border-aura-cyan/20' :
                          report.tag === 'Land' || report.tag === 'Land Sighting' ? 'bg-aura-green/15 text-aura-green border border-aura-green/20' :
                          'bg-aura-orange/15 text-aura-orange border border-aura-orange/20'
                        }`}>
                          {report.tag}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-aura-muted leading-relaxed line-clamp-2">
                        {report.description}
                      </p>

                      <div className="flex justify-between items-center text-[9px] text-aura-muted font-mono pt-1.5 border-t border-aura-border/20 mt-1">
                        <span>⌛ {report.time}</span>
                        <span>📍 {report.distance}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-aura-border/40 font-mono text-[9px] text-aura-muted flex justify-between">
            <span>MUTUAL_CONN: R-7A</span>
            <span>TOTAL_SIGS: {filteredReports.length}</span>
          </div>
        </div>

        {/* Right Side: Map */}
        <div className="flex-1 h-full p-6 flex flex-col justify-between overflow-hidden relative">
          <div className="flex-1 rounded-xl border border-aura-border overflow-hidden relative flex flex-col shadow-inner">
            {mapElement}
          </div>
        </div>

      </div>
    );
  }

  // Mobile layout
  return (
    <div className="flex-1 flex flex-col relative bg-aura-deep text-aura-text transition-colors duration-300">
      
      {/* Top Filter Chips */}
      <div className="absolute top-3 left-3 right-3 z-30 flex gap-1.5 overflow-x-auto pb-2 scrollbar-none select-none">
        {['All', 'Unidentified', 'Aerial', 'Land', 'Last 24h'].map(filter => (
          <button
            key={filter}
            onClick={() => {
              setActiveFilter(filter);
              setSelectedReport(null);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border font-mono cursor-pointer ${
              activeFilter === filter
                ? 'bg-aura-blue text-white border-aura-blue shadow-lg shadow-aura-blue/20'
                : 'bg-aura-card/85 backdrop-blur-md text-aura-muted border-aura-border hover:text-aura-text'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {mapElement}
    </div>
  );
}
