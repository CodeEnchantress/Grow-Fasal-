"use client";
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function LocationInput({ onLocationSelect, isLoading }) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { t, lang } = useLanguage();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onLocationSelect(query);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input.");
      return;
    }
    const recognition = new SpeechRecognition();
    const voiceLocales = { 
      en: 'en-IN', hi: 'hi-IN', bn: 'bn-IN', te: 'te-IN', mr: 'mr-IN', 
      ta: 'ta-IN', ur: 'ur-IN', gu: 'gu-IN', kn: 'kn-IN', or: 'or-IN', 
      ml: 'ml-IN', pa: 'pa-IN', as: 'as-IN', mai: 'mai-IN', sa: 'sa-IN',
      ne: 'ne-NP', kok: 'kok-IN', mni: 'mni-IN', brx: 'brx-IN', doi: 'doi-IN', 
      sat: 'sat-IN', ks: 'ks-IN' 
    };
    recognition.lang = voiceLocales[lang] || 'en-IN';
    recognition.continuous = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };
    recognition.onerror = (event) => {
      console.error(event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
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
      <form onSubmit={handleSearch} className="search-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          className="search-input"
          placeholder={t("Enter your city name (e.g., Delhi, Pune)")} 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
          style={{ flexGrow: 1 }}
        />
        <button type="button" onClick={startListening} className="btn btn-secondary" disabled={isLoading || isListening} style={{ padding: '0 15px', borderRadius: '12px', minWidth: '50px' }} title={t("Speak Location")}>
          {isListening ? "🎤 " + t("Listening...") : "🎙️"}
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? <div className="loader"></div> : t("Search")}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>{t("OR")}</p>
        <button type="button" className="btn btn-secondary" onClick={handleGPS} disabled={isLoading} style={{ margin: '0 auto' }}>
           <span style={{ fontSize: '1.2rem' }}>📍</span> {t("Use GPS Location")}
        </button>
      </div>
    </div>
  );
}
