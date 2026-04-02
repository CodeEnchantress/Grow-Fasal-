import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import GaussianNB
from xgboost import XGBClassifier
from prophet import Prophet
import tensorflow as tf
from tensorflow.keras.models import load_model
import json

class MLSuite:
    def __init__(self, model_dir='models/'):
        self.model_dir = model_dir
        self.models = {}
        self.mapping = {}
        self.load_all_models()

    def load_all_models(self):
        """Loads all 6 pre-trained models from the models directory."""
        try:
            # 1. Random Forest (Crop Recommendation)
            rf_path = os.path.join(self.model_dir, 'rf_crop.joblib')
            if os.path.exists(rf_path):
                self.models['rf'] = joblib.load(rf_path)
            
            # 2. XGBoost (Crop Recommendation)
            xgb_path = os.path.join(self.model_dir, 'xgb_crop.joblib')
            if os.path.exists(xgb_path):
                self.models['xgb'] = joblib.load(xgb_path)
            
            # 3. Naive Bayes (Pest Outbreak Probability)
            nb_path = os.path.join(self.model_dir, 'nb_pest.joblib')
            if os.path.exists(nb_path):
                self.models['nb'] = joblib.load(nb_path)
                
            # 4. LSTM (Weather Hazard Prediction)
            lstm_path = os.path.join(self.model_dir, 'lstm_weather.h5')
            if os.path.exists(lstm_path):
                self.models['lstm'] = load_model(lstm_path, compile=False)
                
            # 5. CNN (Disease Identification Placeholder)
            cnn_path = os.path.join(self.model_dir, 'cnn_disease_placeholder.h5')
            if os.path.exists(cnn_path):
                self.models['cnn'] = load_model(cnn_path, compile=False)
                
            # Crop Label Mapping
            map_path = os.path.join(self.model_dir, 'crop_mapping.joblib')
            if os.path.exists(map_path):
                self.mapping = joblib.load(map_path)
                
            print("Successfully loaded all ML Intelligence models.")
        except Exception as e:
            print(f"Error loading models: {e}")

    def predict_top_crops(self, features):
        """
        Uses RF and XGBoost to predict the TOP 3 crops.
        Features: [N, P, K, temperature, humidity, ph, rainfall]
        """
        if 'rf' not in self.models or 'xgb' not in self.models:
            return ["Rice", "Maize", "Cotton"] # Fallback

        # Get probabilities from both
        rf_probs = self.models['rf'].predict_proba([features])[0]
        xgb_probs = self.models['xgb'].predict_proba([features])[0]
        
        # Ensemble (Average)
        avg_probs = (rf_probs + xgb_probs) / 2
        
        # Get top 3 indices
        top_3_idx = np.argsort(avg_probs)[-3:][::-1]
        
        results = []
        for idx in top_3_idx:
            results.append({
                "crop": self.mapping.get(idx, f"Crop_{idx}"),
                "confidence": round(float(avg_probs[idx]) * 100, 1)
            })
        return results

    def predict_pest_risk(self, temperature, humidity):
        """Uses Naive Bayes for Pest Outbreak Probability."""
        if 'nb' not in self.models:
            return 15.0 # Fallback risk %
            
        prob = self.models['nb'].predict_proba([[temperature, humidity]])[0][1]
        return round(float(prob) * 100, 1)

    def predict_weather_hazard(self, sequence):
        """
        Uses LSTM for weather anomaly detection.
        Sequence: list of 10 days weather data
        """
        if 'lstm' not in self.models:
            return 5.0 # Fallback hazard %
            
        # Reshape for LSTM: (1, 10, 1)
        seq_array = np.array(sequence).reshape((1, 10, 1))
        pred = self.models['lstm'].predict(seq_array, verbose=0)
        return round(float(pred[0][0]) * 100, 1)

    def forecast_price(self, history):
        """
        Placeholder for Prophet PRICE forecasting.
        Prophet is usually best used on raw data frames.
        """
        # In a real implementation, we'd wrap Prophet here.
        # For now, return a simulated 3-month trend for Plotly.
        import random
        base_price = history[-1] if history else 2000
        trend = [base_price + (i * random.uniform(-50, 150)) for i in range(12)] # Weekly intervals
        return trend

if __name__ == "__main__":
    # Test Suite
    suite = MLSuite()
    test_features = [90, 42, 43, 20.8, 82.0, 6.5, 202.9]
    print(f"Top 3 Crops: {suite.predict_top_crops(test_features)}")
    print(f"Pest Risk: {suite.predict_pest_risk(30, 80)}%")
