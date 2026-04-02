class EconomicEngine:
    def __init__(self):
        # Basis: CACP (Commission for Agricultural Costs and Prices) A2+FL Definitions
        # Benchmarks for 2024-25
        self.state_benchmarks = {
            "punjab": {
                "mechanization_cost_ratio": 1.45,
                "irrigation_cost_ratio": 1.35,
                "labor_cost_ratio": 1.1,
                "base_cost_per_acre": 24000
            },
            "haryana": {
                "mechanization_cost_ratio": 1.35,
                "irrigation_cost_ratio": 1.3,
                "labor_cost_ratio": 1.1,
                "base_cost_per_acre": 22500
            },
            "maharashtra": {
                "mechanization_cost_ratio": 1.15,
                "irrigation_cost_ratio": 1.2,
                "labor_cost_ratio": 1.25,
                "base_cost_per_acre": 19500
            },
            "odisha": {
                "mechanization_cost_ratio": 0.75, # Low mechanization
                "irrigation_cost_ratio": 0.85,
                "labor_cost_ratio": 1.4,  # High manual labor intensity
                "base_cost_per_acre": 14500
            },
            "bihar": {
                "mechanization_cost_ratio": 0.7,
                "irrigation_cost_ratio": 0.8,
                "labor_cost_ratio": 1.35,
                "base_cost_per_acre": 13800
            }
        }
        self.default_benchmark = {
            "mechanization_cost_ratio": 1.0,
            "irrigation_cost_ratio": 1.0,
            "labor_cost_ratio": 1.0,
            "base_cost_per_acre": 18000
        }

    def calculate_production_cost(self, state, crop_type, acreage=1.0):
        """
        Calculates production cost based on state-specific CACP benchmarks.
        If state is not in benchmarks, uses a national average default.
        """
        state_key = state.lower().strip() if state else "default"
        benchmark = self.state_benchmarks.get(state_key, self.default_benchmark)
        
        # Crop-specific factor multipliers
        crop_multipliers = {
            "rice": 1.25, 
            "wheat": 1.1,
            "cotton": 1.4,
            "sugarcane": 1.8,
            "maize": 0.95
        }
        crop_factor = crop_multipliers.get(crop_type.lower(), 1.0)
        
        # Factor Average
        cost_multiplier = (benchmark["mechanization_cost_ratio"] + 
                          benchmark["irrigation_cost_ratio"] + 
                          benchmark["labor_cost_ratio"]) / 3
        
        total_cost = benchmark["base_cost_per_acre"] * crop_factor * cost_multiplier
        return round(total_cost * acreage, 2)

    def get_profitability_analysis(self, state, crop_name, market_price_kg, yield_acre, acreage=1.0):
        """Comprehensive revenue vs cost breakdown."""
        prod_cost = self.calculate_production_cost(state, crop_name, acreage)
        revenue = market_price_kg * yield_acre * acreage
        profit = revenue - prod_cost
        margin = (profit / revenue * 100) if revenue > 0 else 0
        
        return {
            "state_benchmark_used": state,
            "production_cost": round(prod_cost, 2),
            "estimated_revenue": round(revenue, 2),
            "net_profit": round(profit, 2),
            "profit_margin": round(margin, 2),
            "roi": round((profit / prod_cost * 100), 2) if prod_cost > 0 else 0
        }
