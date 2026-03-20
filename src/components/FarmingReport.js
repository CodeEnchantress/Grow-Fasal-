export default function FarmingReport({ report }) {
  if (!report) return null;

  const { regionInfo, seasonContext, cropRecommendations, longTermForecast, advisory } = report;

  return (
    <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.3s', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '1.8rem', color: 'var(--accent-blue)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>📊</span> 6-Month Climatology & Farming Report
      </h2>

      {/* Region & Season Context */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '2.5rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Geographic Region</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--text-main)', lineHeight: '1.2' }}>{regionInfo.name}</div>
          <div style={{ fontSize: '1rem', color: 'var(--accent-yellow)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><span>⛅</span> {regionInfo.climate}</div>
          <div style={{ fontSize: '0.95rem', color: '#a8a29e', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><span>🪴</span> Soil: {regionInfo.soil}</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Seasonal Cycle</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--text-main)', lineHeight: '1.2' }}>Current: {seasonContext.current}</div>
          <div style={{ fontSize: '1.05rem', color: 'var(--accent-green)', marginTop: '8px' }}>Upcoming: {seasonContext.upcoming}</div>
        </div>
      </div>

      {/* Crop Recommendations */}
      <h3 style={{ fontSize: '1.35rem', marginBottom: '1.2rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🌾</span> Crop Suitability</h3>
      <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '20px', borderRadius: '16px', marginBottom: '2.5rem' }}>
        <div style={{ marginBottom: '12px', fontSize: '1.1rem' }}>
          <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Current ({seasonContext.current}) Options: </span>
          <span style={{ color: 'var(--text-muted)' }}>{cropRecommendations.current.join(', ') || 'Wait for next season'}</span>
        </div>
        <div style={{ fontSize: '1.1rem' }}>
          <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Plan for {seasonContext.upcoming}: </span>
          <span style={{ color: 'var(--accent-green)' }}>{cropRecommendations.upcoming.join(', ') || 'Land preparation'}</span>
        </div>
      </div>

      {/* 6-Month Weather Trends */}
      <h3 style={{ fontSize: '1.35rem', marginBottom: '1.2rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}><span>📈</span> 6-Month Climatic Trend</h3>
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '2.5rem', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}>
        {longTermForecast.map((month, idx) => (
          <div key={idx} style={{ background: 'rgba(255,255,255,0.04)', padding: '16px 12px', borderRadius: '14px', minWidth: '90px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '1rem', textTransform: 'uppercase' }}>{month.month}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-yellow)' }}>{month.temp}°</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', marginTop: '8px', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 0', borderRadius: '6px' }}>{month.rain}mm</div>
          </div>
        ))}
      </div>

      {/* Long-Term Action Plan */}
      <h3 style={{ fontSize: '1.35rem', marginBottom: '1.2rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}><span>📝</span> Long-Term Action Plan</h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '5px solid var(--accent-blue)', padding: '18px', borderRadius: '0 12px 12px 0', display: 'flex', gap: '15px' }}>
          <div style={{ fontSize: '1.8rem' }}>💧</div>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '6px', fontSize: '1.1rem' }}>Irrigation Strategy</div>
            <div style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{advisory.irrigationPlan}</div>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '5px solid var(--accent-red)', padding: '18px', borderRadius: '0 12px 12px 0', display: 'flex', gap: '15px' }}>
          <div style={{ fontSize: '1.8rem' }}>🛡️</div>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '6px', fontSize: '1.1rem' }}>Pesticide & Sowing Window</div>
            <div style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{advisory.pesticideWindow}</div>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '5px solid var(--accent-green)', padding: '18px', borderRadius: '0 12px 12px 0', display: 'flex', gap: '15px' }}>
          <div style={{ fontSize: '1.8rem' }}>🌱</div>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '6px', fontSize: '1.1rem' }}>General Care</div>
            <div style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{advisory.careTips}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
