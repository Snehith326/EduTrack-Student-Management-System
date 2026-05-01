import React, { useState, useEffect } from 'react';
import { createQuizAPI, getAllQuizzesAPI } from '../services/api';

const emptyQuestion = { question: '', options: ['', '', '', ''], correctAnswer: 0 };

export default function AdminQuiz() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [questions, setQuestions] = useState([{ ...emptyQuestion, options: ['', '', '', ''] }]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pastQuizzes, setPastQuizzes] = useState([]);
  const [loadingPast, setLoadingPast] = useState(true);
  const [expandedQuiz, setExpandedQuiz] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllQuizzesAPI();
        setPastQuizzes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPast(false);
      }
    };
    load();
  }, [success]);

  const addQuestion = () => {
    if (questions.length >= 5) return;
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const removeQuestion = (idx) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIdx, oIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate all fields filled
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return setError(`Question ${i + 1} is empty`);
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) return setError(`Question ${i + 1}, Option ${String.fromCharCode(65 + j)} is empty`);
      }
    }

    setSubmitting(true);
    try {
      await createQuizAPI({ date, questions });
      setSuccess(`✅ Quiz for ${new Date(date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })} created successfully!`);
      setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>⚙️ Manage Quizzes</h1>
          <p style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>Create daily quizzes for all students</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
        {/* ── Quiz Builder ────────────────────── */}
        <div>
          <div className="card animate-in" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>📅 Quiz Date</h3>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{ maxWidth: '220px' }}
            />
          </div>

          {success && <div className="alert alert-success animate-in" style={{ marginBottom: '1rem' }}>{success}</div>}
          {error && <div className="alert alert-error animate-in" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="card animate-in" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
                {/* Question header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.85rem', fontWeight: 700, color: 'white',
                    }}>
                      {qIdx + 1}
                    </div>
                    <h3>Question {qIdx + 1}</h3>
                  </div>
                  {questions.length > 1 && (
                    <button type="button" className="btn btn-danger btn-icon" onClick={() => removeQuestion(qIdx)} title="Remove question">✕</button>
                  )}
                </div>

                {/* Question text */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Question *</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Enter your question here..."
                    value={q.question}
                    onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Options */}
                <div className="form-group">
                  <label className="form-label">Options (mark the correct answer)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.35rem' }}>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Radio to mark correct */}
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correctAnswer === oIdx}
                          onChange={() => updateQuestion(qIdx, 'correctAnswer', oIdx)}
                          style={{ accentColor: '#22c55e', width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0 }}
                          title="Mark as correct answer"
                        />
                        {/* Option label */}
                        <span style={{
                          width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0,
                          background: q.correctAnswer === oIdx ? 'rgba(34,197,94,0.15)' : 'var(--glass-bg)',
                          border: `1px solid ${q.correctAnswer === oIdx ? 'rgba(34,197,94,0.4)' : 'var(--glass-border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.78rem', fontWeight: 700,
                          color: q.correctAnswer === oIdx ? '#22c55e' : 'var(--text-muted)',
                        }}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <input
                          className="form-input"
                          style={{ flex: 1, borderColor: q.correctAnswer === oIdx ? 'rgba(34,197,94,0.4)' : 'var(--glass-border)' }}
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                          value={opt}
                          onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                          required
                        />
                        {q.correctAnswer === oIdx && (
                          <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600, whiteSpace: 'nowrap' }}>✓ Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Add question + Submit */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={addQuestion}
                disabled={questions.length >= 5}
                style={{ flex: 1 }}
              >
                ➕ Add Question {questions.length < 5 ? `(${questions.length}/5)` : '(Max 5)'}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || questions.length < 3}
                style={{ flex: 1 }}
              >
                {submitting ? '⏳ Creating...' : questions.length < 3 ? `Need ${3 - questions.length} more` : '✅ Create Quiz'}
              </button>
            </div>
            {questions.length < 3 && (
              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                Minimum 3 questions required
              </p>
            )}
          </form>
        </div>

        {/* ── Past Quizzes ─────────────────────── */}
        <div className="card animate-in" style={{ padding: '1.5rem', position: 'sticky', top: '1rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>📋 Past Quizzes</h3>
          {loadingPast ? (
            [...Array(3)].map((_, i) => <div key={i} style={{ height: '52px', marginBottom: '0.65rem' }} className="skeleton" />)
          ) : pastQuizzes.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem', padding: '1rem' }}>No quizzes yet</p>
          ) : (
            <div style={{ maxHeight: '520px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pastQuizzes.map((q) => {
                const isToday = new Date(q.date).toDateString() === new Date().toDateString();
                const isExpanded = expandedQuiz === q._id;
                return (
                  <div key={q._id} style={{
                    borderRadius: '10px', border: `1px solid ${isToday ? 'rgba(99,102,241,0.4)' : 'var(--glass-border)'}`,
                    background: isToday ? 'rgba(99,102,241,0.06)' : 'var(--glass-bg)',
                    overflow: 'hidden',
                  }}>
                    <div
                      onClick={() => setExpandedQuiz(isExpanded ? null : q._id)}
                      style={{ padding: '0.85rem 1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {new Date(q.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {isToday && <span className="badge badge-primary" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>Today</span>}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.questions.length} questions</p>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{isExpanded ? '▲' : '▼'}</span>
                    </div>
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid var(--border)', padding: '0.75rem 1rem' }}>
                        {q.questions.map((ques, i) => (
                          <div key={i} style={{ marginBottom: '0.65rem' }}>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>Q{i + 1}. {ques.question}</p>
                            <p style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '0.2rem' }}>
                              ✓ {ques.options[ques.correctAnswer]}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
