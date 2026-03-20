// A modular dataset mapping Indian geography to agricultural intelligence
export const IndianAgriZones = {
  northern_plains: {
    states: ["punjab", "haryana", "uttar pradesh", "delhi", "chandigarh"],
    climate: "sub_tropical",
    soilTypes: ["Alluvial", "Loam"],
    seasons: {
      kharif: ["Rice", "Maize", "Cotton", "Sugarcane", "Sorghum"],
      rabi: ["Wheat", "Mustard", "Barley", "Gram", "Peas"],
      zaid: ["Fodder crops", "Vegetables", "Melons", "Cucumber"]
    },
    baselineWeather: {
      jan: { temp: 14, rain: 15 }, feb: { temp: 18, rain: 20 }, mar: { temp: 24, rain: 15 },
      apr: { temp: 31, rain: 10 }, may: { temp: 35, rain: 15 }, jun: { temp: 35, rain: 70 },
      jul: { temp: 31, rain: 200 }, aug: { temp: 30, rain: 210 }, sep: { temp: 29, rain: 110 },
      oct: { temp: 26, rain: 25 }, nov: { temp: 20, rain: 5 }, dec: { temp: 15, rain: 10 }
    }
  },
  western_arid: {
    states: ["rajasthan", "gujarat"],
    climate: "arid_semi_arid",
    soilTypes: ["Sandy", "Desert", "Black (Gujarat)"],
    seasons: {
      kharif: ["Pearl Millet (Bajra)", "Groundnut", "Cotton", "Cluster Bean (Guar)"],
      rabi: ["Wheat", "Mustard", "Cumin", "Coriander", "Fennel"],
      zaid: ["Fodder", "Vegetables"]
    },
    baselineWeather: {
      jan: { temp: 16, rain: 5 }, feb: { temp: 19, rain: 5 }, mar: { temp: 26, rain: 5 },
      apr: { temp: 32, rain: 5 }, may: { temp: 36, rain: 10 }, jun: { temp: 35, rain: 40 },
      jul: { temp: 31, rain: 120 }, aug: { temp: 29, rain: 130 }, sep: { temp: 28, rain: 60 },
      oct: { temp: 27, rain: 10 }, nov: { temp: 22, rain: 5 }, dec: { temp: 17, rain: 5 }
    }
  },
  central_plateau: {
    states: ["madhya pradesh", "chhattisgarh", "maharashtra", "jharkhand"],
    climate: "tropical_wet_dry",
    soilTypes: ["Black", "Red", "Laterite"],
    seasons: {
      kharif: ["Soybean", "Cotton", "Rice", "Pigeon Pea (Tur)", "Maize"],
      rabi: ["Wheat", "Gram", "Linseed", "Mustard", "Lentil"],
      zaid: ["Vegetables", "Pulses"]
    },
    baselineWeather: {
      jan: { temp: 19, rain: 10 }, feb: { temp: 22, rain: 10 }, mar: { temp: 27, rain: 15 },
      apr: { temp: 32, rain: 10 }, may: { temp: 35, rain: 20 }, jun: { temp: 32, rain: 150 },
      jul: { temp: 27, rain: 300 }, aug: { temp: 26, rain: 280 }, sep: { temp: 26, rain: 180 },
      oct: { temp: 25, rain: 40 }, nov: { temp: 21, rain: 15 }, dec: { temp: 18, rain: 10 }
    }
  },
  southern_peninsula: {
    states: ["tamil nadu", "kerala", "karnataka", "andhra pradesh", "telangana"],
    climate: "tropical",
    soilTypes: ["Red", "Black", "Laterite", "Coastal Alluvium"],
    seasons: {
      kharif: ["Rice", "Ragi", "Maize", "Groundnut", "Cotton"],
      rabi: ["Rice (Tamil Nadu)", "Sorghum (Jowar)", "Bengal Gram", "Sunflower"],
      zaid: ["Vegetables", "Watermelon", "Sesame"]
    },
    baselineWeather: {
      jan: { temp: 25, rain: 20 }, feb: { temp: 27, rain: 15 }, mar: { temp: 29, rain: 20 },
      apr: { temp: 31, rain: 40 }, may: { temp: 31, rain: 80 }, jun: { temp: 28, rain: 160 },
      jul: { temp: 27, rain: 170 }, aug: { temp: 27, rain: 160 }, sep: { temp: 27, rain: 150 },
      oct: { temp: 27, rain: 200 }, nov: { temp: 26, rain: 180 }, dec: { temp: 25, rain: 80 }
    }
  },
  himalayan_region: {
    states: ["jammu", "kashmir", "himachal pradesh", "uttarakhand", "sikkim"],
    climate: "temperate_alpine",
    soilTypes: ["Mountain", "Forest"],
    seasons: {
      kharif: ["Maize", "Rice", "Millets", "Potatoes"],
      rabi: ["Wheat", "Barley", "Peas", "Mustard (Lower Altitudes)", "Apples"],
      zaid: [] // Winter crops/orchards dominate
    },
    baselineWeather: {
      jan: { temp: 5, rain: 70 }, feb: { temp: 7, rain: 80 }, mar: { temp: 12, rain: 90 },
      apr: { temp: 17, rain: 60 }, may: { temp: 21, rain: 60 }, jun: { temp: 24, rain: 120 },
      jul: { temp: 22, rain: 250 }, aug: { temp: 22, rain: 250 }, sep: { temp: 20, rain: 120 },
      oct: { temp: 15, rain: 40 }, nov: { temp: 10, rain: 20 }, dec: { temp: 6, rain: 40 }
    }
  },
  eastern_region: {
    states: ["west bengal", "bihar", "odisha", "assam"],
    climate: "humid_subtropical",
    soilTypes: ["Alluvial", "Red", "Laterite"],
    seasons: {
      kharif: ["Rice", "Jute", "Tea (Assam)"],
      rabi: ["Wheat", "Mustard", "Potato", "Lentils"],
      zaid: ["Rice (Boro)", "Moong"]
    },
    baselineWeather: {
      jan: { temp: 17, rain: 15 }, feb: { temp: 21, rain: 20 }, mar: { temp: 26, rain: 30 },
      apr: { temp: 29, rain: 60 }, may: { temp: 30, rain: 140 }, jun: { temp: 29, rain: 320 },
      jul: { temp: 29, rain: 400 }, aug: { temp: 29, rain: 350 }, sep: { temp: 28, rain: 250 },
      oct: { temp: 26, rain: 100 }, nov: { temp: 22, rain: 20 }, dec: { temp: 18, rain: 10 }
    }
  }
};
