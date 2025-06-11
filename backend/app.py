from fastapi import FastAPI, Request
from Predict import predict_match
import uvicorn
from feature_service import build_features

app = FastAPI()

@app.post("/Predict")
async def predict_endpoint(payload: dict):
    return predict_match(payload)

@app.post("/PredictFromFixture")
async def full_pipeline_endpoint(payload: dict):
    features = build_features(
        home_team_id=payload["home_team_id"],
        away_team_id=payload["away_team_id"],
        fixture_date=payload["fixture_date"],
        fixture_id=payload.get("fixture_id", 123456)
    )
    return predict_match(features)

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000)
