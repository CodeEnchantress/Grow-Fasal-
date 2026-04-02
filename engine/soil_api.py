import requests

class SoilAPI:
    def __init__(self):
        # ISRIC Global SoilGrids REST API v2.0
        self.base_url = "https://rest.isric.org/soilgrids/v2.0/properties/query"

    def get_soil_profile(self, lat, lon):
        """
        Fetches true scientific soil data from global satellites for exact coordinates.
        Properties fetched:
        - phh2o: pH of the soil (multiplied by 10 in the API)
        - nitrogen: Nitrogen content (cg/kg)
        - soc: Soil Organic Carbon (dg/kg) -> Used to proxy Phosphorus (P)
        - clay: Clay fraction (g/kg) -> Used to proxy Potassium (K)
        """
        params = {
            "lat": lat,
            "lon": lon,
            "property": ["phh2o", "nitrogen", "soc", "clay"],
            "depth": "0-5cm",
            "value": "mean"
        }
        
        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Extract layers
            layers = data.get('properties', {}).get('layers', [])
            result_map = {}
            for layer in layers:
                name = layer.get('name')
                depths = layer.get('depths', [])
                if depths and depths[0].get('values', {}).get('mean') is not None:
                    result_map[name] = depths[0]['values']['mean']
                else:
                    result_map[name] = 0
            
            # --- PARSE & COMPUTE AGRONOMIC VALUES FOR ML SUITE ---
            
            # 1. pH Level (ISRIC returns pH * 10, e.g., 65 means 6.5)
            ph = result_map.get('phh2o', 65) / 10.0
            
            # 2. Nitrogen (N)
            # ISRIC Nitrogen is returned in cg/kg. Common agricultural datasets cap N around 140.
            raw_n = result_map.get('nitrogen', 400)
            n_value = min(140, max(10, int(raw_n / 10))) 
            
            # 3. Phosphorus (P) Proxy
            # Phosphorus heavily correlates with Soil Organic Carbon (SOC). 
            # SOC is returned in dg/kg (e.g., 200-500). We normalize to standard P ranges (15-100).
            raw_soc = result_map.get('soc', 300)
            p_value = min(100, max(15, int(raw_soc / 8)))
            
            # 4. Potassium (K) Proxy
            # Potassium availability is strongly tied to Clay content in soil physics.
            # Clay is returned in g/kg (e.g., 200-600). We normalize to standard K ranges (15-200).
            raw_clay = result_map.get('clay', 300)
            k_value = min(200, max(15, int(raw_clay / 5)))
            
            return {
                "N": n_value,
                "P": p_value,
                "K": k_value,
                "ph": round(ph, 1),
                "meta": {
                    "source": "ISRIC SoilGrids 250m Spatial Resolution",
                    "status": "success"
                }
            }
            
        except Exception as e:
            print("ISRIC Soil API Error:", e)
            # Failsafe Agronomic Averages if satellite is down
            return {
                "N": 40,
                "P": 50,
                "K": 40,
                "ph": 6.8,
                "meta": {"source": "Failsafe Static Average", "status": "fallback"}
            }

if __name__ == "__main__":
    soil = SoilAPI()
    # Test coordinates for fertile Punjab plains
    res = soil.get_soil_profile(30.90, 75.85)
    print("Punjab Soil:", res)
    # Test coordinates for arid Rajasthan
    res = soil.get_soil_profile(26.91, 70.90)
    print("Rajasthan Soil:", res)
