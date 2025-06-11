import joblib
import json
import numpy as np
import pandas as pd

# === Load model components ===
xgb_model = joblib.load('ML_Models/xgb_model.pkl')
rf_model = joblib.load('ML_Models/rf_model.pkl')
lr_model = joblib.load('ML_Models/lr_model.pkl')
scaler = joblib.load('ML_Models/scaler.pkl')

with open('Models_config/feature_list.json', 'r') as f:
    feature_list = json.load(f)

with open('Models_config/ensemble_config.json', 'r') as f:
    ensemble_config = json.load(f)

# === Prediction function ===
def predict_match(input_data):
    # Use input features directly
    features = {key: input_data[key] for key in feature_list}

    df_input = pd.DataFrame([features])[feature_list]
    X_scaled = scaler.transform(df_input)

    # Predict probabilities from each model
    probs_xgb = xgb_model.predict_proba(X_scaled)
    probs_rf = rf_model.predict_proba(X_scaled)
    probs_lr = lr_model.predict_proba(X_scaled)

    # Weighted soft voting
    weights = ensemble_config['weights']
    draw_boost = ensemble_config['draw_boost']

    ensemble_probs = (
        weights['XGB'] * probs_xgb +
        weights['RF'] * probs_rf +
        weights['LR'] * probs_lr
    )
    ensemble_probs[:, 1] *= draw_boost  # Boost draw class
    ensemble_probs /= ensemble_probs.sum(axis=1, keepdims=True)

    pred_class = np.argmax(ensemble_probs[0])
    class_map = {0: 'H', 1: 'D', 2: 'A'}

    return {
        'prediction': class_map[pred_class],
        'probabilities': {
            'H': round(float(ensemble_probs[0][0]), 3),
            'D': round(float(ensemble_probs[0][1]), 3),
            'A': round(float(ensemble_probs[0][2]), 3)
        }
    }
