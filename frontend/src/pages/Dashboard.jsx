import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStatsAPI, getLeaderboardAPI, getStudentAnalyticsAPI } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myAnalytics, setMyAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const lb = await getLeaderboardAPI();
        setLeaderboard(lb.data.slice(0, 5));

        if (isAdmin) {
          const s = await getDashboardStatsAPI();
          setStats(s.data);
        } else {
          const an = await getStudentAnalyticsAPI(user.id);
          setMyAnalytics(an.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isAdmin, user?.id]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>
            {isAdmin ? '📊 Admin Dashboard' : `👋 Welcome, ${user?.name?.split(' ')[0]}!`}
          </h1>
          <p style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {!isAdmin && (
          <button className="btn btn-primary" onClick={() => navigate('/quiz')}>
            📝 Take Today's Quiz
          </button>
        )}
      </div>

      {/* ── Admin Stats Cards ─────────────────── */}
      {isAdmin && stats && (
        <div className="grid-4 animate-in" style={{ marginBottom: '2rem' }}>
          <StatCard
            icon="👥"
            value={stats.totalStudents}
            label="Total Students"
            gradient="linear-gradient(135deg, #6366f1, #818cf8)"
            color="#6366f1"
            onClick={() => navigate('/students')}
          />
          <StatCard
            icon="📝"
            value={stats.quizzesToday}
            label="Quizzes Today"
            gradient="linear-gradient(135deg, #ec4899, #f472b6)"
            color="#ec4899"
          />
          <StatCard
            icon="🏆"
            value={stats.topPerformer?.name?.split(' ')[0] || '—'}
            label={`Top Scorer · ${stats.topPerformer?.avgScore || 0}% avg`}
            gradient="linear-gradient(135deg, #f59e0b, #fbbf24)"
            color="#f59e0b"
            onClick={() => stats.topPerformer && navigate(`/students/${stats.topPerformer._id}`)}
          />
          <StatCard
            icon="🔥"
            value={`${stats.highestStreakStudent?.streak || 0} days`}
            label={`Best Streak · ${stats.highestStreakStudent?.name?.split(' ')[0] || '—'}`}
            gradient="linear-gradient(135deg, #22c55e, #4ade80)"
            color="#22c55e"
          />
        </div>
      )}

      {/* ── Student Personal Stats ──────────────── */}
      {!isAdmin && (
        <div className="grid-4 animate-in" style={{ marginBottom: '2rem' }}>
          <StatCard
            icon="🔥"
            value={`${user?.streak || 0}`}
            label="Day Streak"
            gradient="linear-gradient(135deg, #f59e0b, #ef4444)"
            color="#f59e0b"
          />
          <StatCard
            icon="📝"
            value={user?.quizzesTaken || 0}
            label="Quizzes Taken"
            gradient="linear-gradient(135deg, #6366f1, #818cf8)"
            color="#6366f1"
          />
          <StatCard
            icon="📊"
            value={myAnalytics?.avgScore ? `${myAnalytics.avgScore}%` : '—'}
            label="Avg Score"
            gradient="linear-gradient(135deg, #22c55e, #4ade80)"
            color="#22c55e"
          />
          <StatCard
            icon="🎯"
            value={myAnalytics?.participationPct ? `${myAnalytics.participationPct}%` : '—'}
            label="Participation"
            gradient="linear-gradient(135deg, #ec4899, #f472b6)"
            color="#ec4899"
          />
        </div>
      )}

      {/* ── Missed Reminder Banner ──────────────── */}
      {!isAdmin && user?.streak === 0 && (
        <div
          className="alert alert-error animate-in"
          style={{ marginBottom: '1.5rem', cursor: 'pointer' }}
          onClick={() => navigate('/quiz')}
        >
          <span>⚠️</span>
          <span>You missed yesterday's quiz! Take today's quiz to start a new streak.</span>
          <span style={{ marginLeft: 'auto', opacity: 0.7 }}>→</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        {/* ── Score History Chart (student) ──── */}
        {!isAdmin && myAnalytics?.scoreHistory?.length > 0 && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>📈 Score History</h3>
            <MiniChart data={myAnalytics.scoreHistory} />
          </div>
        )}

        {/* ── Recent Attempts (admin) ─────────── */}
        {isAdmin && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>📋 Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <ActionButton icon="➕" label="Add New Student" onClick={() => navigate('/students')} />
              <ActionButton icon="📝" label="Create Today's Quiz" onClick={() => navigate('/admin/quiz')} />
              <ActionButton icon="📊" label="View Analytics" onClick={() => navigate('/students')} />
              <ActionButton icon="🏆" label="Leaderboard" onClick={() => navigate('/leaderboard')} />
            </div>
          </div>
        )}

        {/* ── Mini Leaderboard ─────────────────── */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3>🏆 Top Students</h3>
            <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }} onClick={() => navigate('/leaderboard')}>
              See All
            </button>
          </div>
          {leaderboard.map((s, i) => (
            <div
              key={s._id}
              style={styles.leaderItem}
              onClick={() => isAdmin && navigate(`/students/${s._id}`)}
            >
              <span style={styles.rank(i)}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
              <div style={styles.leaderAvatar}>{s.name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{s.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.course}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b' }}>🔥 {s.streak}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.quizzesTaken} quizzes</p>
              </div>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem', fontSize: '0.9rem' }}>No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────
function StatCard({ icon, value, label, gradient, color, onClick }) {
  return (
    <div
      className="stat-card animate-in"
      style={{ '--gradient': gradient, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <div className="stat-icon" style={{ background: `${color}20` }}>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.85rem 1rem', borderRadius: '10px', width: '100%',
        background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
        color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem',
        fontFamily: 'Outfit', transition: 'all 0.2s', textAlign: 'left',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass-hover)'; e.currentTarget.style.color = 'white'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
    >
      <span>{icon}</span> {label}
    </button>
  );
}

function MiniChart({ data }) {
  const max = Math.max(...data.map((d) => d.percentage), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px' }}>
      {data.slice(-12).map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
            <div
              style={{
                width: '100%',
                height: `${(d.percentage / max) * 100}%`,
                minHeight: '4px',
                background: d.percentage >= 80
                  ? 'linear-gradient(0deg, #22c55e, #4ade80)'
                  : d.percentage >= 50
                  ? 'linear-gradient(0deg, #6366f1, #818cf8)'
                  : 'linear-gradient(0deg, #ef4444, #f87171)',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.5s ease',
              }}
              title={`${d.percentage}%`}
            />
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="page">
      <div style={{ height: '2.5rem', width: '300px', marginBottom: '2rem' }} className="skeleton" />
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ height: '120px' }} className="skeleton" />
        ))}
      </div>
    </div>
  );
}

const styles = {
  leaderItem: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.65rem 0', borderBottom: '1px solid var(--border)',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  rank: (i) => ({
    fontSize: i < 3 ? '1.2rem' : '0.85rem',
    fontWeight: 700,
    color: i < 3 ? '' : 'var(--text-muted)',
    width: '28px', textAlign: 'center', flexShrink: 0,
  }),
  leaderAvatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #ec4899)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.85rem', fontWeight: 700, color: 'white', flexShrink: 0,
  },
};
