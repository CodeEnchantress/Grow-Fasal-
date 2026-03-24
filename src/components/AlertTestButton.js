"use client";
import { useState } from 'react';

export default function AlertTestButton({ phone }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleAlert = async () => {
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPhone: phone,
          message: "Grow Fasal Alert: Extreme weather warning (Heavy Rain) expected in your area tomorrow. Please delay pesticide spraying."
        })
      });
      const data = await res.json();
      if (res.ok) setStatus("✅ " + data.message);
      else setStatus("❌ " + data.error);
    } catch (err) {
      setStatus("❌ " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px' }}>
      <h3 style={{ color: '#fca5a5', marginBottom: '0.5rem' }}>⚠️ Proactive Alerts</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
        You will receive SMS alerts for extreme weather. Click below to test the SMS system for phone {phone}.
      </p>
      <button onClick={handleAlert} disabled={loading} className="btn" style={{ borderColor: '#ef4444', color: '#fca5a5', background: 'transparent' }}>
        {loading ? "Sending..." : "Send Test Alert"}
      </button>
      {status && <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: status.startsWith('✅') ? '#86efac' : '#fca5a5' }}>{status}</div>}
    </div>
  );
}
