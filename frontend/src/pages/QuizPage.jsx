import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodayQuizAPI, submitQuizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function QuizPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState('intro');   // intro | quiz | result
  const [answers, setAnswers] = useState([]);  // selected option index per question
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTodayQuizAPI();
      setQuiz(res.data);
      setAnswers(new Array(res.data.questions.length).fill(null));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadQuiz(); }, [loadQuiz]);

  // Countdown timer while quiz is active
  useEffect(() => {
    if (step !== 'quiz') return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const t = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(t);
  }, [step, timeLeft]);

  const startQuiz = () => {
    setStep('quiz');
    setCurrentQ(0);
    setTimeLeft(quiz.questions.length * 60); // 1 min per question
  };

  const selectOption = (idx) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentQ] = idx;
      return updated;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await submitQuizAPI({ quizId: quiz._id, answers });
      setResult(res.data);
      updateUser({ streak: res.data.streak, quizzesTaken: (user?.quizzesTaken || 0) + 1 });
      setStep('result');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
      setStep('intro');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const progress = quiz ? ((currentQ + 1) / quiz.questions.length) * 100 : 0;
  const allAnswered = answers.every((a) => a !== null);

  // ── Loading ──────────────────────────────────
  if (loading) {
    return (
      <div className="page" style={{ maxWidth: '720px' }}>
        <div style={{ height: '400px' }} className="skeleton" />
      </div>
    );
  }

  // ── INTRO SCREEN ─────────────────────────────
  if (step === 'intro') {
    return (
      <div className="page" style={{ maxWidth: '720px' }}>
        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

        {quiz?.alreadyAttempted ? (
          <AlreadyAttempted result={quiz.attemptDetails} navigate={navigate} user={user} />
        ) : !quiz ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>😴</div>
            <h2>No Quiz Today</h2>
            <p style={{ marginTop: '0.5rem' }}>Check back later or ask your admin to create one.</p>
            <button className="btn btn-ghost" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/dashboard')}>← Dashboard</button>
          </div>
        ) : (
          <div className="card animate-in" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
            <h1 style={{ marginBottom: '0.5rem' }}>Daily Quiz</h1>
            <p style={{ marginBottom: '2rem' }}>
              {new Date(quiz.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>

            {/* Quiz meta */}
            <div style={metaRow}>
              <MetaTile icon="❓" value={`${quiz.questions.length}`} label="Questions" />
              <MetaTile icon="⏱️" value={`${quiz.questions.length} min`} label="Time Limit" />
              <MetaTile icon="🔥" value={`${user?.streak || 0}`} label="Current Streak" />
            </div>

            {/* Streak banner */}
            {user?.streak > 0 && (
              <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                🔥 You're on a <strong>{user.streak}-day streak</strong>! Keep it going!
              </div>
            )}

            <button className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 3rem' }} onClick={startQuiz}>
              🚀 Start Quiz
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── QUIZ SCREEN ───────────────────────────────
  if (step === 'quiz') {
    const q = quiz.questions[currentQ];
    const isLast = currentQ === quiz.questions.length - 1;
    const urgent = timeLeft <= 30;

    return (
      <div className="page" style={{ maxWidth: '720px' }}>
        {/* Progress header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Question {currentQ + 1} of {quiz.questions.length}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: urgent ? '#ef4444' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ⏱️ {formatTime(timeLeft)}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          {/* Question dots */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '0.6rem' }}>
            {quiz.questions.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentQ(i)}
                style={{
                  width: '8px', height: '8px', borderRadius: '50%', cursor: 'pointer',
                  background: i === currentQ ? '#6366f1' : answers[i] !== null ? '#22c55e' : 'var(--glass-border)',
                  transition: 'background 0.2s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Question card */}
        <div className="card animate-in" style={{ padding: '2.5rem' }}>
          <h2 style={{ marginBottom: '2rem', lineHeight: 1.5 }}>{q.question}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {q.options.map((opt, idx) => {
              const isSelected = answers[currentQ] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => selectOption(idx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1.1rem 1.25rem', borderRadius: '12px', cursor: 'pointer',
                    border: `1px solid ${isSelected ? '#6366f1' : 'var(--glass-border)'}`,
                    background: isSelected ? 'rgba(99,102,241,0.12)' : 'var(--glass-bg)',
                    color: isSelected ? '#818cf8' : 'var(--text-secondary)',
                    fontSize: '0.95rem', fontFamily: 'Outfit', textAlign: 'left',
                    transition: 'all 0.18s', width: '100%',
                  }}
                >
                  <span style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: isSelected ? '#6366f1' : 'var(--glass-bg)',
                    border: `1px solid ${isSelected ? '#6366f1' : 'var(--glass-border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700,
                    color: isSelected ? 'white' : 'var(--text-muted)',
                  }}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
            <button className="btn btn-ghost" disabled={currentQ === 0} onClick={() => setCurrentQ(currentQ - 1)}>
              ← Previous
            </button>
            {isLast ? (
              <button
                className="btn btn-primary"
                disabled={!allAnswered || submitting}
                onClick={handleSubmit}
                style={{ minWidth: '140px' }}
              >
                {submitting ? '⏳ Submitting...' : '✅ Submit Quiz'}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setCurrentQ(currentQ + 1)}>
                Next →
              </button>
            )}
          </div>
          {isLast && !allAnswered && (
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              ⚠️ Answer all questions before submitting
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── RESULT SCREEN ─────────────────────────────
  if (step === 'result' && result) {
    const { score, totalQuestions, percentage, streak, results } = result;
    const emoji = percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '😅';
    const color = percentage >= 80 ? '#22c55e' : percentage >= 50 ? '#6366f1' : '#ef4444';

    return (
      <div className="page animate-in" style={{ maxWidth: '720px' }}>
        {/* Score header */}
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.75rem' }}>{emoji}</div>
          <h1 style={{ marginBottom: '0.5rem' }}>Quiz Complete!</h1>

          <div style={{
            width: '120px', height: '120px', borderRadius: '50%', margin: '1.5rem auto',
            background: `conic-gradient(${color} ${percentage * 3.6}deg, var(--glass-bg) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 30px ${color}40`,
          }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{percentage}%</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{score}/{totalQuestions}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1.25rem', color }}>{score}/{totalQuestions}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Correct</p>
            </div>
            <div style={{ width: '1px', background: 'var(--border)' }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: '1.25rem', color: '#f59e0b' }}>🔥 {streak}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Day Streak</p>
            </div>
          </div>
        </div>

        {/* Answer breakdown */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>📋 Answer Review</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {results.map((r, i) => (
              <div key={i} style={{ padding: '1rem', borderRadius: '10px', background: r.isCorrect ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)', border: `1px solid ${r.isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{r.isCorrect ? '✅' : '❌'}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Q{i + 1}. {r.question}</p>
                    {!r.isCorrect && (
                      <p style={{ fontSize: '0.8rem', color: '#f87171' }}>
                        Your answer: <strong>{quiz.questions[i].options[r.selectedAnswer]}</strong>
                      </p>
                    )}
                    <p style={{ fontSize: '0.8rem', color: '#4ade80' }}>
                      {r.isCorrect ? 'Correct!' : `Correct: ${quiz.questions[i].options[r.correctAnswer]}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate('/dashboard')}>
            📊 Dashboard
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/analytics')}>
            📈 My Progress
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function MetaTile({ icon, value, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{icon}</div>
      <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{value}</p>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}

function AlreadyAttempted({ result, navigate, user }) {
  return (
    <div className="card animate-in" style={{ padding: '3rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
      <h2 style={{ marginBottom: '0.5rem' }}>Already Done!</h2>
      <p style={{ marginBottom: '1.5rem' }}>You've already completed today's quiz. Come back tomorrow!</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', padding: '1.5rem', background: 'var(--glass-bg)', borderRadius: '12px' }}>
        <div><p style={{ fontWeight: 700, fontSize: '1.25rem' }}>{user?.streak || 0}</p><p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🔥 Streak</p></div>
        <div><p style={{ fontWeight: 700, fontSize: '1.25rem' }}>{user?.quizzesTaken || 0}</p><p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Quizzes</p></div>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>📊 Dashboard</button>
        <button className="btn btn-primary" onClick={() => navigate('/analytics')}>📈 My Progress</button>
      </div>
    </div>
  );
}

const metaRow = {
  display: 'flex', justifyContent: 'center', gap: '3rem',
  margin: '1.5rem auto 2rem', padding: '1.25rem',
  background: 'var(--glass-bg)', borderRadius: '14px', border: '1px solid var(--glass-border)',
};
