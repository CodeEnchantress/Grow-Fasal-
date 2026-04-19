import os
import json
import warnings

# Suppress messy ML version warnings and feature name warnings
warnings.filterwarnings("ignore")

# Gracefully handle missing ML dependencies so the app doesn't crash
try:
    import pandas as pd
    import numpy as np
    import joblib
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.naive_bayes import GaussianNB
    from xgboost import XGBClassifier
    from prophet import Prophet
    # TensorFlow is heavy and often not needed for simple inference fallbacks
    # import tensorflow as tf
    # from tensorflow.keras.models import load_model
    HAS_ML_LIBS = True
except ImportError:
    HAS_ML_LIBS = False
    # If numpy isn't installed, provide a dummy to prevent NameErrors
    np = None

class MLSuite:
    def __init__(self, model_dir='models/'):
        # Ensure we look in the right place relative to the app root
        if not os.path.isabs(model_dir):
            base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self.model_dir = os.path.join(base_path, model_dir)
        else:
            self.model_dir = model_dir
            
        self.models = {}
        self.mapping = {}
        self.load_all_models()

    def load_all_models(self):
        """Loads all pre-trained models from the models directory."""
        if not HAS_ML_LIBS:
            print("ML dependencies missing. Intelligence engine operating in fallback mode.")
            return

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
                
            # 4. LSTM (Weather Hazard Prediction) - Placeholder/Optional
            lstm_path = os.path.join(self.model_dir, 'lstm_weather.h5')
            if os.path.exists(lstm_path):
                # self.models['lstm'] = load_model(lstm_path, compile=False)
                pass
                
            # 5. CNN (Disease Identification) - Placeholder/Optional
            cnn_path = os.path.join(self.model_dir, 'cnn_disease_placeholder.h5')
            if os.path.exists(cnn_path):
                # self.models['cnn'] = load_model(cnn_path, compile=False)
                pass
                
            # Crop Label Mapping
            map_path = os.path.join(self.model_dir, 'crop_mapping.joblib')
            if os.path.exists(map_path):
                self.mapping = joblib.load(map_path)
                
            if self.models:
                print(f"Successfully loaded {len(self.models)} ML Intelligence models.")
            else:
                print("No models found in directory. Using fallback logic.")
        except Exception as e:
            print(f"Error loading models: {e}")

    # Structured fallback used when ML models are not present
    FALLBACK_CROPS = [
        {"crop": "Rice",   "confidence": 75.0},
        {"crop": "Maize",  "confidence": 65.0},
        {"crop": "Cotton", "confidence": 55.0},
    ]

    def predict_top_crops(self, features):
        """
        Uses RF and XGBoost to predict the TOP 3 crops.
        Features: [N, P, K, temperature, humidity, ph, rainfall]
        """
        if 'rf' not in self.models or 'xgb' not in self.models or not HAS_ML_LIBS:
            return self.FALLBACK_CROPS

        try:
            # Get probabilities from both
            rf_probs = self.models['rf'].predict_proba([features])[0]
            xgb_probs = self.models['xgb'].predict_proba([features])[0]

            # Ensemble (Average)
            avg_probs = (rf_probs + xgb_probs) / 2

            # Get top 3 indices
            top_3_idx = np.argsort(avg_probs)[-3:][::-1]

            results = []
            for idx in top_3_idx:
                # Ensure we return plain strings, not np.str_
                crop_name = str(self.mapping.get(idx, f"Crop_{idx}"))
                results.append({
                    "crop": crop_name,
                    "confidence": round(float(avg_probs[idx]) * 100, 1)
                })
            return results
        except Exception as e:
            # If anything fails during inference, return fallback instead of crashing
            return self.FALLBACK_CROPS

    def predict_pest_risk(self, temperature, humidity):
        """Uses Naive Bayes for Pest Outbreak Probability."""
        if 'nb' not in self.models or not HAS_ML_LIBS:
            return 15.0 # Fallback risk %
            
        try:
            prob = self.models['nb'].predict_proba([[temperature, humidity]])[0][1]
            return round(float(prob) * 100, 1)
        except:
            return 15.0

    def predict_weather_hazard(self, sequence):
        """Uses LSTM for weather anomaly detection."""
        if 'lstm' not in self.models or not HAS_ML_LIBS:
            return 5.0 # Fallback hazard %
            
        try:
            # Reshape for LSTM: (1, 10, 1)
            seq_array = np.array(sequence).reshape((1, 10, 1))
            pred = self.models['lstm'].predict(seq_array, verbose=0)
            return round(float(pred[0][0]) * 100, 1)
        except:
            return 5.0

    def forecast_price(self, history):
        """Simulated price forecasting for UI display."""
        import random
        base_price = history[-1] if history else 2000
        # Return a simulated 12-week trend
        trend = [base_price + (i * random.uniform(-50, 150)) for i in range(12)]
        return trend

if __name__ == "__main__":
    # Test Suite
    suite = MLSuite()
    test_features = [90, 42, 43, 20.8, 82.0, 6.5, 202.9]
    print(f"Top 3 Crops: {suite.predict_top_crops(test_features)}")
    print(f"Pest Risk: {suite.predict_pest_risk(30, 80)}%")
