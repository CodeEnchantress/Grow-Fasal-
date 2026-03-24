"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid phone number or password. Tip: use 1234 as password.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--accent-blue)' }}>Login / Register</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Phone Number</label>
            <input 
              type="text" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="+91 9999999999" 
              className="location-input" 
              style={{ width: '100%', boxSizing: 'border-box' }}
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password (Use 1234)</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="location-input" 
              style={{ width: '100%', boxSizing: 'border-box' }}
              required 
            />
          </div>
          {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
          <button type="submit" className="analyze-btn" disabled={loading} style={{ marginTop: '1rem', width: '100%' }}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
