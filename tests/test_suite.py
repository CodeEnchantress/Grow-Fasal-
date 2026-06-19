import unittest
import sys
import os
from datetime import datetime, timedelta

# Ensure root directory is in path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engine.ml_suite import MLSuite
from engine.economics import EconomicEngine
from engine.advisory import AdvisoryEngine
from engine.mandi_api import MandiAPI
from engine.weather_api import WeatherAPI
from engine.soil_api import SoilAPI
from models import ActiveCrop

class TestMLSuite(unittest.TestCase):
    def setUp(self):
        # Initialize MLSuite with root models folder path
        self.ml_suite = MLSuite(model_dir='models/')

    def test_crop_recommendation_output(self):
        # [N, P, K, temp, hum, ph, rain]
        test_features = [90, 42, 43, 20.8, 82.0, 6.5, 202.9]
        recommendations = self.ml_suite.predict_top_crops(test_features)
        
        self.assertIsInstance(recommendations, list)
        self.assertGreater(len(recommendations), 0)
        for rec in recommendations:
            self.assertIn('crop', rec)
            self.assertIn('confidence', rec)
            self.assertIsInstance(rec['confidence'], float)

    def test_pest_risk_output(self):
        temp, humidity = 30.0, 80.0
        risk = self.ml_suite.predict_pest_risk(temp, humidity)
        self.assertIsInstance(risk, float)
        self.assertTrue(0.0 <= risk <= 100.0)

    def test_weather_hazard_output(self):
        sequence = [2.0, 3.5, 5.0, 10.0, 15.0, 12.0, 8.0, 5.0, 3.0, 1.0]
        hazard = self.ml_suite.predict_weather_hazard(sequence)
        self.assertIsInstance(hazard, float)
        self.assertTrue(0.0 <= hazard <= 100.0)

    def test_price_forecasting(self):
        history = [2100, 2150, 2200, 2180, 2220]
        forecast = self.ml_suite.forecast_price(history)
        self.assertIsInstance(forecast, list)
        self.assertEqual(len(forecast), 12)  # 12-week trend


class TestEconomicEngine(unittest.TestCase):
    def setUp(self):
        self.economics = EconomicEngine()

    def test_production_cost_calculations(self):
        # Cost check for Punjab (mechanized)
        punjab_cost = self.economics.calculate_production_cost("Punjab", "Rice")
        self.assertGreater(punjab_cost, 0)
        
        # Cost check for Odisha (labor intensive)
        odisha_cost = self.economics.calculate_production_cost("Odisha", "Rice")
        self.assertGreater(odisha_cost, 0)

        # Default fallback
        default_cost = self.economics.calculate_production_cost("UnknownState", "Wheat")
        self.assertGreater(default_cost, 0)

    def test_profitability_breakdown(self):
        # State, crop, price/kg, yield/acre
        analysis = self.economics.get_profitability_analysis("Punjab", "Wheat", 24.0, 2000.0)
        self.assertIn("production_cost", analysis)
        self.assertIn("estimated_revenue", analysis)
        self.assertIn("net_profit", analysis)
        self.assertIn("profit_margin", analysis)
        self.assertIn("roi", analysis)
        
        self.assertEqual(analysis["estimated_revenue"], 24.0 * 2000.0)
        self.assertEqual(analysis["net_profit"], analysis["estimated_revenue"] - analysis["production_cost"])


class TestAdvisoryEngine(unittest.TestCase):
    def setUp(self):
        self.advisory = AdvisoryEngine()

    def test_stage_advice(self):
        # Rice DAS check
        advice_early = self.advisory.get_stage_advice("rice", 5)
        self.assertEqual(advice_early["stage"], "Sowing & Nursery")
        
        advice_late = self.advisory.get_stage_advice("rice", 90)
        self.assertEqual(advice_late["stage"], "Flowering & Grain Filling")

        # Unknown crop fallback
        unknown_advice = self.advisory.get_stage_advice("unknown_crop", 10)
        self.assertIn("stage", unknown_advice)
        self.assertIn("advice", unknown_advice)

    def test_smart_harvest_advice(self):
        # Harvest advice near maturity during monsoon season
        sowing_date = datetime.now() - timedelta(days=110)
        advice = self.advisory.get_smart_harvest_advice("Rice", sowing_date, "Punjab", 110)
        
        self.assertIn("progress_pct", advice)
        self.assertIn("expected_date", advice)
        self.assertIn("total_days", advice)
        self.assertIn("alert", advice)

    def test_quality_grade_calculation(self):
        # Test models ActiveCrop mock
        crop_a = ActiveCrop(compliance_score=95.0, pest_risk_events=0)
        self.assertEqual(self.advisory.calculate_quality_grade(crop_a), "A")

        crop_b = ActiveCrop(compliance_score=80.0, pest_risk_events=1)
        self.assertEqual(self.advisory.calculate_quality_grade(crop_b), "B")

        crop_c = ActiveCrop(compliance_score=60.0, pest_risk_events=3)
        self.assertEqual(self.advisory.calculate_quality_grade(crop_c), "C")


class TestMandiAPI(unittest.TestCase):
    def setUp(self):
        self.mandi = MandiAPI()

    def test_haversine_distance(self):
        # Coordinates for Delhi & Mumbai
        lat1, lon1 = 28.6139, 77.2090
        lat2, lon2 = 19.0760, 72.8777
        dist = MandiAPI._haversine(lon1, lat1, lon2, lat2)
        
        # Approximate distance is 1150-1200 km
        self.assertTrue(1100 < dist < 1250)

    def test_nearest_mandi_geocoding(self):
        # Request nearest mandis for wheat around Delhi coordinates
        results = self.mandi.get_nearest_mandis(28.6139, 77.2090, "Wheat", limit=3)
        self.assertEqual(len(results), 3)
        for r in results:
            self.assertIn("mandi", r)
            self.assertIn("modal_price", r)
            self.assertIn("distance_km", r)
            self.assertIsInstance(r["distance_km"], int)
        
        # Azadpur APMC should be the closest for Delhi coordinates
        self.assertEqual(results[0]["mandi"], "Azadpur APMC")


class TestExternalAPIs(unittest.TestCase):
    def setUp(self):
        self.weather = WeatherAPI()
        self.soil = SoilAPI()

    def test_weather_projection_keys(self):
        forecast = self.weather.get_6_month_forecast()
        self.assertIn("weeks", forecast)
        self.assertIn("temperature_c", forecast)
        self.assertIn("rainfall_mm", forecast)
        self.assertEqual(len(forecast["weeks"]), 24)

    def test_soil_profile_keys(self):
        # Test coordinates for Punjab
        profile = self.soil.get_soil_profile(30.90, 75.85)
        self.assertIn("N", profile)
        self.assertIn("P", profile)
        self.assertIn("K", profile)
        self.assertIn("ph", profile)


if __name__ == '__main__':
    unittest.main()
