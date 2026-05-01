import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('streak'); // streak | score | quizzes

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getLeaderboardAPI();
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sorted = [...students].sort((a, b) => {
    if (sortBy === 'streak') return b.streak - a.streak;
    if (sortBy === 'score') return b.totalScore - a.totalScore;
    return b.quizzesTaken - a.quizzesTaken;
  });

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const medal = (i) => ['🥇', '🥈', '🥉'][i] || `#${i + 1}`;
  const podiumHeight = ['160px', '120px', '100px'];
  const podiumColor = [
    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    'linear-gradient(135deg, #94a3b8, #cbd5e1)',
    'linear-gradient(135deg, #b45309, #d97706)',
  ];

  if (loading) {
    return (
      <div className="page">
        <div style={{ height: '2rem', width: '200px', marginBottom: '2rem' }} className="skeleton" />
        <div style={{ height: '260px', marginBottom: '1.5rem' }} className="skeleton" />
        {[...Array(5)].map((_, i) => <div key={i} style={{ height: '72px', marginBottom: '0.75rem' }} className="skeleton" />)}
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>🏆 Leaderboard</h1>
          <p style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>Top students ranked by streak and performance</p>
        </div>
        {/* Sort tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--glass-bg)', padding: '0.35rem', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
          {[
            { key: 'streak', label: '🔥 Streak' },
            { key: 'score',  label: '📊 Score' },
            { key: 'quizzes',label: '📝 Quizzes' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              style={{
                padding: '0.4rem 0.9rem', borderRadius: '8px', border: 'none',
                background: sortBy === key ? 'var(--primary)' : 'transparent',
                color: sortBy === key ? 'white' : 'var(--text-muted)',
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Outfit', transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {students.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🏆</div>
          <h3>No data yet</h3>
          <p style={{ marginTop: '0.5rem' }}>Students will appear here once they start taking quizzes.</p>
        </div>
      ) : (
        <>
          {/* ── Podium (top 3) ─────────────────── */}
          {top3.length >= 1 && (
            <div className="card animate-in" style={{ padding: '2rem 2rem 0', marginBottom: '1.5rem', overflow: 'hidden' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Top Performers
              </h3>

              {/* Podium layout: 2nd | 1st | 3rd */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '1rem' }}>
                {[top3[1], top3[0], top3[2]].map((s, displayIdx) => {
                  if (!s) return <div key={displayIdx} style={{ width: '120px' }} />;
                  const rankIdx = displayIdx === 0 ? 1 : displayIdx === 1 ? 0 : 2;
                  return (
                    <div
                      key={s._id}
                      onClick={() => isAdmin && navigate(`/students/${s._id}`)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: isAdmin ? 'pointer' : 'default', width: '130px' }}
                    >
                      {/* Avatar */}
                      <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                        <div style={{
                          width: rankIdx === 0 ? '64px' : '52px',
                          height: rankIdx === 0 ? '64px' : '52px',
                          borderRadius: '50%',
                          background: podiumColor[rankIdx],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: rankIdx === 0 ? '1.4rem' : '1.1rem',
                          fontWeight: 800, color: 'white',
                          boxShadow: rankIdx === 0 ? '0 0 24px rgba(245,158,11,0.4)' : 'none',
                        }}>
                          {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ position: 'absolute', bottom: '-4px', right: '-4px', fontSize: '1.1rem' }}>{medal(rankIdx)}</span>
                      </div>

                      <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', textAlign: 'center', marginBottom: '0.2rem' }}>{s.name.split(' ')[0]}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{s.course}</p>

                      {/* Podium block */}
                      <div style={{
                        width: '100%',
                        height: podiumHeight[rankIdx],
                        background: podiumColor[rankIdx],
                        borderRadius: '8px 8px 0 0',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                        opacity: 0.85,
                      }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>🔥 {s.streak}</span>
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)' }}>{s.quizzesTaken} quizzes</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Ranked Table ──────────────────────── */}
          <div className="card animate-in">
            {sorted.map((s, i) => {
              const isMe = s._id === user?.id;
              const avg = s.quizzesTaken > 0 ? Math.round(s.totalScore / s.quizzesTaken) : 0;
              return (
                <div
                  key={s._id}
                  onClick={() => isAdmin && navigate(`/students/${s._id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem 1.5rem',
                    borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none',
                    background: isMe ? 'rgba(99,102,241,0.06)' : 'transparent',
                    cursor: isAdmin ? 'pointer' : 'default',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => { if (isAdmin) e.currentTarget.style.background = 'var(--glass-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isMe ? 'rgba(99,102,241,0.06)' : 'transparent'; }}
                >
                  {/* Rank */}
                  <span style={{ width: '32px', textAlign: 'center', fontSize: i < 3 ? '1.25rem' : '0.85rem', fontWeight: 700, color: i < 3 ? '' : 'var(--text-muted)', flexShrink: 0 }}>
                    {medal(i)}
                  </span>

                  {/* Avatar */}
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, ${['#6366f1','#ec4899','#f59e0b','#22c55e','#06b6d4'][i % 5]}, ${['#818cf8','#f472b6','#fbbf24','#4ade80','#22d3ee'][i % 5]})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 700, color: 'white',
                  }}>
                    {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{s.name}</p>
                      {isMe && <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>You</span>}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.course} · {s.rollNumber}</p>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '1.5rem', flexShrink: 0 }}>
                    <Stat label="Streak" value={`🔥 ${s.streak}`} highlight={s.streak > 0} />
                    <Stat label="Avg Score" value={`${avg}%`} />
                    <Stat label="Quizzes" value={s.quizzesTaken} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div style={{ textAlign: 'right', minWidth: '60px' }}>
      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: highlight ? '#f59e0b' : 'var(--text-primary)' }}>{value}</p>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}
