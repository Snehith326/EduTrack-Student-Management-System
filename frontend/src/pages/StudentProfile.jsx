import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentByIdAPI, getStudentAnalyticsAPI } from '../services/api';

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, analyticsRes] = await Promise.all([
          getStudentByIdAPI(id),
          getStudentAnalyticsAPI(id),
        ]);
        setData(profileRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <div style={{ height: '200px' }} className="skeleton" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page empty-state">
        <div className="empty-state-icon">❌</div>
        <h3>Student not found</h3>
        <button className="btn btn-ghost" style={{ marginTop: '1rem' }} onClick={() => navigate('/students')}>← Back</button>
      </div>
    );
  }

  const { student, avgScore } = data;
  const scoreHistory = analytics?.scoreHistory || [];

  // Streak indicator
  const streakColor = student.streak >= 7 ? '#22c55e' : student.streak >= 3 ? '#f59e0b' : student.streak > 0 ? '#6366f1' : '#64748b';

  return (
    <div className="page">
      {/* Back button */}
      <button className="btn btn-ghost" style={{ marginBottom: '1.5rem' }} onClick={() => navigate('/students')}>
        ← Back to Students
      </button>

      {/* Profile Header */}
      <div className="card animate-in" style={{ padding: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #ec4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.75rem', fontWeight: 800, color: 'white', flexShrink: 0,
        }}>
          {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ marginBottom: '0.25rem' }}>{student.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            📧 {student.email} · 🎓 {student.course} · 📅 Year {student.year}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge badge-primary">Roll: {student.rollNumber}</span>
            <span className="badge badge-muted">{student.course}</span>
            <span className="badge badge-muted">Year {student.year}</span>
            <span style={{ ...badgeStyle, background: `${streakColor}20`, color: streakColor, border: `1px solid ${streakColor}30` }}>
              🔥 {student.streak} day streak
            </span>
          </div>
        </div>
        {student.streak >= 7 && (
          <div style={{ textAlign: 'center', padding: '1rem 1.5rem', background: 'rgba(245,158,11,0.1)', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: '2rem' }}>🏅</div>
            <p style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600 }}>Week Streak!</p>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid-4 animate-in" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ '--gradient': 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}><span>📝</span></div>
          <div className="stat-value">{student.quizzesTaken}</div>
          <div className="stat-label">Quizzes Taken</div>
        </div>
        <div className="stat-card" style={{ '--gradient': 'linear-gradient(135deg, #22c55e, #4ade80)' }}>
          <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.15)' }}><span>📊</span></div>
          <div className="stat-value">{avgScore}%</div>
          <div className="stat-label">Average Score</div>
        </div>
        <div className="stat-card" style={{ '--gradient': 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}><span>🔥</span></div>
          <div className="stat-value">{student.streak}</div>
          <div className="stat-label">Current Streak</div>
        </div>
        <div className="stat-card" style={{ '--gradient': 'linear-gradient(135deg, #ec4899, #f472b6)' }}>
          <div className="stat-icon" style={{ background: 'rgba(236,72,153,0.15)' }}><span>🎯</span></div>
          <div className="stat-value">{analytics?.participationPct || 0}%</div>
          <div className="stat-label">Participation</div>
        </div>
      </div>

      {/* Score History + Attempt Log */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Score History Chart */}
        <div className="card animate-in" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>📈 Score History</h3>
          {scoreHistory.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>No quiz attempts yet.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '130px', marginBottom: '0.75rem' }}>
                {scoreHistory.map((d, i) => {
                  const height = Math.max((d.percentage / 100) * 100, 4);
                  const color = d.percentage >= 80 ? '#22c55e' : d.percentage >= 50 ? '#6366f1' : '#ef4444';
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%' }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                        <div
                          title={`${d.percentage}% on ${new Date(d.date).toLocaleDateString()}`}
                          style={{ width: '100%', height: `${height}%`, minHeight: '4px', background: color, borderRadius: '4px 4px 0 0', opacity: 0.85 }}
                        />
                      </div>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                        {new Date(d.date).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 10, height: 10, background: '#22c55e', borderRadius: 2, display: 'inline-block' }} /> ≥80%</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 10, height: 10, background: '#6366f1', borderRadius: 2, display: 'inline-block' }} /> 50–79%</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: 2, display: 'inline-block' }} /> &lt;50%</span>
              </div>
            </>
          )}
        </div>

        {/* Recent Attempts */}
        <div className="card animate-in" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>🗒️ Recent Attempts</h3>
          {scoreHistory.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}><p>No attempts yet.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '280px', overflowY: 'auto' }}>
              {[...scoreHistory].reverse().map((a, i) => (
                <div key={i} style={attemptRow}>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {new Date(a.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {a.score}/{a.totalQuestions} correct
                    </p>
                  </div>
                  <div style={scoreChip(a.percentage)}>
                    {a.percentage}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const badgeStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
  padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600,
};

const attemptRow = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '0.65rem 0', borderBottom: '1px solid var(--border)',
};

const scoreChip = (pct) => ({
  padding: '0.25rem 0.7rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700,
  background: pct >= 80 ? 'rgba(34,197,94,0.15)' : pct >= 50 ? 'rgba(99,102,241,0.15)' : 'rgba(239,68,68,0.15)',
  color: pct >= 80 ? '#22c55e' : pct >= 50 ? '#818cf8' : '#f87171',
});
