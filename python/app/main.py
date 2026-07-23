from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from . import database, models
from .ml import forecaster, anomaly_detector
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CloudCostIQ ML Analytics API")

# Setup CORS so the Node.js backend or frontend can call it directly if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "ml-analytics"}


@app.get("/api/ml/forecast")
def get_forecast(days: int = 30, db: Session = Depends(database.get_db)):
    # Fetch all records
    records = db.query(models.CostRecord).all()
    forecast = forecaster.generate_forecast(records, days_to_predict=days)
    return {"success": True, "data": forecast}


@app.get("/api/ml/anomalies")
def get_anomalies(db: Session = Depends(database.get_db)):
    records = db.query(models.CostRecord).all()
    anomalies = anomaly_detector.detect_anomalies(records)
    return {"success": True, "data": anomalies}
