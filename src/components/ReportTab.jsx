import React, { useState, useEffect } from 'react';
import { Upload, Navigation, Info } from 'lucide-react';

const AVAILABLE_BEHAVIORS = [
  'Hovering',
  'Fast-moving',
  'Silent',
  'Lights',
  'Rotating',
  'Disappeared'
];

export default function ReportTab({ draftReport, onSubmitReport, onClearDraft, isLaptopDimensions }) {
  const [description, setDescription] = useState('');
  const [selectedBehaviors, setSelectedBehaviors] = useState([]);
  const [type, setType] = useState('Aerial'); // 'Aerial' | 'Land'
  const [locationStr, setLocationStr] = useState('-27.4698° S, 153.0251° E'); // Default mock Brisbane, Australia
  const [latLng, setLatLng] = useState({ lat: -27.4698, lng: 153.0251 });
  const [timestamp, setTimestamp] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Initialize form if prefilled from AI Scan draft
  useEffect(() => {
    if (draftReport) {
      setDescription(draftReport.description || '');
      setType(draftReport.type || 'Aerial');
      setSelectedBehaviors(draftReport.behaviors || []);
      // Keep standard Roswell mock location if coming from scanner
      setLocationStr('33.3943° N, 104.5230° W');
      setLatLng({ lat: 33.3943, lng: -104.5230 });
      onClearDraft(); // Clean up draft state in parent
    }
  }, [draftReport]);

  // Set default datetime to local timezone now on mount
  useEffect(() => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
    setTimestamp(localISOTime);
  }, []);

  const handleBehaviorToggle = (behavior) => {
    setSelectedBehaviors(prev =>
      prev.includes(behavior)
        ? prev.filter(b => b !== behavior)
        : [...prev, behavior]
    );
  };

  const handleUseMyLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatLng({ lat, lng });
          
          const latCard = lat >= 0 ? `${lat.toFixed(4)}° N` : `${Math.abs(lat).toFixed(4)}° S`;
          const lngCard = lng >= 0 ? `${lng.toFixed(4)}° E` : `${Math.abs(lng).toFixed(4)}° W`;
          setLocationStr(`${latCard}, ${lngCard}`);
        },
        (error) => {
          console.warn('Geolocation error, using default mock:', error.message);
          setLocationStr('33.3943° N, 104.5230° W');
          setLatLng({ lat: 33.3943, lng: -104.5230 });
        }
      );
    } else {
      setLocationStr('33.3943° N, 104.5230° W');
      setLatLng({ lat: 33.3943, lng: -104.5230 });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      const reportTitle = description.split(' ').slice(0, 3).join(' ') + ' Sighting';
      
      const newReport = {
        id: Date.now(),
        title: reportTitle.length > 28 ? reportTitle.slice(0,25) + '...' : reportTitle,
        description: description,
        type: type,
        tag: type === 'Aerial' ? (selectedBehaviors.includes('Hovering') ? 'Unidentified' : 'Aerial Sighting') : 'Land Sighting',
        distance: '0.0 km away',
        time: 'Just now',
        lat: latLng.lat,
        lng: latLng.lng,
        behaviors: selectedBehaviors,
        timestamp: timestamp
      };

      onSubmitReport(newReport);
      setSubmitting(false);
      
      // Reset form
      setDescription('');
      setSelectedBehaviors([]);
      setUploadFile(null);
    }, 1000);
  };

  // Input components/sections to layout adaptively
  const descriptionInput = (
    <div>
      <label className="block text-xs font-semibold text-aura-muted uppercase tracking-wider mb-2" htmlFor="sighting-desc">
        What did you see? <span className="text-red-500">*</span>
      </label>
      <textarea
        id="sighting-desc"
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={isLaptopDimensions ? 6 : 4}
        className="w-full px-3.5 py-2.5 rounded-lg bg-aura-input border border-aura-border text-aura-text placeholder-aura-muted/50 focus:outline-none focus:border-aura-blue transition-all text-sm leading-relaxed custom-scrollbar"
        placeholder="Describe the shape, colors, movement, and flight characteristics of the object..."
      />
    </div>
  );

  const typeToggle = (
    <div>
      <label className="block text-xs font-semibold text-aura-muted uppercase tracking-wider mb-2">
        Sighting Classification
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setType('Aerial')}
          className={`py-2.5 px-4 rounded-lg font-semibold text-xs border transition-all cursor-pointer ${
            type === 'Aerial'
              ? 'bg-aura-cyan/15 text-aura-cyan border-aura-cyan'
              : 'bg-aura-input border-aura-border text-aura-muted hover:text-aura-text'
          }`}
        >
          🛸 Aerial Sighting
        </button>
        <button
          type="button"
          onClick={() => setType('Land')}
          className={`py-2.5 px-4 rounded-lg font-semibold text-xs border transition-all cursor-pointer ${
            type === 'Land'
              ? 'bg-aura-green/15 text-aura-green border-aura-green'
              : 'bg-aura-input border-aura-border text-aura-muted hover:text-aura-text'
          }`}
        >
          🌲 Land Sighting
        </button>
      </div>
    </div>
  );

  const behaviorsInput = (
    <div>
      <label className="block text-xs font-semibold text-aura-muted uppercase tracking-wider mb-2">
        Observed Behaviours
      </label>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_BEHAVIORS.map(behavior => {
          const isSelected = selectedBehaviors.includes(behavior);
          return (
            <button
              key={behavior}
              type="button"
              onClick={() => handleBehaviorToggle(behavior)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-aura-purple/15 text-aura-purple border-aura-purple'
                  : 'bg-aura-input border-aura-border text-aura-muted hover:text-aura-text'
              }`}
            >
              {behavior}
            </button>
          );
        })}
      </div>
    </div>
  );

  const uploadInput = (
    <div>
      <label className="block text-xs font-semibold text-aura-muted uppercase tracking-wider mb-2">
        Upload Image / Evidence
      </label>
      <label className="flex flex-col items-center justify-center w-full h-24 rounded-lg border-2 border-dashed border-aura-border hover:border-aura-blue bg-aura-input transition-all cursor-pointer">
        <div className="flex flex-col items-center justify-center pt-4 pb-4">
          <Upload className="w-6 h-6 text-aura-muted mb-1.5" />
          <p className="text-xs text-aura-text font-semibold">
            {uploadFile ? uploadFile.name : 'Click to upload sighting photo'}
          </p>
          <p className="text-[10px] text-aura-muted mt-0.5">PNG, JPG or HEIC up to 10MB</p>
        </div>
        <input
          id="report-file-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );

  const locationInput = (
    <div>
      <label className="block text-xs font-semibold text-aura-muted uppercase tracking-wider mb-2">
        GPS Location Coordinates
      </label>
      <div className="flex gap-2">
        <div className="flex-1 px-3 py-2.5 rounded-lg bg-aura-input border border-aura-border text-aura-text font-mono text-xs flex items-center select-all">
          📍 {locationStr}
        </div>
        <button
          id="report-gps-button"
          type="button"
          onClick={handleUseMyLocation}
          className="px-3 rounded-lg border border-aura-border hover:border-aura-blue text-aura-text bg-aura-input flex items-center justify-center transition-all cursor-pointer"
          title="Use my location"
        >
          <Navigation className="w-4 h-4 text-aura-blue" />
        </button>
      </div>
    </div>
  );

  const timestampInput = (
    <div>
      <label className="block text-xs font-semibold text-aura-muted uppercase tracking-wider mb-2" htmlFor="sighting-time">
        Estimated Date & Time
      </label>
      <div className="relative">
        <input
          id="sighting-time"
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg bg-aura-input border border-aura-border text-aura-text font-mono text-xs focus:outline-none focus:border-aura-blue transition-all"
        />
      </div>
    </div>
  );

  const privacyNote = (
    <div className="flex items-start gap-2 text-[10px] text-aura-muted leading-relaxed pt-3 border-t border-aura-border/35 select-none">
      <Info className="w-3.5 h-3.5 text-aura-blue flex-shrink-0 mt-0.5" />
      <span>No account details required. Your IP address is masked, metadata is stripped, and the report is recorded anonymously by default in accordance with AURA archive protocols.</span>
    </div>
  );

  const submitButton = (
    <button
      id="report-submit"
      type="submit"
      disabled={submitting}
      className="w-full py-3 rounded-lg bg-aura-purple hover:bg-opacity-90 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-aura-purple/15 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
    >
      {submitting ? 'Transmitting Sighting...' : 'Submit Report Anonymously'}
    </button>
  );

  return (
    <div className="flex-1 flex flex-col p-6 bg-aura-deep text-aura-text overflow-y-auto custom-scrollbar select-none pb-24 transition-colors duration-300">
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-aura-text">Report Sighting</h2>
        <p className="text-xs text-aura-muted">Transmit telemetry sighting data securely into AURA archives.</p>
      </div>

      {isLaptopDimensions ? (
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-8 items-start">
            {/* Left Column: Core sighting information */}
            <div className="space-y-6">
              {descriptionInput}
              {typeToggle}
              {uploadInput}
            </div>

            {/* Right Column: Coordinates / Behaviors */}
            <div className="space-y-6">
              {behaviorsInput}
              {locationInput}
              {timestampInput}
            </div>
          </div>

          {/* Action Row */}
          <div className="space-y-4 mt-4 max-w-2xl mx-auto w-full text-center">
            {submitButton}
            {privacyNote}
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {descriptionInput}
          {typeToggle}
          {behaviorsInput}
          {uploadInput}
          {locationInput}
          {timestampInput}
          {submitButton}
          {privacyNote}
        </form>
      )}

    </div>
  );
}
