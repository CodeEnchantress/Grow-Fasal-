from datetime import datetime, timedelta
from engine.weather_api import WeatherAPI
from engine.mandi_api import MandiAPI

class AdvisoryEngine:
    def __init__(self):
        self.weather_api = WeatherAPI()
        self.mandi_api = MandiAPI()
        
        # Professional Stage-Specific Agricultural Advice
        self.crop_stages = {
            "rice": [
                {"das_range": (0, 7), "stage": "Sowing & Nursery", "advice": "Ensure shallow water depth (1-2 cm) in the nursery bed. Monitor for seedbed rot."},
                {"das_range": (8, 25), "stage": "Transplanting", "advice": "Transplant seedlings at 3-4 leaf stage. Maintain 2-3 cm water level in the main field."},
                {"das_range": (26, 45), "stage": "Tillering", "advice": "Apply first dose of Nitrogen (Urea). Monitor for Stem Borer activity."},
                {"das_range": (46, 75), "stage": "Panicle Initiation", "advice": "Critical water stage. Ensure continuous flooding. Apply second dose of Potash."},
                {"das_range": (76, 120), "stage": "Flowering & Grain Filling", "advice": "Protect against Blast disease. Monitor for Brown Plant Hopper (BPH)."},
            ],
            "wheat": [
                {"das_range": (0, 10), "stage": "Germination", "advice": "Ensure adequate soil moisture for uniform emergence."},
                {"das_range": (11, 25), "stage": "Crown Root Initiation (CRI)", "advice": "First irrigation is critical at this stage (21 DAS). Apply Nitrogen top-dressing."},
                {"das_range": (26, 50), "stage": "Tillering & Jointing", "advice": "Monitor for Yellow Rust symptoms. Check for Aphid infestations."},
                {"das_range": (51, 80), "stage": "Booting/Flowering", "advice": "Maintain soil moisture. Avoid drought stress during flowering."},
                {"das_range": (81, 140), "stage": "Grain Filling/Milky", "advice": "Final irrigation may be needed if temperatures rise rapidly."},
            ]
        }
        # Default advice for undefined crops
        self.default_stages = [
            {"das_range": (0, 15), "stage": "Early Growth", "advice": "Monitor germination and ensure early weed control."},
            {"das_range": (16, 50), "stage": "Vegetative phase", "advice": "Check for nutrient deficiencies and pest activity."},
            {"das_range": (51, 80), "stage": "Pre-Harvest", "advice": "Monitor crop maturity and prepare storage logic."}
        ]
        
        # Hardcoded dictionary estimating baseline maturity days for Indian crops
        self.CROP_MATURITY_DAYS = {
            "rice": 120, "wheat": 140, "jute": 110, "cotton": 160, 
            "sugarcane": 365, "maize": 100, "mustard": 130, "potato": 100,
            "onion": 150, "tomato": 90, "soybean": 100, "chickpea": 110
        }

    def get_stage_advice(self, crop_name, das):
        """Returns the current stage and advice based on Days After Sowing (DAS)."""
        stages = self.crop_stages.get(crop_name.lower(), self.default_stages)
        for stage in stages:
            start, end = stage["das_range"]
            if start <= das <= end:
                return stage
        return {"stage": "Harvest/Late Stage", "advice": "Prepare for harvest or late-stage care. Monitor grain maturity."}

    def get_smart_harvest_advice(self, crop_name, sowing_date, user_state, das):
        """
        Dynamically cross-references the expected harvest date with local 
        weather threats and market prices to generate Smart Alerts.
        """
        c_name = crop_name.lower()
        total_days = self.CROP_MATURITY_DAYS.get(c_name, 110) # default 110
        progress_pct = min(100, int((das / total_days) * 100))
        
        expected_date = sowing_date + timedelta(days=total_days)
        
        alert = None
        alert_type = None # 'weather' or 'market'
        
        # 1. Market Surge Check (Economic Alert)
        # We fetch records from MandiAPI for this crop.
        mandi_records = self.mandi_api.get_market_prices(state=user_state, commodity=crop_name.capitalize())
        if mandi_records and isinstance(mandi_records, list):
            prices = [float(r['modal_price']) for r in mandi_records if r.get('modal_price') is not None]
            if len(prices) > 0:
                current_modal = prices[0]
                avg_price = sum(prices) / len(prices)
                # If current price is 10%+ higher than average, trigger opportunity alert (Farmer decides)
                if current_modal > avg_price * 1.10:
                    delta = int(((current_modal - avg_price) / avg_price) * 100)
                    alert = f"MARKET SURGE: Prices are up +{delta}% right now at ₹{int(current_modal)}/qtl. Consider harvesting if mature."
                    alert_type = 'market'
                    
        # 2. Weather Threat Check (Overrides Market simply because physics > economics)
        # We query weather 6-month forecast
        # We approximate the harvest month from the expected date
        harvest_month = expected_date.month
        # The Open-Meteo forecast simulation builds seasonal rain
        # If the harvest month falls in peak Indian monsoon (July-August) and progress is near maturity (>70%)
        if progress_pct > 70 and harvest_month in [7, 8]:
            alert = "WEATHER HAZARD: Heavy monsoon rains predicted for your harvest window. Consider early harvest and godown storage."
            alert_type = 'weather'

        return {
            "total_days": total_days,
            "progress_pct": progress_pct,
            "expected_date": expected_date.strftime("%b %d, %Y"),
            "alert": alert,
            "alert_type": alert_type
        }

    def calculate_quality_grade(self, active_crop):
        score = active_crop.compliance_score
        score -= (active_crop.pest_risk_events * 5)
        if score >= 90:
            return "A"
        elif score >= 75:
            return "B"
        else:
            return "C"
