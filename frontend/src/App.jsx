import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import Login         from './pages/Login';
import Dashboard     from './pages/Dashboard';
import StudentList   from './pages/StudentList';
import StudentProfile from './pages/StudentProfile';
import QuizPage      from './pages/QuizPage';
import Analytics     from './pages/Analytics';
import Leaderboard   from './pages/Leaderboard';
import AdminQuiz     from './pages/AdminQuiz';

// ── Route Guards ──────────────────────────────
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '2.5rem' }}>🎓</div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading EduTrack...</p>
    </div>
  );
}

// ── App ───────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected — all roles */}
          <Route path="/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/quiz"         element={<PrivateRoute><QuizPage /></PrivateRoute>} />
          <Route path="/leaderboard"  element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          <Route path="/analytics"    element={<PrivateRoute><Analytics /></PrivateRoute>} />

          {/* Admin only */}
          <Route path="/students"           element={<AdminRoute><StudentList /></AdminRoute>} />
          <Route path="/students/:id"       element={<AdminRoute><StudentProfile /></AdminRoute>} />
          <Route path="/admin/quiz"         element={<AdminRoute><AdminQuiz /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '4rem' }}>🔍</div>
              <h2>Page Not Found</h2>
              <a href="/dashboard" style={{ color: 'var(--primary)' }}>← Back to Dashboard</a>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
