import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from 'lucide-react';

const ROSWELL = [33.3943, -104.523];

const TILE_DARK = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

const TILE_LIGHT = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

const tagColor = (tag) => {
  if (tag === 'Unidentified') return '#B06AFF';
  if (tag === 'Aerial' || tag === 'Aerial Sighting') return '#22B8C9';
  if (tag === 'Land' || tag === 'Land Sighting') return '#22C97A';
  if (tag === 'Alert' || tag === 'High Activity') return '#FF6B35';
  return '#3A6BFF';
};

const makeIcon = (tag, selected = false) => {
  const color = tagColor(tag);
  const size = selected ? 20 : 13;
  const pulse = selected
    ? `<div style="position:absolute;inset:-5px;border-radius:50%;background:${color};opacity:0.25;animation:aura-ping 1.4s cubic-bezier(0,0,0.2,1) infinite;"></div>`
    : '';
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      ${pulse}
      <div style="position:absolute;inset:0;border-radius:50%;background:${color};border:2.5px solid rgba(255,255,255,0.92);box-shadow:0 2px 8px ${color}80;"></div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// Injects the @keyframes rule once
function InjectPulseKeyframe() {
  useEffect(() => {
    const id = 'aura-ping-style';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `@keyframes aura-ping{75%,100%{transform:scale(2.2);opacity:0}}`;
      document.head.appendChild(s);
    }
  }, []);
  return null;
}

// Pans the map when a report is selected
function MapController({ selectedReport }) {
  const map = useMap();
  useEffect(() => {
    if (selectedReport) {
      map.panTo([selectedReport.lat, selectedReport.lng], { animate: true, duration: 0.4 });
    }
  }, [selectedReport?.id]);
  return null;
}

export default function MapTab({ reports, theme, isLaptopDimensions }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
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

  const tile = theme === 'dark' ? TILE_DARK : TILE_LIGHT;

  const mapElement = (
    <div className="absolute inset-0">
      <InjectPulseKeyframe />
      <MapContainer
        center={ROSWELL}
        zoom={5}
        zoomControl={false}
        attributionControl={true}
        className="absolute inset-0 w-full h-full"
        style={{ background: theme === 'dark' ? '#080C14' : '#e8eaed' }}
      >
        <TileLayer key={tile.url} url={tile.url} attribution={tile.attribution} />
        <MapController selectedReport={selectedReport} />

        {filteredReports.map(report => (
          <Marker
            key={report.id}
            position={[report.lat, report.lng]}
            icon={makeIcon(report.tag, selectedReport?.id === report.id)}
            eventHandlers={{ click: () => setSelectedReport(report) }}
          />
        ))}
      </MapContainer>

      {/* Selected sighting popup */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className={`absolute bottom-4 left-4 ${isLaptopDimensions ? 'right-16 max-w-sm' : 'right-4'} bg-aura-card border border-aura-border rounded-xl p-4 shadow-2xl flex flex-col`}
            style={{ zIndex: 1001 }}
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
              <div className="relative border border-aura-border bg-black/40 rounded-lg overflow-hidden h-28 mb-3 select-none">
                <img
                  src={selectedReport.image}
                  alt="Sighting"
                  className="absolute inset-0 w-full h-full object-cover scale-150 origin-center brightness-110 contrast-125"
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
              className="w-full py-2 bg-aura-blue text-white rounded-lg text-xs font-semibold font-mono tracking-wider transition-all hover:opacity-90 flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer shadow-md shadow-aura-blue/15"
            >
              <Navigation className="w-3.5 h-3.5" /> NAVIGATE IN GOOGLE MAPS
            </button>

            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-2 right-2 text-aura-muted hover:text-aura-text text-xs font-bold w-5 h-5 flex items-center justify-center hover:bg-aura-input rounded-full cursor-pointer"
              style={{ zIndex: 1002 }}
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

        {/* Left sidebar */}
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
                  const isSelected = selectedReport?.id === report.id;
                  const color = tagColor(report.tag);

                  return (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(isSelected ? null : report)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 select-none ${
                        isSelected
                          ? 'border-aura-border bg-aura-card/50 shadow-md'
                          : 'border-aura-border/40 bg-aura-card/10 hover:border-aura-border hover:bg-aura-card/30'
                      }`}
                      style={isSelected ? { borderColor: `${color}60`, boxShadow: `0 0 10px ${color}18` } : {}}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-xs text-aura-text line-clamp-1 flex-1 leading-tight">{report.title}</span>
                        <span
                          className="px-2 py-0.5 rounded text-[8px] font-semibold font-mono uppercase tracking-wider border"
                          style={{ color, borderColor: `${color}40`, background: `${color}18` }}
                        >
                          {report.tag}
                        </span>
                      </div>

                      <div className="flex gap-2.5 items-start">
                        {report.image && (
                          <div className="w-14 h-14 rounded-lg overflow-hidden border border-aura-border/50 bg-black flex-shrink-0">
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

        {/* Map */}
        <div className="flex-1 h-full p-6 overflow-hidden relative">
          <div className="w-full h-full rounded-xl border border-aura-border overflow-hidden relative shadow-inner">
            {mapElement}
          </div>
        </div>

      </div>
    );
  }

  // Mobile layout
  return (
    <div className="absolute inset-0 bg-aura-deep text-aura-text transition-colors duration-300">
      <div className="absolute top-3 left-3 right-3 z-[1000] flex gap-1.5 overflow-x-auto pb-2 scrollbar-none select-none">
        {['All', 'Unidentified', 'Aerial', 'Land', 'Last 24h'].map(filter => (
          <button
            key={filter}
            onClick={() => { setActiveFilter(filter); setSelectedReport(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border font-mono cursor-pointer ${
              activeFilter === filter
                ? 'bg-aura-blue text-white border-aura-blue shadow-lg shadow-aura-blue/20'
                : 'bg-aura-card/90 backdrop-blur-md text-aura-muted border-aura-border hover:text-aura-text'
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
