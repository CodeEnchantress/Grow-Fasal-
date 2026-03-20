export default function WeatherWidget({ weatherData }) {
  if (!weatherData) return null;

  const { location, current, forecast } = weatherData;

  // Simple icon mapper based on weather condition
  const getWeatherIcon = (temp, pop) => {
    if (pop > 50) return "🌧️";
    if (temp > 30) return "☀️";
    if (temp < 15) return "❄️";
    return "⛅";
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--accent-blue)', letterSpacing: '-0.02em' }}>
        Location: <span style={{ color: 'white' }}>{location}</span>
      </h2>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '5rem', filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.2))' }}>
          {getWeatherIcon(current.temperature, current.precipitationProbability)}
        </div>
        <div>
          <div style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1', marginBottom: '0.5rem' }}>{Math.round(current.temperature)}°C</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '8px', display: 'inline-block' }}>
            💧 Humidity: {current.humidity}% | 🌧️ Rain: {current.precipitationProbability}%
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', marginTop: 'auto', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Next {forecast.length} Days Forecast</h3>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'space-between' }}>
        {forecast.map((day, idx) => (
          <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '16px', flex: 1, textAlign: 'center', transition: 'transform 0.2s' }}>
            <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-muted)' }}>{day.day}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', margin: '5px 0' }}>{Math.round(day.temp)}°</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 8px', borderRadius: '6px', display: 'inline-block', marginTop: '5px' }}>{day.rainChance}% rain</div>
          </div>
        ))}
      </div>
    </div>
  );
}
