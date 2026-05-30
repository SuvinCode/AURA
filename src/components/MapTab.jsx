import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from 'lucide-react';

export default function MapTab({ reports, theme, isLaptopDimensions }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {}
      );
    }
  }, []);

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

  const handleNavigate = (report) => {
    const originParam = userLocation
      ? `&origin=${userLocation.lat},${userLocation.lng}`
      : '';
    const url = `https://www.google.com/maps/dir/?api=1${originParam}&destination=${report.lat},${report.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const mapElement = (
    <div className="absolute inset-0" style={{ minHeight: 300 }}>
      {/* CSS Grid Mock Map */}
      <div className="absolute inset-0 overflow-hidden bg-aura-card map-grid-bg flex flex-col items-center justify-center transition-colors duration-300">

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

        {(() => {
          if (filteredReports.length === 0) return null;

          const minLat = Math.min(...filteredReports.map(r => r.lat));
          const maxLat = Math.max(...filteredReports.map(r => r.lat));
          const minLng = Math.min(...filteredReports.map(r => r.lng));
          const maxLng = Math.max(...filteredReports.map(r => r.lng));
          const latRange = maxLat - minLat || 0.1;
          const lngRange = maxLng - minLng || 0.1;

          return filteredReports.map((report) => {
            const topPct = 85 - ((report.lat - minLat) / latRange) * 70;
            const leftPct = 15 + ((report.lng - minLng) / lngRange) * 70;

            let colorClass = 'bg-[#3A6BFF] box-glow-blue';
            if (report.tag === 'Unidentified') colorClass = 'bg-[#B06AFF] box-glow-purple';
            else if (report.tag === 'Aerial' || report.tag === 'Aerial Sighting') colorClass = 'bg-[#22B8C9] box-glow-cyan';
            else if (report.tag === 'Land' || report.tag === 'Land Sighting') colorClass = 'bg-[#22C97A] box-glow-green';
            else if (report.tag === 'Alert' || report.tag === 'High Activity') colorClass = 'bg-[#FF6B35] box-glow-orange';

            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`absolute w-4 h-4 rounded-full border-2 border-aura-card z-10 transition-transform active:scale-125 cursor-pointer ${colorClass}`}
                style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                title={report.title}
              >
                <span className="absolute -inset-2 rounded-full border border-current opacity-30 animate-ping"></span>
              </button>
            );
          });
        })()}
      </div>

      {/* Selected Sighting Popup */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className={`absolute bottom-4 left-4 ${isLaptopDimensions ? 'right-16 max-w-sm' : 'right-4'} bg-aura-card border border-aura-border rounded-xl p-4 z-20 shadow-2xl flex flex-col justify-between`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-aura-text text-sm">{selectedReport.title}</h4>
                <p className="text-[10px] font-mono text-aura-muted">
                  {selectedReport.lat.toFixed(4)}°, {selectedReport.lng.toFixed(4)}°
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase ${
                selectedReport.tag === 'Unidentified' ? 'bg-aura-purple/15 text-aura-purple border border-aura-purple/30' :
                selectedReport.tag === 'Aerial' || selectedReport.tag === 'Aerial Sighting' ? 'bg-aura-cyan/15 text-aura-cyan border border-aura-cyan/30' :
                selectedReport.tag === 'Land' || selectedReport.tag === 'Land Sighting' ? 'bg-aura-green/15 text-aura-green border border-aura-green/30' :
                'bg-aura-orange/15 text-aura-orange border border-aura-orange/30'
              }`}>
                {selectedReport.tag}
              </span>
            </div>

            {selectedReport.image && (
              <div className="relative border border-aura-border bg-black/40 rounded-lg overflow-hidden h-28 mb-3 flex flex-col justify-end p-1.5 select-none">
                <img
                  src={selectedReport.image}
                  alt="Sighting Zoomed"
                  className="absolute inset-0 w-full h-full object-cover scale-150 origin-center filter brightness-110 contrast-125"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="w-6 h-6 border border-dashed border-red-500/40 rounded-full"></div>
                  <div className="absolute w-8 h-px bg-red-500/20"></div>
                  <div className="absolute h-8 w-px bg-red-500/20"></div>
                </div>
                <div className="absolute top-1.5 left-1.5 bg-black/75 border border-aura-border/40 rounded px-1 py-0.5 text-[7px] font-mono text-aura-cyan z-10">
                  ZOOM: 4.0X
                </div>
              </div>
            )}

            <p className="text-xs text-aura-text/90 leading-relaxed mb-3.5 line-clamp-3">
              {selectedReport.description}
            </p>

            <div className="flex justify-between items-center text-[10px] text-aura-muted border-t border-aura-border/50 pt-2 font-mono mb-2.5">
              <span>⌛ {selectedReport.time}</span>
              <span>📍 {selectedReport.distance}</span>
            </div>

            <button
              onClick={() => handleNavigate(selectedReport)}
              className="w-full py-2 bg-aura-blue text-white rounded-lg text-xs font-semibold font-mono tracking-wider transition-all hover:bg-opacity-95 flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer shadow-md shadow-aura-blue/15"
            >
              <Navigation className="w-3.5 h-3.5" /> NAVIGATE IN GOOGLE MAPS
            </button>

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
        <div className="w-[360px] border-r border-aura-border flex flex-col justify-between p-5 select-none bg-aura-card/10">
          <div className="flex flex-col flex-1 min-h-0">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-aura-text">Anomalous Archive</h2>
              <p className="text-xs text-aura-muted">Filter and trace user reports locally</p>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {['All', 'Unidentified', 'Aerial', 'Land', 'Last 24h'].map(filter => (
                <button
                  key={filter}
                  onClick={() => { setActiveFilter(filter); setSelectedReport(null); }}
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

                  const activeBorderClass = isSelected
                    ? (report.tag === 'Unidentified' ? 'border-aura-purple shadow-[0_0_8px_rgba(176,106,255,0.15)] bg-aura-purple/5'
                      : report.tag === 'Aerial' || report.tag === 'Aerial Sighting' ? 'border-aura-cyan shadow-[0_0_8px_rgba(34,184,201,0.15)] bg-aura-cyan/5'
                      : report.tag === 'Land' || report.tag === 'Land Sighting' ? 'border-aura-green shadow-[0_0_8px_rgba(34,201,122,0.15)] bg-aura-green/5'
                      : 'border-aura-blue shadow-[0_0_8px_rgba(58,107,255,0.15)] bg-aura-blue/5')
                    : 'border-aura-border bg-aura-card/20';

                  return (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
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

                      <div className="flex gap-2.5 items-start">
                        {report.image && (
                          <div className="w-14 h-14 rounded-lg overflow-hidden border border-aura-border/50 bg-black flex-shrink-0 relative">
                            <img src={report.image} alt="Thumbnail" className="w-full h-full object-cover scale-125" />
                          </div>
                        )}
                        <p className="text-[11px] text-aura-muted leading-relaxed line-clamp-2 flex-1">
                          {report.description}
                        </p>
                      </div>

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
    <div className="absolute inset-0 bg-aura-deep text-aura-text transition-colors duration-300">

      <div className="absolute top-3 left-3 right-3 z-30 flex gap-1.5 overflow-x-auto pb-2 scrollbar-none select-none">
        {['All', 'Unidentified', 'Aerial', 'Land', 'Last 24h'].map(filter => (
          <button
            key={filter}
            onClick={() => { setActiveFilter(filter); setSelectedReport(null); }}
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
