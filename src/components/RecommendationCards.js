export default function RecommendationCards({ recommendations }) {
  if (!recommendations) return null;

  const cards = [
    { title: "Crop Recommendation", icon: "🌾", text: recommendations.cropRecommendation, color: "var(--accent-yellow)" },
    { title: "Irrigation Advice", icon: "💧", text: recommendations.irrigationAdvice, color: "var(--accent-blue)" },
    { title: "Pesticide & Fertilizer Alert", icon: "🛡️", text: recommendations.pesticideAlert, color: recommendations.pesticideAlert.includes("ALERT") ? "var(--accent-red)" : "var(--accent-green)" },
    { title: "General Care Tips", icon: "🌱", text: recommendations.careTips, color: "var(--accent-green)" }
  ];

  return (
    <div className="recommendations-grid">
      {cards.map((card, idx) => (
        <div key={idx} className="glass-panel animate-fade-in" style={{ animationDelay: `${0.3 + idx * 0.1}s`, borderTop: `4px solid ${card.color}`, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <span style={{ fontSize: '2.5rem', filter: `drop-shadow(0 0 10px ${card.color}40)` }}>{card.icon}</span>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>{card.title}</h3>
          </div>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: '1.7', flex: 1 }}>
            {card.text}
          </p>
        </div>
      ))}
    </div>
  );
}
