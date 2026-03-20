"use client";
import { useState } from 'react';
import LocationInput from '../components/LocationInput';
import WeatherWidget from '../components/WeatherWidget';
import FarmingReport from '../components/FarmingReport';

export default function Home() {
  const [weatherData, setWeatherData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFarmData = async (location) => {
    setIsLoading(true);
    setError(null);
    setWeatherData(null);
    setRecommendations(null);

    try {
      // 1. Fetch Weather
      const weatherRes = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
      const weatherData = await weatherRes.json();
      
      if (!weatherRes.ok) throw new Error(weatherData.error || 'Failed to fetch weather data for the specified location.');
      
      setWeatherData(weatherData);

      // 2. Fetch AI Recommendations based on weather
      const recRes = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: location,
          current: weatherData.current,
          forecast: weatherData.forecast
        })
      });
      const recData = await recRes.json();

      if (!recRes.ok) throw new Error(recData.error || 'Failed to generate recommendations from our AI.');

      setRecommendations(recData);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container animate-fade-in">
      <header style={{ textAlign: 'center', marginBottom: '4rem', paddingTop: '3rem' }}>
        <h1 className="header-title">Grow Fasal</h1>
        <p className="header-subtitle">Intelligent Farm Management & Real-Time Weather Insights</p>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto 4rem auto' }}>
        <LocationInput onLocationSelect={fetchFarmData} isLoading={isLoading} />
        
        {error && (
          <div className="glass-panel animate-fade-in" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5', marginTop: '2rem', textAlign: 'center', fontWeight: '500' }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {(weatherData || recommendations) && (
        <div className="dashboard-grid">
          <div>
            {weatherData && <WeatherWidget weatherData={weatherData} />}
          </div>
          <div>
            {recommendations && <FarmingReport report={recommendations} />}
          </div>
        </div>
      )}
    </main>
  );
}
