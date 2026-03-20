"use client";
import { useState } from 'react';

export default function LocationInput({ onLocationSelect, isLoading }) {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onLocationSelect(query);
    }
  };

  const handleGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = `${position.coords.latitude},${position.coords.longitude}`;
          onLocationSelect(loc);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Unable to retrieve your location. Please enter a city manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <form onSubmit={handleSearch} className="search-container">
        <input 
          type="text" 
          className="search-input"
          placeholder="Enter your city name (e.g., Delhi, Pune)" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? <div className="loader"></div> : "Search"}
        </button>
      </form>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>OR</p>
        <button type="button" className="btn btn-secondary" onClick={handleGPS} disabled={isLoading} style={{ margin: '0 auto' }}>
           <span style={{ fontSize: '1.2rem' }}>📍</span> Use GPS Location
        </button>
      </div>
    </div>
  );
}
