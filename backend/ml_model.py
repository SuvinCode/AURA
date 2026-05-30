import math
import random
import logging
import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline

logger = logging.getLogger("aura.ml")

# ── UAP Hotspots ──────────────────────────────────────────────────────────────
HOTSPOTS = [
    {"name": "Hessdalen Valley, Norway", "lat": 62.8500, "lng": 11.1833, "radius": 30.0},
    {"name": "Area 51 Exclusion Zone, NV", "lat": 37.2350, "lng": -115.8111, "radius": 80.0},
    {"name": "Yakima Valley, Washington", "lat": 46.6021, "lng": -120.5059, "radius": 50.0},
    {"name": "Sedona, Arizona", "lat": 34.8697, "lng": -111.7610, "radius": 40.0},
    {"name": "Roswell, New Mexico", "lat": 33.3943, "lng": -104.5230, "radius": 60.0},
    {"name": "Gulf of Mexico UAP Corridor", "lat": 25.0000, "lng": -90.0000, "radius": 300.0},
    {"name": "Skinwalker Ranch, Utah", "lat": 40.2555, "lng": -109.8928, "radius": 20.0},
    {"name": "McMinnville, Oregon", "lat": 45.2101, "lng": -123.1993, "radius": 40.0},
    {"name": "Rendlesham Forest, UK", "lat": 52.0911, "lng": 1.4395, "radius": 25.0},
    {"name": "Bermuda Triangle", "lat": 25.7617, "lng": -71.0000, "radius": 500.0},
    {"name": "Tokyo Airspace, Japan", "lat": 35.6762, "lng": 139.6503, "radius": 80.0},
    {"name": "Phoenix Metro, Arizona", "lat": 33.4484, "lng": -112.0740, "radius": 60.0},
    {"name": "Belgian Airspace", "lat": 50.8503, "lng": 4.3517, "radius": 100.0},
    {"name": "São Paulo, Brazil", "lat": -23.5505, "lng": -46.6333, "radius": 100.0}
]

# ── Behavior Modifiers (percentage boost) ─────────────────────────────────────
BEHAVIOR_MODIFIERS = {
    'Silent':          8.0,
    'Hovering':        12.0,
    'Disappeared':     15.0,
    'Instant Accel':   20.0,
    'Right-Angle Turn':25.0,
    'No Heat Sig':     18.0,
    'EM Interference': 22.0,
    'Underwater':      20.0,
    'Lights':          5.0,
    'Rotating':        8.0,
    'Fast-moving':     6.0,
    'Low Altitude':    4.0,
    'Multiple Witness':10.0,
}

# ── Helper to calculate distance ──────────────────────────────────────────────
def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def get_hotspot_features(lat: float, lng: float):
    min_dist = float("inf")
    in_hotspot = 0.0
    for spot in HOTSPOTS:
        dist = haversine_km(lat, lng, spot["lat"], spot["lng"])
        if dist < min_dist:
            min_dist = dist
        if dist <= spot["radius"]:
            in_hotspot = 1.0
    return min_dist, in_hotspot

# ── Templates for synthetic training data ─────────────────────────────────────
HIGH_ANOMALY_TEMPLATES = [
    "A silent glowing metallic disc hovered in the sky and shot away instantly at hypersonic speed.",
    "Observed a large triangle-shaped craft with glowing red lights on the corners making sharp right-angle turns.",
    "A cigar-shaped cylinder object appeared out of nowhere, hovered silently, then disappeared into the space domain.",
    "A bright glowing sphere or orb rotated silently and then dove into the ocean without a splash.",
    "A chevron-shaped object was seen moving silently at a low altitude, defying gravity with no visible propulsion.",
    "We saw a metallic saucer hovering over the field before it zipped away in an instant acceleration.",
    "Multiple witnesses reported an egg-shaped or oval object that caused EM interference, shutting down car engines.",
    "A tic-tac shaped anomalous object moved erratically at hypersonic speeds, showing no heat signature on thermal cameras.",
    "A strange teardrop-shaped object hovered silently over the reservoir before ascending at extreme speeds.",
    "A large diamond-shaped craft floated silently above the treetops before disappearing instantly."
]

MED_ANOMALY_TEMPLATES = [
    "Bright orange fireballs flying in formation across the night sky.",
    "A flickering light or point source was moving fast in a zigzag pattern.",
    "Saw a morphing changing object that appeared as a bright flash of light.",
    "Strange lights rotating in the sky above the hills, observed by multiple witnesses.",
    "A glowing sphere hovered briefly and then flew away at standard aircraft speed.",
    "Bright lights in a triangle formation moving slowly over the valley.",
    "Flickering lights flying at low altitude, making no sound.",
    "A strange bright light source that appeared briefly and was gone.",
    "An oval-shaped light pattern was seen hovering for several minutes.",
    "We saw a formation of glowing objects moving in a straight line."
]

LOW_ANOMALY_TEMPLATES = [
    "A commercial airplane flying high with flashing red and green navigation lights.",
    "A passenger jet airliner left a contrail as it flew at a steady speed and altitude.",
    "Saw a Starlink satellite train of lights moving in a straight line across the sky.",
    "A large weather balloon or kite was floating slowly in the wind.",
    "A small quadcopter drone was flying over the neighbor's backyard with buzzing propeller sounds.",
    "A person walking along the road next to a parked car and a utility truck.",
    "Flashing lights from a standard helicopter flying low over the city.",
    "A flock of birds flying north in a V-formation.",
    "A bright star or planet like Venus shining steadily in the evening sky.",
    "A standard military aircraft taking off from the local base with loud engine noise."
]

# ── Predictor Singleton Class ──────────────────────────────────────────────────
class UAPConfidencePredictor:
    def __init__(self):
        self.pipeline = None

    def generate_training_data(self):
        data = []
        # Seed generator for reproducibility
        rng = random.Random(42)

        # 1. High anomaly
        for _ in range(250):
            template = rng.choice(HIGH_ANOMALY_TEMPLATES)
            base_score = rng.uniform(80.0, 96.0)
            
            # Select a random hotspot and put coordinates inside it
            spot = rng.choice(HOTSPOTS)
            # Offset lat/lng slightly inside radius
            angle = rng.uniform(0, 2 * math.pi)
            dist_km = rng.uniform(0, spot["radius"] * 0.8)
            lat_offset = (dist_km / 111.0) * math.sin(angle)
            lng_offset = (dist_km / (111.0 * math.cos(math.radians(spot["lat"])))) * math.cos(angle)
            lat = spot["lat"] + lat_offset
            lng = spot["lng"] + lng_offset
            
            # Behaviors
            behavs = rng.sample(list(BEHAVIOR_MODIFIERS.keys()), rng.randint(2, 4))
            behaviors_str = " ".join([b.replace(" ", "_") for b in behavs])
            
            # Calculate target
            min_dist, in_hotspot = get_hotspot_features(lat, lng)
            score = base_score + sum(BEHAVIOR_MODIFIERS[b] for b in behavs)
            if in_hotspot:
                score += 15.0
            
            # Add noise and clamp
            score = max(0.0, min(100.0, score + rng.gauss(0, 2)))
            
            data.append({
                "description": template,
                "behaviors_str": behaviors_str,
                "type": "Aerial",
                "lat": lat,
                "lng": lng,
                "hotspot_dist": min_dist,
                "in_hotspot": in_hotspot,
                "target_score": score
            })

        # 2. Medium anomaly
        for _ in range(250):
            template = rng.choice(MED_ANOMALY_TEMPLATES)
            base_score = rng.uniform(50.0, 75.0)
            
            # Coordinates slightly outside or edge of hotspots
            spot = rng.choice(HOTSPOTS)
            angle = rng.uniform(0, 2 * math.pi)
            dist_km = rng.uniform(spot["radius"] * 0.9, spot["radius"] * 2.0)
            lat_offset = (dist_km / 111.0) * math.sin(angle)
            lng_offset = (dist_km / (111.0 * math.cos(math.radians(spot["lat"])))) * math.cos(angle)
            lat = spot["lat"] + lat_offset
            lng = spot["lng"] + lng_offset
            
            # Behaviors
            med_behavs = ["Lights", "Rotating", "Fast-moving", "Low Altitude", "Multiple Witness"]
            behavs = rng.sample(med_behavs, rng.randint(1, 3))
            behaviors_str = " ".join([b.replace(" ", "_") for b in behavs])
            
            # Calculate target
            min_dist, in_hotspot = get_hotspot_features(lat, lng)
            score = base_score + sum(BEHAVIOR_MODIFIERS[b] for b in behavs)
            if in_hotspot:
                score += 15.0
            
            # Add noise and clamp
            score = max(0.0, min(100.0, score + rng.gauss(0, 3)))
            
            data.append({
                "description": template,
                "behaviors_str": behaviors_str,
                "type": "Aerial" if rng.random() > 0.1 else "Land",
                "lat": lat,
                "lng": lng,
                "hotspot_dist": min_dist,
                "in_hotspot": in_hotspot,
                "target_score": score
            })

        # 3. Low anomaly
        for _ in range(250):
            template = rng.choice(LOW_ANOMALY_TEMPLATES)
            base_score = rng.uniform(1.0, 25.0)
            
            # Coordinates far from any hotspot (e.g. middle of nowhere or a random spot far away)
            # Standard latitude/longitude that doesn't trigger hotspots
            lat = rng.uniform(-10.0, 20.0)
            lng = rng.uniform(-40.0, -10.0)
            
            # Behaviors (usually none or very simple)
            behavs = rng.sample(["Lights", "Low Altitude"], rng.randint(0, 1))
            behaviors_str = " ".join([b.replace(" ", "_") for b in behavs])
            
            # Calculate target
            min_dist, in_hotspot = get_hotspot_features(lat, lng)
            score = base_score + sum(BEHAVIOR_MODIFIERS[b] for b in behavs)
            if in_hotspot:
                score += 15.0
                
            # Add noise and clamp
            score = max(0.0, min(100.0, score + rng.gauss(0, 2)))
            
            data.append({
                "description": template,
                "behaviors_str": behaviors_str,
                "type": "Aerial" if rng.random() > 0.4 else "Land",
                "lat": lat,
                "lng": lng,
                "hotspot_dist": min_dist,
                "in_hotspot": in_hotspot,
                "target_score": score
            })

        return pd.DataFrame(data)

    def train(self):
        logger.info("Initializing synthetic training data generation...")
        df = self.generate_training_data()
        
        X = df[["description", "behaviors_str", "type", "hotspot_dist", "in_hotspot"]]
        y = df["target_score"]
        
        # Build Preprocessing pipeline
        preprocessor = ColumnTransformer(
            transformers=[
                ("desc_tfidf", TfidfVectorizer(max_features=250, stop_words="english"), "description"),
                ("behaviors_count", CountVectorizer(binary=True, token_pattern=r"(?u)\b\w+\b"), "behaviors_str"),
                ("type_ohe", OneHotEncoder(handle_unknown="ignore"), ["type"]),
                ("num_scaler", StandardScaler(), ["hotspot_dist", "in_hotspot"])
            ]
        )
        
        self.pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("regressor", RandomForestRegressor(n_estimators=100, random_state=42))
        ])
        
        logger.info("Fitting RandomForestRegressor model on synthetic dataset...")
        self.pipeline.fit(X, y)
        logger.info("✓ Model fitting complete.")

    def predict_uap_confidence(self, description: str, behaviors: list[str], type_str: str, lat: float, lng: float):
        if self.pipeline is None:
            logger.warning("Predictor not trained! Training model dynamically...")
            self.train()
            
        behaviors_str = " ".join([b.replace(" ", "_") for b in behaviors])
        min_dist, in_hotspot = get_hotspot_features(lat, lng)
        
        # Prepare inputs as DataFrame to match fit columns
        input_df = pd.DataFrame([{
            "description": description or "",
            "behaviors_str": behaviors_str,
            "type": type_str or "Aerial",
            "hotspot_dist": min_dist,
            "in_hotspot": in_hotspot
        }])
        
        pred_score = float(self.pipeline.predict(input_df)[0])
        # Clamp between 0.0 and 100.0
        pred_score = max(0.0, min(100.0, pred_score))
        
        # Determine verdict
        if pred_score >= 85.0:
            verdict = "ANOMALOUS — UAP SIGNATURE CONFIRMED"
        elif pred_score >= 60.0:
            verdict = "SUSPICIOUS — FURTHER ANALYSIS REQUIRED"
        elif pred_score >= 30.0:
            verdict = "LOW RISK — POSSIBLE KNOWN OBJECT"
        else:
            verdict = "IDENTIFIED — KNOWN OBJECT CLASS"
            
        return round(pred_score, 1), verdict

# Singleton instance
predictor = UAPConfidencePredictor()
