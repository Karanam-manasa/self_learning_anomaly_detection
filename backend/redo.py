# redo.py
import os
import numpy as np
import joblib
from keras.models import load_model
import pandas as pd
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# =========================
# Load trained models
# =========================

SCALER_PATH = os.path.join(BASE_DIR, "models/scaler.pkl")
IF_PATH = os.path.join(BASE_DIR, "models/isolation_forest.pkl")
THRESHOLD_PATH = os.path.join(BASE_DIR, "models/best_threshold.pkl")
AE_PATH = os.path.join(BASE_DIR, "models/autoencoder.h5")

scaler = joblib.load(SCALER_PATH)
if_model = joblib.load(IF_PATH)
best_threshold = joblib.load(THRESHOLD_PATH)

autoencoder = load_model(AE_PATH, compile=False)

# =========================
# Feature order (VERY IMPORTANT)
# From your notebook
# =========================
 
FEATURE_ORDER = [
    "temperature",
    "vibration",
    "humidity",
    "pressure",
    "energy_consumption",
    "machine_status",
    "machine_id"
]
 
# =========================
# Normalization Constants
# =========================
# IMPORTANT: Replace these placeholder values with the actual min/max
# values for the autoencoder error and isolation forest scores from your
# training notebook. These are calculated on your test dataset.
# e.g., AE_MIN = mse_test.min()
 
# Min/Max for Autoencoder Reconstruction Error
AE_MIN =5.9586908420749224e-08
AE_MAX =0.13758363027109913
 
# Min/Max for Isolation Forest Score
# Note: Use the raw scores from decision_function, not the negated ones.
IF_MIN = -0.1517345152985609
IF_MAX = 0.1215428716756013

EXPLANATION_GUIDE = {
    "temperature": {
        "reason": "Anomalous temperature reading detected.",
        "actions": [
            "Check for cooling system malfunctions (e.g., blocked vents, fan failure).",
            "Inspect for signs of overheating on machine components.",
            "Verify the ambient room temperature is within the expected range."
        ]
    },
    "vibration": {
        "reason": "Excessive or unusual vibration patterns detected.",
        "actions": [
            "Inspect machine bearings for wear, damage, or lack of lubrication.",
            "Check for loose components, bolts, or mountings.",
            "Verify machine balance and alignment."
        ]
    },
    "humidity": {
        "reason": "Humidity levels are outside the normal operating range.",
        "actions": [
            "Check for leaks or moisture ingress in the machine's environment.",
            "Ensure the facility's HVAC system is functioning correctly.",
            "Inspect seals and enclosures for degradation."
        ]
    },
    "pressure": {
        "reason": "Anomalous pressure levels detected.",
        "actions": [
            "Check for blockages or leaks in hydraulic or pneumatic lines.",
            "Inspect pressure relief valves for correct operation.",
            "Calibrate pressure sensors to ensure accurate readings."
        ]
    },
    "energy_consumption": {
        "reason": "Unusual energy consumption pattern detected.",
        "actions": [
            "Investigate for a potential short circuit or electrical fault.",
            "Check for increased mechanical friction or a seized component.",
            "Review recent changes in machine operation or load."
        ]
    },
    "machine_status": {
        "reason": "Machine is operating in an unexpected state (e.g., recovering, offline).",
        "actions": [
            "Verify the machine's operational mode is intentional.",
            "Check system logs for errors corresponding to the status change."
        ]
    },
    "default": {
        "reason": "A complex anomaly was detected across multiple sensors.",
        "actions": [
            "A holistic review of all sensor data is recommended.",
            "Cross-reference with recent maintenance logs or operational changes."
        ]
    }
}

def detect_anomalies_batch(df):
    """
    Detects anomalies for a DataFrame of sensor readings.
    """
    # Ensure correct feature order
    features_df = df[FEATURE_ORDER]
    
    # Scale features
    x_scaled = scaler.transform(features_df)
    
    # --- Get Raw Scores ---
    # 1. Autoencoder reconstruction error
    recon = autoencoder.predict(x_scaled, verbose=0)
    ae_error = np.mean(np.square(x_scaled - recon), axis=1)
    
    # 2. Isolation Forest score
    if_score_raw = if_model.decision_function(x_scaled)
    
    # --- Score Normalization ---
    ae_norm = (ae_error - AE_MIN) / (AE_MAX - AE_MIN)
    ae_norm = np.clip(ae_norm, 0, 1)
    
    if_norm = 1 - ((if_score_raw - IF_MIN) / (IF_MAX - IF_MIN))
    if_norm = np.clip(if_norm, 0, 1)
    
    # --- Ensemble Score ---
    ensemble_score = (ae_norm + if_norm) / 2
    
    anomalies = ensemble_score >= best_threshold
    
    return {
        "autoencoder_error": ae_error,
        "isolation_forest_score": if_score_raw,
        "ensemble_score": ensemble_score,
        "is_anomaly": anomalies
    }
# =========================
# Anomaly Detection Function
# =========================
 
def detect_anomaly(sensor_dict):
    """
    Detects anomalies using a normalized ensemble score, matching the logic
    from the original Colab notebook.
    """
 
    # Convert dict → ordered array
   

    features_df = pd.DataFrame([{
        "temperature": sensor_dict["temperature"],
        "vibration": sensor_dict["vibration"],
        "humidity": sensor_dict["humidity"],
        "pressure": sensor_dict["pressure"],
        "energy_consumption": sensor_dict["energy_consumption"],
        "machine_status": sensor_dict["machine_status"],
        "machine_id": sensor_dict["machine_id"],
    }])

    x_scaled = scaler.transform(features_df)
    
    # --- Get Raw Scores ---
    # 1. Autoencoder reconstruction error (higher is more anomalous)
    recon = autoencoder.predict(x_scaled, verbose=0)
    ae_error = np.mean(np.square(x_scaled - recon), axis=1)[0]
 
    # 2. Isolation Forest score (lower is more anomalous)
    if_score_raw = if_model.decision_function(x_scaled)[0]
 
 
    # --- Score Normalization (to match Colab logic) ---
    # Normalize autoencoder error to be between 0 and 1
    ae_norm = (ae_error - AE_MIN) / (AE_MAX - AE_MIN)
    ae_norm = np.clip(ae_norm, 0, 1)
 
    # Normalize isolation forest score. Since lower scores are more anomalous,
    # we invert the result so that a higher final score means more anomalous.
    if_norm = 1 - ((if_score_raw - IF_MIN) / (IF_MAX - IF_MIN))
    if_norm = np.clip(if_norm, 0, 1)


    # -------------------------------
    # Individual model decisions
    # -------------------------------
    ae_pred = int(ae_norm >= best_threshold)
    if_pred = int(if_norm >= best_threshold)

    # -------------------------------
    # Ensemble logic (AND / OR)
    # -------------------------------
    and_result = int(ae_pred and if_pred)
    or_result = int(ae_pred or if_pred)
    
 
    # --- Ensemble Score ---
    # Average of the two normalized scores.
    ensemble_score = (ae_norm + if_norm) / 2
 
    anomaly = ensemble_score >= best_threshold
 
    # --- Generate Dynamic Explanation ---
    if anomaly:
        # 1. Find the most anomalous feature from the autoencoder's perspective
        feature_errors = np.square(x_scaled - recon)[0]
        most_anomalous_feature_idx = np.argmax(feature_errors)
        most_anomalous_feature = FEATURE_ORDER[most_anomalous_feature_idx]
        # 2. Get base explanation from guide
        guide = EXPLANATION_GUIDE.get(most_anomalous_feature, EXPLANATION_GUIDE["default"])
        actions = guide["actions"]
        reason = guide["reason"]
        # 3. Generate dynamic details based on model contributions
        details = []
        # Use the normalized scores to generate details
        if ae_norm >= best_threshold:
            details.append(f"Autoencoder error ({ae_error:.4f}) is above threshold, indicating a significant pattern deviation.")
        
        if if_norm >= best_threshold:
            details.append(f"Isolation Forest score ({if_score_raw:.4f}) is high, suggesting this is a rare event.")
        # Fallback detail if it's an anomaly but individual scores aren't over the main threshold
        if not details:
            details.append(f"The combined ensemble score ({ensemble_score:.4f}) is above the anomaly threshold ({best_threshold:.4f}).")
        explanation = {
            "reason": reason,
            "details": details,
            "suggested_actions": actions
        }
    else:
        explanation = {
            "reason": "System operating within normal learned patterns.",
            "details": [],
            "suggested_actions": ["No immediate action required."]
        }
 
    # return {
    #     "autoencoder_error": float(ae_error),
    #     "isolation_forest_score": float(if_score_raw),
    #     "ensemble_score": float(ensemble_score),
    #     "threshold": float(best_threshold),
    #     "anomaly": bool(anomaly),
    #     "explanation": explanation
    # }

    return {
    "autoencoder_error": float(ae_error),
    "isolation_forest_score": float(if_score_raw),

    # 🔥 NEW (normalized scores)
    "ae_score": float(ae_norm),
    "if_score": float(if_norm),

    # 🔥 NEW (individual predictions)
    "ae_prediction": bool(ae_pred),
    "if_prediction": bool(if_pred),

    # 🔥 NEW (ensemble logic)
    "and_result": bool(and_result),
    "or_result": bool(or_result),

    # existing
    "ensemble_score": float(ensemble_score),
    "threshold": float(best_threshold),
    "anomaly": bool(anomaly),

    "explanation": explanation
}
    

    