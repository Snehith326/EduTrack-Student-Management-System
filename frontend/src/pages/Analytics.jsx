import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudentAnalyticsAPI } from '../services/api';

export default function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getStudentAnalyticsAPI(user.id);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) load();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="page">
        <div style={{ height: '2rem', width: '200px', marginBottom: '2rem' }} className="skeleton" />
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ height: '110px' }} className="skeleton" />)}
        </div>
        <div style={{ height: '260px' }} className="skeleton" />
      </div>
    );
  }

  const { scoreHistory = [], avgScore = 0, participationPct = 0 } = data || {};
  const totalAttempts = scoreHistory.length;
  const best = totalAttempts > 0 ? Math.max(...scoreHistory.map((s) => s.percentage)) : 0;

  // Group by performance tier
  const excellent = scoreHistory.filter((s) => s.percentage >= 80).length;
  const average   = scoreHistory.filter((s) => s.percentage >= 50 && s.percentage < 80).length;
  const poor      = scoreHistory.filter((s) => s.percentage < 50).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>📈 My Progress</h1>
          <p style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>Track your learning journey and quiz performance</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-4 animate-in" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ '--gradient': 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>📝</div>
          <div className="stat-value">{totalAttempts}</div>
          <div className="stat-label">Total Attempts</div>
        </div>
        <div className="stat-card" style={{ '--gradient': 'linear-gradient(135deg, #22c55e, #4ade80)' }}>
          <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.15)' }}>📊</div>
          <div className="stat-value">{avgScore}%</div>
          <div className="stat-label">Average Score</div>
        </div>
        <div className="stat-card" style={{ '--gradient': 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>🏅</div>
          <div className="stat-value">{best}%</div>
          <div className="stat-label">Best Score</div>
        </div>
        <div className="stat-card" style={{ '--gradient': 'linear-gradient(135deg, #ec4899, #f472b6)' }}>
          <div className="stat-icon" style={{ background: 'rgba(236,72,153,0.15)' }}>🎯</div>
          <div className="stat-value">{participationPct}%</div>
          <div className="stat-label">Participation</div>
        </div>
      </div>

      {totalAttempts === 0 ? (
        <div className="card empty-state animate-in">
          <div className="empty-state-icon">📊</div>
          <h3>No attempts yet</h3>
          <p style={{ marginTop: '0.5rem' }}>Complete your first daily quiz to see your analytics!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          {/* Score History Chart */}
          <div className="card animate-in" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>📈 Score Over Time</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px', marginBottom: '1rem' }}>
              {scoreHistory.map((d, i) => {
                const h = Math.max((d.percentage / 100) * 100, 2);
                const color = d.percentage >= 80 ? '#22c55e' : d.percentage >= 50 ? '#6366f1' : '#ef4444';
                return (
                  <div key={i} title={`${d.percentage}%`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', gap: '4px' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                      <div style={{ width: '100%', height: `${h}%`, minHeight: '4px', background: color, borderRadius: '4px 4px 0 0', opacity: 0.85, transition: 'height 0.5s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Average line indicator */}
            <div className="progress-bar" style={{ marginBottom: '0.5rem' }}>
              <div className="progress-fill" style={{ width: `${avgScore}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>0%</span>
              <span>Average: {avgScore}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Performance Breakdown */}
            <div className="card animate-in" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem' }}>🎯 Performance Breakdown</h3>
              <BreakdownBar label="Excellent (≥80%)" count={excellent} total={totalAttempts} color="#22c55e" />
              <BreakdownBar label="Average (50–79%)" count={average} total={totalAttempts} color="#6366f1" />
              <BreakdownBar label="Needs Work (<50%)" count={poor} total={totalAttempts} color="#ef4444" />
            </div>

            {/* Streak info */}
            <div className="card animate-in" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔥</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: user?.streak > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
                {user?.streak || 0}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Day Streak</p>
              {user?.streak >= 7 && (
                <div className="badge badge-warning" style={{ marginTop: '0.75rem' }}>🏅 7-Day Champion!</div>
              )}
              {user?.streak === 0 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>Take a quiz to start your streak!</p>
              )}
            </div>

            {/* Recent 3 */}
            <div className="card animate-in" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>🗒️ Recent Quizzes</h3>
              {[...scoreHistory].reverse().slice(0, 3).map((a, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {new Date(a.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.score}/{a.totalQuestions} correct</p>
                  </div>
                  <span style={{
                    padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700,
                    background: a.percentage >= 80 ? 'rgba(34,197,94,0.15)' : a.percentage >= 50 ? 'rgba(99,102,241,0.15)' : 'rgba(239,68,68,0.15)',
                    color: a.percentage >= 80 ? '#22c55e' : a.percentage >= 50 ? '#818cf8' : '#f87171',
                  }}>
                    {a.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BreakdownBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color }}>{count} ({pct}%)</span>
      </div>
      <div className="progress-bar">
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '9999px', transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}
