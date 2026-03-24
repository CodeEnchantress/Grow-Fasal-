import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import AlertTestButton from "../../components/AlertTestButton";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch Farm Profile
  const profile = await prisma.farmProfile.findUnique({
    where: { userId: session.user.id }
  });

  // Fetch Reports History
  const reports = await prisma.report.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: 'var(--accent-green)' }}>Farmer Dashboard</h1>
        <div style={{ color: 'var(--text-muted)' }}>Welcome, {session.user.name || session.user.phone}</div>
      </header>

      <div className="dashboard-grid">
        <div className="glass-panel">
          <h2 style={{ color: 'var(--accent-blue)', marginBottom: '1rem' }}>Farm Profile</h2>
          {profile ? (
            <div>
              <p><strong>Location:</strong> {profile.location}</p>
              <p><strong>Soil Type:</strong> {profile.soilType || 'Not specified'}</p>
              <p><strong>Size:</strong> {profile.size ? `${profile.size} Acres` : 'Not specified'}</p>
              <p><strong>Crops:</strong> {profile.crops || 'Not specified'}</p>
              <AlertTestButton phone={session.user.phone} />
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No farm profile set up yet. When you generate your first report, your location will be saved.
              <AlertTestButton phone={session.user.phone} />
            </div>
          )}
        </div>

        <div className="glass-panel">
          <h2 style={{ color: 'var(--accent-yellow)', marginBottom: '1rem' }}>Advisory History</h2>
          {reports.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {reports.map(report => (
                <li key={report.id} style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', marginBottom: '8px', borderRadius: '8px' }}>
                  <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{report.location}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(report.createdAt).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              You haven't generated any reports yet. Go to the home page to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
