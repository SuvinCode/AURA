import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import { getMe, getReports, submitReport as apiSubmitReport, normaliseApiReport } from './api';

const INITIAL_REPORTS = [
  {
    id: 1,
    title: "Roswell Incident (1947)",
    description: "Highly classified metallic disc-shaped wreckage recovered at a ranch near Roswell, NM. RAAF press release confirmed recovery of a 'flying disc' before official retraction.",
    type: "Aerial",
    tag: "Unidentified",
    distance: "1.2 km away",
    time: "July 1947",
    lat: 33.3943,
    lng: -104.5230,
    behaviors: ["Silent", "Lights", "Disappeared"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><circle cx="50" cy="50" r="35" stroke="%23B06AFF" stroke-width="1" fill="none" opacity="0.3"/><line x1="50" y1="10" x2="50" y2="90" stroke="%23B06AFF" stroke-dasharray="2" opacity="0.2"/><line x1="10" y1="50" x2="90" y2="50" stroke="%23B06AFF" stroke-dasharray="2" opacity="0.2"/><circle cx="50" cy="50" r="6" fill="%23B06AFF"/><circle cx="50" cy="50" r="14" stroke="%23B06AFF" stroke-width="1" fill="none" opacity="0.5"/></svg>'
  },
  {
    id: 2,
    title: "Phoenix Lights (1997)",
    description: "A massive, silent V-shaped aircraft housing five intense spherical lights cruised slowly over the Phoenix metro area. Witnessed by thousands of residents.",
    type: "Aerial",
    tag: "Unidentified",
    distance: "512.4 km away",
    time: "March 1997",
    lat: 33.4484,
    lng: -112.0740,
    behaviors: ["Hovering", "Silent", "Lights"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><path d="M50 30 L30 70 M50 30 L70 70" stroke="%233a6bff" stroke-width="1" fill="none" opacity="0.4"/><circle cx="50" cy="30" r="3" fill="%23ff8c00"/><circle cx="40" cy="50" r="3" fill="%23ff8c00"/><circle cx="60" cy="50" r="3" fill="%23ff8c00"/><circle cx="30" cy="70" r="3" fill="%23ff8c00"/><circle cx="70" cy="70" r="3" fill="%23ff8c00"/></svg>'
  },
  {
    id: 3,
    title: "Rendlesham Forest (1980)",
    description: "USAF personnel stationed at RAF Bentwaters observed a glowing, metallic triangular craft landing in Rendlesham Forest. Physical ground depressions and radiation spikes were verified.",
    type: "Land",
    tag: "Land",
    distance: "8400.1 km away",
    time: "December 1980",
    lat: 52.0911,
    lng: 1.4395,
    behaviors: ["Lights", "Silent"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><polygon points="50,20 25,75 75,75" stroke="%2322C97A" stroke-width="1.5" fill="none" opacity="0.5"/><circle cx="50" cy="50" r="4" fill="%2322C97A"/></svg>'
  },
  {
    id: 4,
    title: "Tehran Jet Chase (1976)",
    description: "An anomalous bright light disabled the instrumentation and weapons control systems of two Iranian F-4 fighter jets attempting intercept maneuvers over Tehran.",
    type: "Aerial",
    tag: "Alert",
    distance: "11200.5 km away",
    time: "September 1976",
    lat: 35.6892,
    lng: 51.3890,
    behaviors: ["Fast-moving", "Lights", "Disappeared"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><circle cx="50" cy="50" r="30" stroke="%23ff3e3e" stroke-width="1" fill="none" stroke-dasharray="4 2"/><circle cx="50" cy="50" r="6" fill="%23ff3e3e"/><line x1="20" y1="50" x2="80" y2="50" stroke="%23ff3e3e" opacity="0.4"/><line x1="50" y1="20" x2="50" y2="80" stroke="%23ff3e3e" opacity="0.4"/></svg>'
  },
  {
    id: 5,
    title: "Westall Landing (1966)",
    description: "Over 200 students and staff at Westall High School witnessed three metallic saucers hover silently over nearby fields before landing in a pine paddock.",
    type: "Land",
    tag: "Land",
    distance: "14050.2 km away",
    time: "April 1966",
    lat: -37.9863,
    lng: 145.1481,
    behaviors: ["Hovering", "Silent", "Disappeared"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><ellipse cx="50" cy="50" rx="35" ry="12" stroke="%2322C97A" stroke-width="1.5" fill="none" opacity="0.6"/><circle cx="50" cy="46" r="4" fill="%2322C97A"/></svg>'
  },
  {
    id: 6,
    title: "Chicago O'Hare Saucer (2006)",
    description: "United Airlines pilots and ramp staff reported a dark-grey metallic craft hovering over Gate C17 at O'Hare Airport. The craft shot straight upward, punching a circular hole in the clouds.",
    type: "Aerial",
    tag: "Aerial",
    distance: "1850.3 km away",
    time: "November 2006",
    lat: 41.9742,
    lng: -87.9073,
    behaviors: ["Fast-moving", "Hovering", "Silent"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><ellipse cx="50" cy="50" rx="25" ry="8" stroke="%2322B8C9" stroke-width="1.5" fill="none"/><line x1="50" y1="50" x2="50" y2="15" stroke="%2322B8C9" stroke-width="1" stroke-dasharray="3 3"/></svg>'
  },
  {
    id: 7,
    title: "Belgian Triangle Wave (1989)",
    description: "A wave of massive triangular objects tracking across Belgium, confirmed by ground observers, military radar, and chased by Air Force F-16 interceptors.",
    type: "Aerial",
    tag: "Alert",
    distance: "8200.7 km away",
    time: "November 1989",
    lat: 50.8503,
    lng: 4.3517,
    behaviors: ["Fast-moving", "Silent", "Rotating", "Lights"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><polygon points="50,30 25,70 75,70" stroke="%23FF6B35" stroke-width="1.5" fill="none"/><circle cx="50" cy="40" r="3" fill="%23ff3e3e"/><circle cx="35" cy="65" r="3" fill="%23ff3e3e"/><circle cx="65" cy="65" r="3" fill="%23ff3e3e"/></svg>'
  },
  {
    id: 8,
    title: "Shag Harbour Crash (1967)",
    description: "A large glowing dome crashed into the waters of Shag Harbour, Nova Scotia. RCMP and local fishermen watched the craft float and glow before it submerged.",
    type: "Land",
    tag: "Land",
    distance: "3200.4 km away",
    time: "October 1967",
    lat: 43.5008,
    lng: -65.7163,
    behaviors: ["Lights", "Disappeared"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><path d="M20 60 Q50 30 80 60 Z" stroke="%2322C97A" stroke-width="1.5" fill="none"/><line x1="15" y1="65" x2="85" y2="65" stroke="%2322C97A" opacity="0.5"/></svg>'
  },
  {
    id: 9,
    title: "Lubbock Lights (1951)",
    description: "A V-shaped cluster of 20-30 glowing blue-green spherical lights photographed by Texas Tech professors as they zipped across Lubbock skies at hypersonic speeds.",
    type: "Aerial",
    tag: "Aerial",
    distance: "290.1 km away",
    time: "August 1951",
    lat: 33.5779,
    lng: -101.8552,
    behaviors: ["Fast-moving", "Lights"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><circle cx="30" cy="40" r="3" fill="%2322B8C9"/><circle cx="40" cy="50" r="3" fill="%2322B8C9"/><circle cx="50" cy="60" r="3" fill="%2322B8C9"/><circle cx="60" cy="50" r="3" fill="%2322B8C9"/><circle cx="70" cy="40" r="3" fill="%2322B8C9"/></svg>'
  },
  {
    id: 10,
    title: "Kecksburg Acorn (1965)",
    description: "A large bronze/copper acorn-shaped object carrying alien hieroglyphs descended over Pennsylvania and crashed in Kecksburg woods. Immediately secured by the military.",
    type: "Land",
    tag: "Land",
    distance: "2300.9 km away",
    time: "December 1965",
    lat: 40.1873,
    lng: -79.4589,
    behaviors: ["Silent"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><path d="M40 30 Q50 15 60 30 Q70 55 50 80 Q30 55 40 30 Z" stroke="%2322C97A" stroke-width="1.5" fill="none"/></svg>'
  },
  {
    id: 11,
    title: "USS Nimitz Tic-Tac (2004)",
    description: "US Navy F/A-18 pilots intercepted a white, oblong object off the San Diego coast exhibiting instantaneous acceleration and trans-medium behaviour. Declassified FLIR footage confirmed. No known propulsion system.",
    type: "Aerial",
    tag: "Unidentified",
    distance: "14800.2 km away",
    time: "November 2004",
    lat: 32.5000,
    lng: -117.5000,
    behaviors: ["Fast-moving", "Hovering", "Disappeared", "No Heat Sig"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><ellipse cx="50" cy="50" rx="28" ry="13" stroke="%23B06AFF" stroke-width="1.5" fill="none"/><ellipse cx="50" cy="50" rx="10" ry="5" fill="%23B06AFF" opacity="0.6"/><line x1="22" y1="50" x2="5" y2="50" stroke="%23B06AFF" stroke-dasharray="3 3" opacity="0.5"/><line x1="78" y1="50" x2="95" y2="50" stroke="%23B06AFF" stroke-dasharray="3 3" opacity="0.5"/></svg>'
  },
  {
    id: 12,
    title: "JAL Flight 1628 (1986)",
    description: "Japan Air Lines Boeing 747 crew reported a massive craft — two times the size of an aircraft carrier — pacing them over Alaska for 50 minutes. FAA radar corroborated the encounter.",
    type: "Aerial",
    tag: "Alert",
    distance: "8600.0 km away",
    time: "November 1986",
    lat: 61.2181,
    lng: -154.4931,
    behaviors: ["Hovering", "Lights", "Fast-moving"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><circle cx="50" cy="50" r="22" stroke="%23FF6B35" stroke-width="1.5" fill="none"/><circle cx="50" cy="50" r="8" fill="%23FF6B35" opacity="0.7"/><circle cx="50" cy="50" r="32" stroke="%23FF6B35" stroke-width="0.5" stroke-dasharray="4 4" fill="none" opacity="0.3"/></svg>'
  },
  {
    id: 13,
    title: "Stephenville Lights (2008)",
    description: "Dozens of witnesses including a local pilot reported a massive silent craft a mile wide emitting intense white strobes over Stephenville, Texas. Military radar data later confirmed unknown objects.",
    type: "Aerial",
    tag: "Unidentified",
    distance: "1640.5 km away",
    time: "January 2008",
    lat: 32.2209,
    lng: -98.2025,
    behaviors: ["Silent", "Lights", "Hovering"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><line x1="20" y1="50" x2="80" y2="50" stroke="%23B06AFF" stroke-width="1.5"/><circle cx="20" cy="50" r="4" fill="%23fff" opacity="0.9"/><circle cx="35" cy="50" r="4" fill="%23fff" opacity="0.9"/><circle cx="50" cy="50" r="5" fill="%23B06AFF" opacity="0.95"/><circle cx="65" cy="50" r="4" fill="%23fff" opacity="0.9"/><circle cx="80" cy="50" r="4" fill="%23fff" opacity="0.9"/></svg>'
  },
  {
    id: 14,
    title: "Coyne Helicopter (1973)",
    description: "US Army Reserve helicopter crew experienced full loss of controls near Mansfield, Ohio when a grey metallic cigar-shaped craft locked onto their aircraft with a green beam, pulling them from 1700 ft to 3500 ft in seconds.",
    type: "Aerial",
    tag: "Aerial Sighting",
    distance: "2050.3 km away",
    time: "October 1973",
    lat: 40.7989,
    lng: -82.5151,
    behaviors: ["Fast-moving", "Lights", "EM Interference"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><rect x="22" y="44" width="56" height="12" rx="6" stroke="%2322B8C9" stroke-width="1.5" fill="none"/><line x1="50" y1="44" x2="50" y2="25" stroke="%2322B8C9" stroke-width="1" stroke-dasharray="3 2" opacity="0.6"/></svg>'
  },
  {
    id: 15,
    title: "Trans-en-Provence (1981)",
    description: "A French farmer witnessed a lead-grey craft land on his property in Provence. GEPAN (French government agency) collected physical evidence: scorched earth, broken branches, and residue confirmed by lab analysis.",
    type: "Land",
    tag: "Land Sighting",
    distance: "8750.1 km away",
    time: "January 1981",
    lat: 43.6260,
    lng: 6.1780,
    behaviors: ["Silent", "Hovering", "Disappeared"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><ellipse cx="50" cy="48" rx="22" ry="9" stroke="%2322C97A" stroke-width="1.5" fill="none"/><ellipse cx="50" cy="45" rx="10" ry="6" stroke="%2322C97A" stroke-width="1" fill="none" opacity="0.5"/><line x1="28" y1="57" x2="72" y2="57" stroke="%2322C97A" stroke-width="1" opacity="0.4"/></svg>'
  },
  {
    id: 16,
    title: "Lonnie Zamora (1964)",
    description: "New Mexico State Police officer Lonnie Zamora witnessed a white egg-shaped craft with red insignia land in a desert arroyo near Socorro. Landing struts and burnt vegetation were catalogued by FBI and Air Force investigators.",
    type: "Land",
    tag: "Land Sighting",
    distance: "85.4 km away",
    time: "April 1964",
    lat: 34.0489,
    lng: -106.8914,
    behaviors: ["Silent", "Disappeared", "Lights"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><ellipse cx="50" cy="46" rx="18" ry="12" stroke="%2322C97A" stroke-width="1.5" fill="none"/><line x1="38" y1="58" x2="34" y2="70" stroke="%2322C97A" stroke-width="1.5"/><line x1="50" y1="58" x2="50" y2="70" stroke="%2322C97A" stroke-width="1.5"/><line x1="62" y1="58" x2="66" y2="70" stroke="%2322C97A" stroke-width="1.5"/><text x="50" y="44" font-size="8" fill="%2322C97A" text-anchor="middle" font-family="monospace" opacity="0.9">⊕</text></svg>'
  },
  {
    id: 17,
    title: "Frederick Valentich (1978)",
    description: "Australian pilot Frederick Valentich reported being intercepted by a long metallic craft with green lights over Bass Strait. His final transmission was a loud metallic scraping sound. Neither the pilot nor the Cessna 182L were ever found.",
    type: "Aerial",
    tag: "Alert",
    distance: "13900.7 km away",
    time: "October 1978",
    lat: -38.6000,
    lng: 146.0000,
    behaviors: ["Lights", "Fast-moving", "Disappeared", "EM Interference"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><circle cx="50" cy="50" r="28" stroke="%23FF3E3E" stroke-width="1.5" fill="none" stroke-dasharray="5 3"/><line x1="50" y1="22" x2="50" y2="78" stroke="%23FF3E3E" opacity="0.3"/><line x1="22" y1="50" x2="78" y2="50" stroke="%23FF3E3E" opacity="0.3"/><text x="50" y="55" font-size="18" fill="%23FF3E3E" text-anchor="middle" opacity="0.8">?</text></svg>'
  },
  {
    id: 18,
    title: "Malmstrom AFB (1967)",
    description: "Ten Minuteman ICBMs at Malmstrom Air Force Base, Montana simultaneously went offline in sequence. A glowing red pulsating disc was reported hovering above Launch Facility Echo-Flight by security officers during the incident.",
    type: "Aerial",
    tag: "Alert",
    distance: "2900.2 km away",
    time: "March 1967",
    lat: 47.5049,
    lng: -111.1872,
    behaviors: ["Hovering", "Lights", "EM Interference", "Silent"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><circle cx="50" cy="50" r="20" fill="%23FF3E3E" opacity="0.2"/><circle cx="50" cy="50" r="20" stroke="%23FF3E3E" stroke-width="2" fill="none"/><circle cx="50" cy="50" r="6" fill="%23FF3E3E" opacity="0.9"/><circle cx="50" cy="50" r="30" stroke="%23FF3E3E" stroke-width="0.5" fill="none" opacity="0.3"/></svg>'
  },
  {
    id: 19,
    title: "Ariel School, Zimbabwe (1994)",
    description: "62 children at Ariel Primary School reported a silver disc landing in the schoolyard at recess. Beings with large eyes emerged and communicated telepathically. Harvard psychiatrist Dr. John Mack investigated and found the children credible.",
    type: "Land",
    tag: "Land Sighting",
    distance: "15700.4 km away",
    time: "September 1994",
    lat: -17.8292,
    lng: 31.0522,
    behaviors: ["Silent", "Hovering", "Disappeared"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><ellipse cx="50" cy="50" rx="25" ry="10" stroke="%2322C97A" stroke-width="1.5" fill="none"/><ellipse cx="50" cy="44" rx="12" ry="8" stroke="%2322C97A" stroke-width="1" fill="none" opacity="0.6"/><circle cx="50" cy="44" r="3" fill="%2322C97A" opacity="0.8"/></svg>'
  },
  {
    id: 20,
    title: "Kelly-Hopkinsville (1955)",
    description: "A family near Kelly, Kentucky was besieged for hours by small glowing beings from a landed craft. A dozen witnesses repeatedly fired at the entities, which were observed floating rather than walking. Law enforcement confirmed the testimony.",
    type: "Land",
    tag: "Land Sighting",
    distance: "1780.6 km away",
    time: "August 1955",
    lat: 36.8681,
    lng: -87.4886,
    behaviors: ["Lights", "Hovering"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><circle cx="30" cy="45" r="6" stroke="%2322C97A" stroke-width="1" fill="%2322C97A" opacity="0.3"/><circle cx="50" cy="42" r="6" stroke="%2322C97A" stroke-width="1" fill="%2322C97A" opacity="0.3"/><circle cx="70" cy="45" r="6" stroke="%2322C97A" stroke-width="1" fill="%2322C97A" opacity="0.3"/><line x1="25" y1="65" x2="75" y2="65" stroke="%2322C97A" stroke-width="1.5" opacity="0.5"/></svg>'
  },
  {
    id: 21,
    title: "GIMBAL UAP (2015)",
    description: "Declassified US Navy FLIR footage shows a rotating oblong craft defying the wind with no visible propulsion. The pilot's exclamation 'Look at that thing!' and 'It's rotating!' validated as authentic by the US DoD and AARO.",
    type: "Aerial",
    tag: "Unidentified",
    distance: "9400.1 km away",
    time: "January 2015",
    lat: 30.3322,
    lng: -81.6557,
    behaviors: ["Rotating", "Silent", "No Heat Sig", "Hovering"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><ellipse cx="50" cy="50" rx="22" ry="10" stroke="%23B06AFF" stroke-width="1.5" fill="none" transform="rotate(-15 50 50)"/><circle cx="50" cy="50" r="4" fill="%23B06AFF" opacity="0.8"/><path d="M40 38 Q50 28 60 38" stroke="%23B06AFF" stroke-width="1" fill="none" opacity="0.5"/><path d="M40 62 Q50 72 60 62" stroke="%23B06AFF" stroke-width="1" fill="none" opacity="0.5"/></svg>'
  },
  {
    id: 22,
    title: "Operation Prato, Brazil (1977)",
    description: "The Brazilian Air Force launched an official investigation after hundreds of residents in the Amazon reported being attacked nightly by powerful light beams from disc-shaped craft, causing burns and injuries. Operation Prato files declassified in 2009.",
    type: "Aerial",
    tag: "Alert",
    distance: "10500.8 km away",
    time: "October 1977",
    lat: -0.0000,
    lng: -51.0650,
    behaviors: ["Lights", "Hovering", "Multiple Witness"],
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230a0c16"/><ellipse cx="50" cy="44" rx="26" ry="10" stroke="%23FF6B35" stroke-width="1.5" fill="none"/><line x1="50" y1="54" x2="50" y2="80" stroke="%23FF6B35" stroke-width="2" opacity="0.7"/><line x1="38" y1="60" x2="50" y2="54" stroke="%23FF6B35" stroke-width="1" opacity="0.4"/><line x1="62" y1="60" x2="50" y2="54" stroke="%23FF6B35" stroke-width="1" opacity="0.4"/></svg>'
  }
];

// ── Tiny localStorage hook ────────────────────────────────────────────────────
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage full or unavailable — fail silently
    }
  }, [key, value]);

  return [value, setValue];
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [theme, setTheme]   = useLocalStorage('aura:theme', 'dark');
  const [user, setUser]     = useLocalStorage('aura:user', null);
  const [token, setToken]   = useLocalStorage('aura:token', null);

  // Reports from the API (authenticated crowd-sourced sightings)
  const [apiReports, setApiReports] = useState([]);
  // Reports submitted while anonymous (local only)
  const [localReports, setLocalReports] = useLocalStorage('aura:local-reports', []);

  const [draftReport, setDraftReport] = useState(null);

  // Combined reports: API first, then local anonymous, then seeded historical data
  const reports = [...apiReports, ...localReports, ...INITIAL_REPORTS];

  // Responsive state
  const [isWidescreen, setIsWidescreen] = useState(window.innerWidth >= 1024);

  // Track window resizing for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsWidescreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync body theme for desktop background fill
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme-bg');
    } else {
      document.body.classList.remove('light-theme-bg');
    }
  }, [theme]);

  // ── Restore session + fetch API reports on mount ──────────────────────────
  useEffect(() => {
    if (!token) return;
    // Validate token is still valid
    getMe(token)
      .then(u => setUser({ id: u.id, username: u.username, email: u.email }))
      .catch(() => { setToken(null); setUser(null); });
  }, []);

  // Fetch API reports whenever token changes
  useEffect(() => {
    if (!token) { setApiReports([]); return; }
    getReports()
      .then(data => setApiReports(data.map(normaliseApiReport)))
      .catch(() => setApiReports([]));
  }, [token]);

  // ── Auth handlers ──────────────────────────────────────────────────────────
  const handleSignIn = (userData, authToken) => {
    setUser(userData);
    setToken(authToken || null);
    setCurrentPage('dashboard');
  };

  const handleSignOut = () => {
    setUser(null);
    setToken(null);
    setApiReports([]);
    setDraftReport(null);
    setCurrentPage('landing');
  };

  // ── Report handlers ────────────────────────────────────────────────────────
  const handleSubmitReport = async (newReport) => {
    if (token) {
      try {
        await apiSubmitReport(token, newReport);
        // Refresh API reports so the new one shows immediately
        const data = await getReports();
        setApiReports(data.map(normaliseApiReport));
      } catch {
        // API failed — fall back to local
        setLocalReports(prev => [{ ...newReport, id: `local-${Date.now()}` }, ...prev]);
      }
    } else {
      setLocalReports(prev => [{ ...newReport, id: `local-${Date.now()}` }, ...prev]);
    }
  };

  const handleResetReports = () => {
    setLocalReports([]);
    if (token) {
      getReports()
        .then(data => setApiReports(data.map(normaliseApiReport)))
        .catch(() => setApiReports([]));
    }
  };

  const handleAutoReport = (draftData) => {
    setDraftReport(draftData); // Set draft data which triggers transition to 'report' tab
  };

  const handleClearDraft = () => {
    setDraftReport(null);
  };

  // Determine if the content should be rendered in laptop/desktop dimensions
  const isLaptopDimensions = isWidescreen;

  // Render Page Content based on Router State
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <Landing onNavigate={setCurrentPage} isLaptopDimensions={isLaptopDimensions} />;
      case 'signin':
        return <SignIn onNavigate={setCurrentPage} onSignIn={handleSignIn} isLaptopDimensions={isLaptopDimensions} theme={theme} />;
      case 'signup':
        return <SignUp onNavigate={setCurrentPage} onSignIn={handleSignIn} isLaptopDimensions={isLaptopDimensions} />;
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            reports={reports} 
            onSubmitReport={handleSubmitReport} 
            onResetReports={handleResetReports} 
            onSignOut={handleSignOut} 
            draftReport={draftReport}
            onAutoReport={handleAutoReport}
            onClearDraft={handleClearDraft}
            theme={theme}
            onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            isLaptopDimensions={isLaptopDimensions}
          />
        );
      default:
        return <Landing onNavigate={setCurrentPage} isLaptopDimensions={isLaptopDimensions} />;
    }
  };

  const appContent = (
    <div className={`w-full min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300 ${theme === 'light' ? 'light' : 'dark'} bg-aura-deep`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col"
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#030508] text-[#c8d8ff]' : 'bg-[#dde4ee] text-[#0f172a]'} flex flex-col font-sans antialiased transition-colors duration-300`}>
      {appContent}
    </div>
  );
}

