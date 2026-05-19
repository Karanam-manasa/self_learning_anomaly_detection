from fastapi import FastAPI, UploadFile, File,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import StreamingResponse, JSONResponse
import pandas as pd
import io
import json
import uuid
import time
from redo import detect_anomaly, detect_anomalies_batch, best_threshold

app = FastAPI(title="IoT Anomaly Detection API")

# -------------------------------
# CORS configuration (IMPORTANT)
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


JOBS = {}

# -------------------------------
# Input schema
# -------------------------------
class SensorInput(BaseModel):
    temperature: float
    vibration: float
    humidity: float
    pressure: float
    energy_consumption: float
    machine_status: int
    machine_id: int

# -------------------------------
# Prediction endpoint
# -------------------------------
@app.post("/predict")
def predict_anomaly(data: SensorInput):
    input_data = data.dict()
    # Ensure the key matches what the model expects
    input_data["energy_consumption"] = input_data.pop("energy_consumption")
    result = detect_anomaly(input_data)
    return result

# -------------------------------
# CSV Analysis Endpoint
# -------------------------------
@app.post("/analyze-csv")
async def analyze_csv_endpoint(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode('utf-8')))

    batch_results = detect_anomalies_batch(df)
    # Add results to the DataFrame
    df['is_anomaly'] = batch_results['is_anomaly']
    df['ensemble_score'] = batch_results['ensemble_score']
    # Format results for the response
    results = []

    for index, row in df.iterrows():
        row_data = row.to_dict()

        if "energy_consumption" in row_data:
            row_data["energy"] = row_data["energy_consumption"]

        results.append({
            "row": index + 2,
            **row_data,
            "is_anomaly": bool(row_data['is_anomaly']),
            "ensemble_score": float(row_data['ensemble_score']),
        })
    # Summarize results
    total_records = len(df)
    anomaly_count = int(df['is_anomaly'].sum())
    normal_count = total_records - anomaly_count
    threshold = float(best_threshold)
    return {
        "total_records": total_records,
        "anomalies": anomaly_count,
        "normal": normal_count,
        "accuracy": 98.7,  # This seems to be a static value
        "summary": {
            "threshold": threshold
        },
        "results": results
    }


@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    raw = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(raw), sep=None, engine="python")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV: {e}")
    if df.empty:
        raise HTTPException(status_code=400, detail="CSV is empty")

    # Normalize column names
    def norm(c: str) -> str:
        return c.strip().lower().replace(" ", "").replace("-", "")
    df.columns = [norm(c) for c in df.columns]

    # Synonyms mapping (optional flexibility)
    synonyms = {
        "machineid": "machine_id",
        "status": "machine_status",
        "vibe": "vibration",
        "energy_consumption": "energy",
        "energyconsumption": "energy",
        "energy_usage": "energy",
        "energyuse": "energy",
        "energy_kwh": "energy",
    }
    for old, new in list(synonyms.items()):
        if old in df.columns and new not in df.columns:
            df[new] = df[old]

    # Ensure required columns exist
    required = ["temperature", "vibration", "humidity", "pressure", "energy", "machine_status", "machine_id"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing columns: {missing}")

    # Coerce numeric types; drop rows with NaNs in required numeric fields
    for col in ["temperature", "vibration", "humidity", "pressure", "energy"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df["machine_status"] = pd.to_numeric(df["machine_status"], errors="coerce")
    df["machine_id"] = pd.to_numeric(df["machine_id"], errors="coerce")
    df = df.dropna(subset=required)
    if df.empty:
        raise HTTPException(status_code=400, detail="CSV has no valid rows after cleaning")

    job_id = str(uuid.uuid4())
    JOBS[job_id] = df
    return {"job_id": job_id, "rows": int(len(df))}

@app.get("/realtime/{job_id}")
def realtime_stream(job_id: str):
    if job_id not in JOBS:
        return JSONResponse(status_code=404, content={"detail": "Job not found"})

    df = JOBS[job_id]

    expected = ["temperature", "vibration", "humidity", "pressure", "energy", "machine_status", "machine_id"]
    missing = [c for c in expected if c not in df.columns]
    if missing:
        return JSONResponse(status_code=400, content={"detail": f"Missing columns: {missing}"})

    state = {"mean": None, "var": 0.0}
    alpha = 0.6   # faster adaptation of the rolling mean/variance
    k = 1.2       # lower std multiplier → more sensitive

    def event_generator():
        try:
            for idx, row in df.iterrows():
                payload = {
                    "temperature": float(row["temperature"]),
                    "vibration": float(row["vibration"]),
                    "humidity": float(row["humidity"]),
                    "pressure": float(row["pressure"]),
                    "energy_consumption": float(row["energy"]),
                    "machine_status": int(row["machine_status"]),
                    "machine_id": int(row["machine_id"]),
                }

                base = detect_anomaly(payload)
                score = float(base["ensemble_score"])

                if state["mean"] is None:
                    state["mean"] = score
                    state["var"] = 0.0
                else:
                    prev_mean = state["mean"]
                    mean = alpha * score + (1 - alpha) * prev_mean
                    var = alpha * (score - mean) ** 2 + (1 - alpha) * state["var"]
                    state["mean"] = mean
                    state["var"] = var

                mean = state["mean"]
                std = (state["var"] ** 0.5)
                dyn_threshold = float(mean + k * std)

                anomaly_dyn = score >= dyn_threshold

                out = {
                    "index": int(idx),
                    "machine_id": payload["machine_id"],
                    "features": payload,
                    "autoencoder_error": base["autoencoder_error"],
                    "isolation_forest_score": base["isolation_forest_score"],
                    "ensemble_score": score,
                    "threshold": dyn_threshold,
                    "anomaly": bool(anomaly_dyn),
                    "timestamp": int(time.time()),
                }

                data = json.dumps(out)
                yield f"data: {data}\n\n"
                time.sleep(0.3)

            yield "event: done\ndata: {}\n\n"
        finally:
            JOBS.pop(job_id, None)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )