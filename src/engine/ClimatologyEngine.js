import { IndianAgriZones } from '../utils/indianRegions';

export class ClimatologyEngine {
  constructor() {
    this.zones = IndianAgriZones;
    this.months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  }

  // Future ML Hook: Could be replaced by an NLP NER model or geospatial lookup API
  identifyRegion(locationString) {
    if (!locationString) return 'central_plateau'; // Default fallback
    
    const loc = locationString.toLowerCase();
    
    // 1. Check direct state matches
    for (const [zoneKey, zoneData] of Object.entries(this.zones)) {
      if (zoneData.states.some(state => loc.includes(state))) {
        return zoneKey;
      }
    }
    
    // 2. Check major cities
    const cityStateMap = {
      delhi: 'northern_plains', jaipur: 'western_arid', chennai: 'southern_peninsula',
      mumbai: 'central_plateau', pune: 'central_plateau', bangalore: 'southern_peninsula',
      kolkata: 'eastern_region', shimla: 'himalayan_region', hyderabad: 'southern_peninsula',
      lucknow: 'northern_plains', patna: 'eastern_region', ahmedabad: 'western_arid',
      kochi: 'southern_peninsula', bhopal: 'central_plateau', dehradun: 'himalayan_region',
      chandigarh: 'northern_plains'
    };
    
    for (const [city, zoneKey] of Object.entries(cityStateMap)) {
      if (loc.includes(city)) return zoneKey;
    }

    // Default to central plateau if location is extremely obscure or not in India
    return 'central_plateau'; 
  }

  getAgriculturalSeason(monthIndex) {
    // Kharif: June (5) to Oct (9)
    // Rabi: Nov (10) to April (3)
    // Zaid: March (2) to June (5)
    
    if (monthIndex >= 5 && monthIndex <= 9) return 'kharif';
    if (monthIndex >= 2 && monthIndex <= 4) return 'zaid'; // overlapping slightly, but heuristic distinguishes Spring/Summer
    return 'rabi';
  }

  // Future ML Hook: Time-series weather prediction model (e.g. ARIMA, LSTM) would replace this
  generateSixMonthForecast(zoneKey, currentMonthIndex) {
    const baseline = this.zones[zoneKey].baselineWeather;
    const forecast = [];
    
    for (let i = 0; i < 6; i++) {
      const forecastMonthIndex = (currentMonthIndex + i) % 12;
      const monthName = this.months[forecastMonthIndex];
      const monthData = baseline[monthName];
      
      forecast.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        temp: monthData.temp,
        rain: monthData.rain,
      });
    }
    
    return forecast;
  }

  // Core processing pipeline coordinating all intelligence
  generateReport(locationString, currentWeatherData) {
    const currentMonthIndex = new Date().getMonth();
    const zoneKey = this.identifyRegion(locationString);
    const regionData = this.zones[zoneKey];
    
    const currentSeason = this.getAgriculturalSeason(currentMonthIndex);
    const nextSeason = this.getAgriculturalSeason((currentMonthIndex + 3) % 12);
    
    const longTermForecast = this.generateSixMonthForecast(zoneKey, currentMonthIndex);
    
    // Future ML Hook: Reinforcement learning agent for crop selection
    const recommendedCrops = regionData.seasons[currentSeason] || [];
    const upcomingCrops = regionData.seasons[nextSeason] || [];
    
    // Derive insights from long-term data
    const totalForwardRain = longTermForecast.reduce((sum, month) => sum + month.rain, 0);
    const avgForwardTemp = longTermForecast.reduce((sum, month) => sum + month.temp, 0) / 6;
    
    let irrigationPlan = "";
    if (totalForwardRain > 600) {
      irrigationPlan = "Heavy rainfall period approaching over the next 6 months. Ensure all field drainage systems are clear. Rely predominantly on rain-fed irrigation to save costs and groundwater.";
    } else if (totalForwardRain < 150) {
      irrigationPlan = "Dry period forecasted over the next 6 months. Plan for intensive drip or sprinkler irrigation immediately. Construct temporary water holding structures to conserve any upcoming rain.";
    } else {
      irrigationPlan = "Moderate rainfall expected over the long term. Maintain standard supplementary irrigation schedules based on topsoil moisture assessment.";
    }

    let pesticideWindow = "";
    const firstHighRainMonth = longTermForecast.find(m => m.rain > 150);
    if (firstHighRainMonth) {
      pesticideWindow = `Apply major foundational fertilizers and system pesticides before ${firstHighRainMonth.month}. Expected heavy rains in ${firstHighRainMonth.month} will otherwise wash them away, causing runoff and wastage.`;
    } else {
      pesticideWindow = "No torrential rains expected in the upcoming quarter. You have a flexible, broad window for pesticide application. Spray during early mornings to prevent heat-based rapid evaporation.";
    }
    
    // Format human-friendly region name (e.g. "western_arid" -> "Western Arid")
    const regionName = zoneKey.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return {
      regionInfo: {
        name: regionName,
        climate: regionData.climate.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        soil: regionData.soilTypes.join(', '),
      },
      seasonContext: {
        current: currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1),
        upcoming: nextSeason.charAt(0).toUpperCase() + nextSeason.slice(1)
      },
      cropRecommendations: {
        current: recommendedCrops,
        upcoming: upcomingCrops
      },
      longTermForecast: longTermForecast,
      advisory: {
        irrigationPlan,
        pesticideWindow,
        careTips: `Your soil type is primarily ${regionData.soilTypes[0]}. Maintain optimal pH specific to your ${currentSeason} crops. Average expected baseline temperature is ${avgForwardTemp.toFixed(1)}°C over the next 6 months, plan mulching and shading accordingly.`
      }
    };
  }
}
