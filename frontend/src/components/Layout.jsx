import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ADMIN = [
  { path: '/dashboard',  icon: '📊', label: 'Dashboard' },
  { path: '/students',   icon: '👥', label: 'Students' },
  { path: '/quiz',       icon: '📝', label: 'Daily Quiz' },
  { path: '/leaderboard',icon: '🏆', label: 'Leaderboard' },
  { path: '/admin/quiz', icon: '⚙️', label: 'Manage Quizzes' },
];

const NAV_STUDENT = [
  { path: '/dashboard',  icon: '📊', label: 'Dashboard' },
  { path: '/quiz',       icon: '📝', label: 'Daily Quiz' },
  { path: '/analytics',  icon: '📈', label: 'My Progress' },
  { path: '/leaderboard',icon: '🏆', label: 'Leaderboard' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const nav = user?.role === 'admin' ? NAV_ADMIN : NAV_STUDENT;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div style={styles.wrapper}>
      {/* ── Sidebar ─────────────────────────── */}
      <aside style={{ ...styles.sidebar, width: collapsed ? '72px' : '240px' }}>
        {/* Brand */}
        <div style={styles.brand}>
          <div style={styles.brandIcon}>🎓</div>
          {!collapsed && (
            <span style={styles.brandText}>EduTrack</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={styles.collapseBtn}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Nav Items */}
        <nav style={styles.nav}>
          {nav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                title={collapsed ? item.label : ''}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                {!collapsed && <span style={styles.navLabel}>{item.label}</span>}
                {isActive && !collapsed && <div style={styles.activeBar} />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div style={{ ...styles.userSection, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div style={styles.avatar}>{initials}</div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={styles.userName}>{user?.name}</p>
              <p style={styles.userRole}>{user?.role === 'admin' ? '👨‍💼 Admin' : '👨‍🎓 Student'}</p>
            </div>
          )}
          <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
            🚪
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────── */}
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    background: 'rgba(7, 11, 24, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1.4rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    minHeight: '72px',
  },
  brandIcon: {
    fontSize: '1.5rem',
    flexShrink: 0,
    width: '36px',
    textAlign: 'center',
  },
  brandText: {
    fontSize: '1.15rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #818cf8, #6366f1)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  collapseBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '1.1rem',
    padding: '0.2rem 0.4rem',
    borderRadius: '4px',
    marginLeft: 'auto',
    flexShrink: 0,
    transition: 'all 0.2s',
    fontWeight: 700,
  },
  nav: {
    flex: 1,
    padding: '0.75rem 0.6rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    overflowY: 'auto',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.65rem 0.85rem',
    borderRadius: '10px',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'all 0.18s',
    textDecoration: 'none',
    position: 'relative',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  navItemActive: {
    background: 'rgba(99,102,241,0.12)',
    color: '#818cf8',
    fontWeight: 600,
  },
  navIcon: {
    fontSize: '1rem',
    flexShrink: 0,
    width: '20px',
    textAlign: 'center',
  },
  navLabel: { flex: 1 },
  activeBar: {
    position: 'absolute',
    right: '8px',
    width: '4px',
    height: '20px',
    background: 'var(--primary)',
    borderRadius: '2px',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
    padding: '1rem 0.75rem',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    minHeight: '72px',
    overflow: 'hidden',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #ec4899)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'white',
    flexShrink: 0,
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    margin: 0,
  },
  userRole: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    margin: '0.1rem 0 0',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.3rem',
    borderRadius: '6px',
    opacity: 0.7,
    transition: 'opacity 0.2s',
    flexShrink: 0,
  },
  main: {
    marginLeft: '240px',
    flex: 1,
    minHeight: '100vh',
    transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  },
};
