# Grow Fasal - Intelligent Farm Management

Grow Fasal is a robust, data-centric Flask application tailored for modern farmers. It provides a comprehensive suite of tools ranging from machine learning-based crop recommendations to real-time market data tracking and a dual-role agricultural marketplace. 

## Features

### 1. Robust Machine Learning Suite
*   **Intelligent Crop Prediction:** Uses `MLSuite` to predict optimal crops based on real-time precise soil data (Nitrogen, Phosphorus, Potassium, pH) and location-specific weather forecasting (temperature, humidity, rainfall).
*   **Predictive Profitability Benchmarking:** Employs the `EconomicEngine` to simulate and calculate profitability using state-specific Cost of Cultivation (CACP) benchmarks, helping farmers anticipate returns.

### 2. Location-Aware Mandi Tracking
*   **Real-Time Prices:** Integrates with official agricultural APIs (like data.gov.in concepts) via the `MandiAPI` to deliver up-to-date market prices (`mandi-trends`) for commodities across various states.
*   **Geospatial Nearest Market:** Automatically detects user location parameters (latitude/longitude) to find the nearest functioning Mandis and forecast local commodity trends.

### 3. Smart Agronomic Advisory & Crop Management
*   **Lifecycle Tracking Dashboard:** Farmers can log "sowing" of specific crops. The `AdvisoryEngine` provides smart harvesting advice, calculating exact Days After Sowing (DAS), stage transitions, expected yield dates, and quality grading based on local conditions.
*   **Automated Harvesting to Marketplace:** Once a crop reaches peak maturity, it can be harvested and directly moved to market inventory with an auto-assigned quality grade.

### 4. Dual-Role Secure E-Commerce Marketplace
*   **Unified Authentication Pipeline:** A completely secure `Flask-Login` and `bcrypt` powered authentication portal that properly routes user traffic based on their registered roles (`FARMER` vs `CUSTOMER`).
*   **Farmer Portal:** Focused entirely on farm profile persistence, active crop management, intelligent advisory, and Mandi market intelligence.
*   **Customer/Buyer Portal:** Provides access to the verified, high-trust marketplace where buyers can purchase directly from farmers, streamlining the soil-to-sale timeline.
*   **Professional Interface:** A clean, serious, emoji-free UI ensuring a professional and high-trust environment.

---

## 🛠 Tech Stack
*   **Backend framework:** Flask, Flask-SQLAlchemy, Flask-Login
*   **Database:** SQLite (`grow_fasal.db`)
*   **Security:** bcrypt for hashing, uuid
*   **Intelligence Engines:** Python native analytical `engine/` suite (`ml_suite`, `mandi_api`, `advisory`, `economics`)
*   **Frontend:** HTML templates with Jinja2 rendering, Vanilla CSS

## Running Locally

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```
The server will start on `http://127.0.0.1:5000` with the database auto-initialized.
